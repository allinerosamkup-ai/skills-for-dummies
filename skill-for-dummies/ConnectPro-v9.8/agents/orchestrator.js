const { runAnalyzer } = require('./analyzer');
const { runPlanner } = require('./planner');
const { runProvisioner } = require('./provisioner');
const { runValidator } = require('./validator');
const { runSecurityCheck } = require('./security-agent');
const { runConversational } = require('./conversational');
const { getMemory, saveMemory } = require('./memory');
const { Registry } = require('../core/registry');
const { createMCP } = require('../core/mcp');
const { writeEnvFile } = require('../tools/env-writer');
const SurgeWatcher = require('../surge/watcher');

function safeCall(target, method, ...args) {
  if (!target) return null;
  const fn = target[method];
  if (typeof fn !== 'function') return null;
  return fn.apply(target, args);
}

function normalizeCapability(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function toCapabilitySet(mcpEnvelope) {
  const caps = Array.isArray(mcpEnvelope?.capabilities) ? mcpEnvelope.capabilities : [];
  return new Set(caps.map(normalizeCapability).filter(Boolean));
}

function mergeMcpEnvelopes(existing, added) {
  if (!existing) return added;
  if (!added) return existing;

  const existingProxy = Array.isArray(existing.proxyCredentials) ? existing.proxyCredentials : [];
  const addedProxy = Array.isArray(added.proxyCredentials) ? added.proxyCredentials : [];

  const byService = new Map();
  for (const entry of existingProxy) {
    const key = normalizeCapability(entry?.service);
    if (!key) continue;
    byService.set(key, entry);
  }
  for (const entry of addedProxy) {
    const key = normalizeCapability(entry?.service);
    if (!key) continue;
    byService.set(key, entry);
  }

  const capabilities = [...new Set([
    ...(Array.isArray(existing.capabilities) ? existing.capabilities : []),
    ...(Array.isArray(added.capabilities) ? added.capabilities : [])
  ].map(normalizeCapability).filter(Boolean))];

  const proxyCredentials = [...byService.values()];
  const proxyCredential =
    existing.proxyCredential ||
    proxyCredentials[0]?.proxyKey ||
    added.proxyCredential ||
    null;
  const envVariables = [...new Set([
    ...(Array.isArray(existing.envFile?.variables) ? existing.envFile.variables : []),
    ...(Array.isArray(added.envFile?.variables) ? added.envFile.variables : [])
  ])].sort();
  const envFile = envVariables.length > 0
    ? {
        path: added.envFile?.path || existing.envFile?.path || null,
        variables: envVariables
      }
    : null;

  return {
    ...existing,
    ...added,
    id: existing.id || added.id,
    createdAt: existing.createdAt || added.createdAt,
    capabilities,
    proxyCredential,
    proxyCredentials,
    envFile
  };
}

async function runConnectPro(userMessage, userId, options = {}) {
  const registry = new Registry(userId);
  const surge = new SurgeWatcher(userId, { validateEachTask: true });
  safeCall(surge, 'beginSprint', {
    tasks: ['analyze', 'plan', 'provision', 'security', 'validate', 'env_write', 'mcp', 'memory']
  });

  const memory = await getMemory(userId);
  const existingMcp = memory?.connected ? memory.mcp : null;
  const existingCapabilities = toCapabilitySet(existingMcp);

  registry.registerTask("analyze");
  const analysis = await runAnalyzer(userMessage);
  registry.completeTask("analyze");
  safeCall(surge, 'onTaskComplete', 'analyze', { registryStatus: registry.getStatus(), mcp: existingMcp });

  // Incremental behavior: if already connected, only provision missing services/capabilities.
  if (existingMcp) {
    const requestedServices = Array.isArray(analysis?.services) ? analysis.services : [];
    const requestedCapabilities = Array.isArray(analysis?.capabilities) ? analysis.capabilities : [];

    analysis.services = requestedServices
      .map(normalizeCapability)
      .filter((service) => service && !existingCapabilities.has(service));

    analysis.capabilities = requestedCapabilities
      .map(normalizeCapability)
      .filter((capability) => capability && !existingCapabilities.has(capability));

    const noWorkLeft =
      (!analysis.services || analysis.services.length === 0) &&
      (!analysis.capabilities || analysis.capabilities.length === 0);

    if (noWorkLeft) {
      surge.monitor(existingMcp);
      safeCall(surge, 'onTaskComplete', 'noop', { registryStatus: registry.getStatus(), mcp: existingMcp });
      safeCall(surge, 'endSprint', { mcp: existingMcp });
      return {
        success: true,
        mcp: existingMcp,
        envFile: existingMcp.envFile || null,
        message: "Já conectado (todas as capacidades pedidas já existem). Monitorado 24/7 pelo SURGE."
      };
    }
  }

  registry.registerTask("plan");
  const plan = await runPlanner(analysis);
  registry.completeTask("plan");
  safeCall(surge, 'onTaskComplete', 'plan', { registryStatus: registry.getStatus(), mcp: existingMcp });

  registry.registerTask("provision");
  const rawProvision = await runProvisioner(plan, userId, registry);
  registry.completeTask("provision");
  safeCall(surge, 'onTaskComplete', 'provision', { registryStatus: registry.getStatus(), rawProvision });

  registry.registerTask("security");
  const security = await runSecurityCheck(rawProvision);
  registry.completeTask("security");
  safeCall(surge, 'onTaskComplete', 'security', { registryStatus: registry.getStatus(), rawProvision, security });

  registry.registerTask("validate");
  const validation = await runValidator(rawProvision, security);
  registry.completeTask("validate");
  safeCall(surge, 'onTaskComplete', 'validate', { registryStatus: registry.getStatus(), rawProvision, validation, security });

  if (!validation.valid) {
    safeCall(surge, 'endSprint', { mcp: existingMcp });
    return await runConversational(userMessage, validation.error, registry);
  }

  const envFile = await writeEnvFile(rawProvision, {
    projectPath: options.projectPath,
    fileName: options.envFileName
  });
  safeCall(surge, 'onTaskComplete', 'env_write', { registryStatus: registry.getStatus(), rawProvision });
  rawProvision.envFile = envFile.written
    ? {
        path: envFile.path,
        variables: envFile.variables
      }
    : null;

  registry.registerTask('mcp');
  const addedMcp = await createMCP(rawProvision);
  registry.completeTask('mcp');
  safeCall(surge, 'onTaskComplete', 'mcp', { registryStatus: registry.getStatus(), mcp: addedMcp, rawProvision });

  const merged = mergeMcpEnvelopes(existingMcp, addedMcp);
  registry.registerTask('memory');
  await saveMemory(userId, merged);
  registry.completeTask('memory');
  safeCall(surge, 'onTaskComplete', 'memory', { registryStatus: registry.getStatus(), mcp: merged, rawProvision });
  surge.monitor(merged);
  safeCall(surge, 'endSprint', { mcp: merged });

  return {
    success: true,
    mcp: merged,
    envFile: rawProvision.envFile,
    envVarsResolved: envFile.variables,
    message: "Conectado automaticamente. Você não viu nenhuma key, token ou OAuth. Tudo invisível."
  };
}

module.exports = { runConnectPro };
