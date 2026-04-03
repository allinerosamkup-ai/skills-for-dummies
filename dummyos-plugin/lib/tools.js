const fs = require('fs');
const path = require('path');

function normalizePath(p) {
  if (!p) return null;
  return path.resolve(String(p));
}

function safeRequireFromRepo(relPath) {
  const repoRoot = path.resolve(__dirname, '..', '..');
  return require(path.resolve(repoRoot, relPath));
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function detectFrameworkFromPackage(pkg) {
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  if (deps.next) return 'nextjs';
  if (deps['react-scripts']) return 'cra';
  if (deps.vite) return 'vite';
  if (deps.express) return 'express';
  if (deps.fastify) return 'fastify';
  return 'node';
}

function detectSentryFromPackage(pkg) {
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const keys = Object.keys(deps);
  const has = (name) => keys.includes(name);

  return {
    hasSentryNextjs: has('@sentry/nextjs'),
    hasSentryNode: has('@sentry/node'),
    hasSentryReact: has('@sentry/react'),
    hasSentryVite: has('@sentry/vite-plugin')
  };
}

async function toolReady() {
  const { getConnectProReadiness } = safeRequireFromRepo('ConnectPro-v9.8/tools/connectpro-readiness');
  return { readiness: getConnectProReadiness() };
}

async function toolConnect(args) {
  const { runConnectPro } = safeRequireFromRepo('ConnectPro-v9.8/agents/orchestrator');
  const result = await runConnectPro(args.userMessage, args.userId);
  return result;
}

async function toolProjectDetect(args) {
  const projectPath = normalizePath(args.projectPath || process.env.DUMMYOS_PROJECT_ROOT || process.cwd());
  const pkgPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    return {
      ok: false,
      reason: 'package.json not found',
      projectPath
    };
  }

  const pkg = readJson(pkgPath);
  return {
    ok: true,
    projectPath,
    name: pkg.name || null,
    framework: detectFrameworkFromPackage(pkg),
    sentry: detectSentryFromPackage(pkg)
  };
}

async function toolSentryDetect(args) {
  const projectPath = normalizePath(args.projectPath || process.env.DUMMYOS_PROJECT_ROOT || process.cwd());
  const pkgPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    return { ok: false, reason: 'package.json not found', projectPath };
  }

  const pkg = readJson(pkgPath);
  const framework = detectFrameworkFromPackage(pkg);
  const sentry = detectSentryFromPackage(pkg);

  return {
    ok: true,
    projectPath,
    framework,
    sentry,
    env: {
      hasSentryDsn: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)
    }
  };
}

async function toolSentryPlan(args) {
  const detected = await toolSentryDetect(args);
  if (!detected.ok) return detected;

  const steps = [];
  if (!detected.env.hasSentryDsn) {
    steps.push({
      type: 'connect',
      tool: 'dummyos.connect',
      arguments: {
        userId: args.userId || 'local-user',
        userMessage: 'Conectar Sentry e obter DSN (capability-first: web_search + browser_automation se necessario)'
      },
      note: 'Se nao houver conector direto, use ConnectPro para discovery via registry + browser automation.'
    });
  }

  steps.push({
    type: 'manual',
    note: `Instalar SDK Sentry para stack ${detected.framework}. (Este plugin so planeja; setup automatico vem na proxima iteracao.)`
  });

  steps.push({
    type: 'verify',
    note: 'Disparar um erro controlado em dev e confirmar evento no Sentry.'
  });

  return {
    ok: true,
    projectPath: detected.projectPath,
    framework: detected.framework,
    detected: detected.sentry,
    steps
  };
}

const TOOLS = [
  {
    name: 'dummyos.ready',
    description: 'Return ConnectPro readiness snapshot.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: toolReady
  },
  {
    name: 'dummyos.connect',
    description: 'Provision services/capabilities via ConnectPro (capability-first, incremental).',
    inputSchema: {
      type: 'object',
      properties: {
        userMessage: { type: 'string' },
        userId: { type: 'string' }
      },
      required: ['userMessage', 'userId'],
      additionalProperties: false
    },
    handler: toolConnect
  },
  {
    name: 'dummyos.project.detect',
    description: 'Detect project framework and whether Sentry deps are present.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string' }
      },
      additionalProperties: false
    },
    handler: toolProjectDetect
  },
  {
    name: 'dummyos.sentry.detect',
    description: 'Detect Sentry SDK presence and DSN env hints.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string' }
      },
      additionalProperties: false
    },
    handler: toolSentryDetect
  },
  {
    name: 'dummyos.sentry.plan',
    description: 'Plan Sentry setup steps (uses ConnectPro for DSN if missing).',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string' },
        userId: { type: 'string' }
      },
      additionalProperties: false
    },
    handler: toolSentryPlan
  }
];

function listTools() {
  return TOOLS.map(({ handler, ...tool }) => tool);
}

async function callTool(name, args) {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  return tool.handler(args || {});
}

module.exports = {
  listTools,
  callTool
};
