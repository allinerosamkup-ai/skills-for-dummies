const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

function withEnv(overrides, fn) {
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

test('readiness reports inbox available from mcp bridge when Gmail MCP is reachable', async () => {
  const readiness = require(localPath('tools', 'connectpro-readiness.js'));

  await withEnv(
    {
      CONNECTPRO_INBOX_COMMAND: null,
      CONNECTPRO_INBOX_ARGS: null,
      CONNECTPRO_INBOX_SEARCH_URL: null,
      CONNECTPRO_INBOX_READ_URL: null,
      CONNECTPRO_INBOX_TOKEN: null,
      CONNECTPRO_INBOX_FIXTURE_PATH: null,
      CONNECTPRO_MCP_COMMAND: null,
      CONNECTPRO_MCP_ARGS: null
    },
    async () => {
      const status = readiness.getInboxProviderStatus({
        mcpProvider: {
          invoke: async () => ({ ok: true })
        }
      });

      assert.equal(status.available, true);
      assert.equal(status.source, 'mcp_bridge');
    }
  );
});
