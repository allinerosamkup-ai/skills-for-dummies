const axios = require('axios');
const { spawnSync } = require('child_process');
const path = require('path');
const { handleInboxBridgePayload } = require('../bridges/inbox-bridge');
const { resolveMcpProvider } = require('./mcp-direct');
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

function createHttpInboxProvider(
  { searchUrl, readUrl, headers = {} },
  { httpClient = axios } = {}
) {
  if (!searchUrl || !readUrl) {
    throw new Error('searchUrl and readUrl are required');
  }

  return {
    async searchMessages({ query, maxResults = 3 }) {
      const response = await httpClient.post(searchUrl, { query, maxResults }, { headers });
      return response.data.messages || response.data.results || [];
    },
    async readMessage({ messageId }) {
      const response = await httpClient.post(readUrl, { messageId }, { headers });
      return response.data.message || response.data;
    }
  };
}

function createCommandInboxProvider(
  { command, args = [], env = {} },
  { runner = spawnSync } = {}
) {
  if (!command) {
    throw new Error('command is required');
  }

  async function execute(payload) {
    if (command === process.execPath && args[0] === getBundledInboxBridgePath()) {
      return withTemporaryEnv(env, () => handleInboxBridgePayload(payload));
    }

    const result = runner(command, args, {
      input: JSON.stringify(payload),
      encoding: 'utf8',
      windowsHide: true,
      env: { ...process.env, ...env },
      maxBuffer: 1024 * 1024 * 4
    });

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      throw new Error(String(result.stderr || '').trim() || `${command} exited with status ${result.status}`);
    }

    return JSON.parse(String(result.stdout || '{}'));
  }

  return {
    async searchMessages({ query, maxResults = 3 }) {
      const response = await execute({ action: 'search', query, maxResults });
      return response.messages || response.results || [];
    },
    async readMessage({ messageId }) {
      const response = await execute({ action: 'read', messageId });
      return response.message || response;
    }
  };
}

function createMcpInboxProvider(provider) {
  if (!provider) {
    throw new Error('mcp provider is required');
  }

  const gmail = getMcpService('gmail');
  if (!gmail?.operations?.searchMessages || !gmail?.operations?.readMessage) {
    throw new Error('gmail mcp inventory is not configured');
  }

  return {
    async searchMessages({ query, maxResults = 3 }) {
      const response = await provider.invoke({
        service: 'gmail',
        operation: gmail.operations.searchMessages,
        input: { query, maxResults },
        mcp: gmail
      });
      return response.messages || response.results || [];
    },
    async readMessage({ messageId }) {
      const response = await provider.invoke({
        service: 'gmail',
        operation: gmail.operations.readMessage,
        input: { messageId },
        mcp: gmail
      });
      return response.message || response;
    }
  };
}

function getBundledInboxBridgePath() {
  return path.resolve(__dirname, '..', 'bridges', 'inbox-bridge.js');
}

function getBundledInboxBridgeConfig() {
  if (!process.env.CONNECTPRO_INBOX_FIXTURE_PATH && !process.env.CONNECTPRO_INBOX_BRIDGE_SEARCH_URL) {
    return null;
  }

  return {
    command: process.execPath,
    args: [getBundledInboxBridgePath()],
    env: {}
  };
}

function canUseMcpInboxProvider(provider) {
  const gmail = getMcpService('gmail');
  return Boolean(provider && gmail?.operations?.searchMessages && gmail?.operations?.readMessage);
}

function resolveInboxProvider(customProvider, { mcpProvider } = {}) {
  if (customProvider) return customProvider;

  const command = process.env.CONNECTPRO_INBOX_COMMAND;
  if (command) {
    const args = process.env.CONNECTPRO_INBOX_ARGS
      ? JSON.parse(process.env.CONNECTPRO_INBOX_ARGS)
      : [];
    return createCommandInboxProvider({ command, args });
  }

  const searchUrl = process.env.CONNECTPRO_INBOX_SEARCH_URL;
  const readUrl = process.env.CONNECTPRO_INBOX_READ_URL;

  const token = process.env.CONNECTPRO_INBOX_TOKEN;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  if (searchUrl && readUrl) {
    return createHttpInboxProvider({ searchUrl, readUrl, headers });
  }

  const bundledBridge = getBundledInboxBridgeConfig();
  if (bundledBridge) {
    return createCommandInboxProvider(bundledBridge);
  }

  const resolvedMcpProvider = resolveMcpProvider(mcpProvider);
  if (canUseMcpInboxProvider(resolvedMcpProvider)) {
    return createMcpInboxProvider(resolvedMcpProvider);
  }

  return null;
}

module.exports = {
  createCommandInboxProvider,
  createHttpInboxProvider,
  createMcpInboxProvider,
  canUseMcpInboxProvider,
  getBundledInboxBridgeConfig,
  getBundledInboxBridgePath,
  resolveInboxProvider
};
