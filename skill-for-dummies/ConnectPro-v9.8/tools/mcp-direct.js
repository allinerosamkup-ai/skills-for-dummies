const { spawnSync } = require('child_process');
const path = require('path');
const { handleMcpBridgePayload } = require('../bridges/mcp-bridge');
const { getMcpService } = require('../core/mcp-inventory');

function withTemporaryEnv(overrides, fn) {
  const previous = {};
  for (const [key, value] of Object.entries(overrides)) {
    previous[key] = process.env[key];
    if (value == null) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const [key, value] of Object.entries(previous)) {
        if (value == null) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    });
}

function normalizeCredentials(data) {
  if (!data || typeof data !== 'object') return null;
  if (data.credentials) return data.credentials;

  const env = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => key === key.toUpperCase() && value != null)
  );

  if (Object.keys(env).length === 0) return null;

  return {
    realKey:
      env.SUPABASE_SERVICE_ROLE_KEY ||
      env.STRIPE_SECRET_KEY ||
      env.GITHUB_TOKEN ||
      env.VERCEL_TOKEN ||
      null,
    env
  };
}

function createCommandMcpProvider(
  { command, args = [], env = {} },
  { runner = spawnSync } = {}
) {
  if (!command) {
    throw new Error('command is required');
  }

  return {
    async invoke(payload) {
      if (command === process.execPath && args[0] === getBundledMcpBridgePath()) {
        return withTemporaryEnv(env, () => handleMcpBridgePayload(payload));
      }

      const result = runner(command, args, {
        input: JSON.stringify(payload),
        encoding: 'utf8',
        windowsHide: true,
        env: { ...process.env, ...env },
        maxBuffer: 1024 * 1024 * 4
      });

      if (result.error) throw result.error;
      if (result.status !== 0) {
        throw new Error(String(result.stderr || '').trim() || `${command} exited with status ${result.status}`);
      }

      return JSON.parse(String(result.stdout || '{}'));
    }
  };
}

function getBundledMcpBridgePath() {
  return path.resolve(__dirname, '..', 'bridges', 'mcp-bridge.js');
}

function getBundledMcpBridgeConfig() {
  if (!process.env.CONNECTPRO_MCP_FIXTURE_PATH && !process.env.CONNECTPRO_MCP_BRIDGE_URL) {
    return null;
  }

  return {
    command: process.execPath,
    args: [getBundledMcpBridgePath()],
    env: {}
  };
}

function resolveMcpProvider(customProvider) {
  if (customProvider) return customProvider;

  const command = process.env.CONNECTPRO_MCP_COMMAND;
  if (command) {
    const args = process.env.CONNECTPRO_MCP_ARGS
      ? JSON.parse(process.env.CONNECTPRO_MCP_ARGS)
      : [];

    return createCommandMcpProvider({ command, args });
  }

  const bundledBridge = getBundledMcpBridgeConfig();
  if (bundledBridge) {
    return createCommandMcpProvider(bundledBridge);
  }

  return null;
}

async function runMcpDirectForConnector(connector, { provider } = {}) {
  const resolvedProvider = resolveMcpProvider(provider);
  if (!resolvedProvider) {
    return { success: false, reason: 'mcp-provider-unavailable' };
  }

  if (!connector?.mcpDirect?.operation) {
    return { success: false, reason: 'mcp-config-missing', service: connector?.service || null };
  }

  const inventoryService = getMcpService(connector.service);
  const payload = {
    service: connector.service,
    operation: connector.mcpDirect.operation,
    input: connector.mcpDirect.input || {},
    mcp: connector.mcpDirect.mcp || inventoryService
  };

  const response = await resolvedProvider.invoke(payload);

  return {
    success: true,
    service: connector.service,
    mode: 'mcp_direct',
    credentials: normalizeCredentials(response),
    raw: response
  };
}

module.exports = {
  buildMcpPayload: (connector) => {
    const inventoryService = getMcpService(connector?.service);
    return {
      service: connector?.service || null,
      operation: connector?.mcpDirect?.operation || inventoryService?.operations?.provision || null,
      input: connector?.mcpDirect?.input || {},
      mcp: connector?.mcpDirect?.mcp || inventoryService || null
    };
  },
  createCommandMcpProvider,
  getBundledMcpBridgeConfig,
  getBundledMcpBridgePath,
  resolveMcpProvider,
  runMcpDirectForConnector
};
