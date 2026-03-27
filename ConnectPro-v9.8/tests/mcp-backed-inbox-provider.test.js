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

test('resolveInboxProvider falls back to Gmail MCP provider when MCP bridge is available', async () => {
  const providerFactory = require(localPath('tools', 'inbox-provider.js'));

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
      const provider = providerFactory.resolveInboxProvider(null, {
        mcpProvider: {
          invoke: async (payload) => {
            if (payload.operation === 'gmail_search_messages') {
              return { messages: [{ id: 'gmail-msg-1' }] };
            }

            if (payload.operation === 'gmail_read_message') {
              return { message: { id: payload.input.messageId, body: 'Code: 445566' } };
            }

            throw new Error(`Unexpected operation: ${payload.operation}`);
          }
        }
      });

      const search = await provider.searchMessages({ query: 'google verification code', maxResults: 1 });
      const message = await provider.readMessage({ messageId: search[0].id });

      assert.equal(search[0].id, 'gmail-msg-1');
      assert.match(message.body, /445566/);
    }
  );
});
