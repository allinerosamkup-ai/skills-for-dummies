const { runAnalyzer } = require('./analyzer');
const { runPlanner } = require('./planner');
const { runProvisioner } = require('./provisioner');
const { runValidator } = require('./validator');
const { runSecurityCheck } = require('./security-agent');
const { runConversational } = require('./conversational');
const { getMemory, saveMemory } = require('./memory');
const { Registry } = require('../core/registry');
const { createMCP } = require('../core/mcp');
const SurgeWatcher = require('../surge/watcher');

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

  return {
    ...existing,
    ...added,
    id: existing.id || added.id,
    createdAt: existing.createdAt || added.createdAt,
    capabilities,
    proxyCredential,
    proxyCredentials
  };
}

async function runConnectPro(userMessage, userId) {
  const registry = new Registry(userId);
  const surge = new SurgeWatcher(userId);

  const memory = await getMemory(userId);
  const existingMcp = memory?.connected ? memory.mcp : null;
  const existingCapabilities = toCapabilitySet(existingMcp);

  registry.registerTask("analyze");
  const analysis = await runAnalyzer(userMessage);
  registry.completeTask("analyze");

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
      return { success: true, mcp: existingMcp, message: "Já conectado (todas as capacidades pedidas já existem). Monitorado 24/7 pelo SURGE." };
    }
  }

  registry.registerTask("plan");
  const plan = await runPlanner(analysis);
  registry.completeTask("plan");

  registry.registerTask("provision");
  const rawProvision = await runProvisioner(plan, userId, registry);
  registry.completeTask("provision");

  registry.registerTask("security");
  const security = await runSecurityCheck(rawProvision);
  registry.completeTask("security");

  registry.registerTask("validate");
  const validation = await runValidator(rawProvision, security);
  registry.completeTask("validate");

  if (!validation.valid) {
    return await runConversational(userMessage, validation.error, registry);
  }

  const addedMcp = await createMCP(rawProvision);
  const merged = mergeMcpEnvelopes(existingMcp, addedMcp);
  await saveMemory(userId, merged);
  surge.monitor(merged);

  return {
    success: true,
    mcp: merged,
    message: "Conectado automaticamente. Você não viu nenhuma key, token ou OAuth. Tudo invisível. 🚀"
  };
}

module.exports = { runConnectPro };
