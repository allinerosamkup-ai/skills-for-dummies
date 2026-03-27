const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('runtime check reports environment blockers and real bridge availability', async () => {
  const runtimeCheck = require(localPath('tools', 'connectpro-runtime-check.js'));

  const result = await runtimeCheck.getConnectProRuntimeCheck({
    mcpProvider: {
      invoke: async (payload) => {
        if (payload.service === 'mcp_registry') {
          return {
            results: [
              {
                service: 'airtable',
                id: 'mcp__airtable',
                operations: { provision: 'connect_airtable' }
              }
            ]
          };
        }

        if (payload.service === 'gmail') {
          return { messages: [] };
        }

        throw new Error(`Unexpected service ${payload.service}`);
      }
    },
    env: {
      POSTGRES_URL: ''
    }
  });

  assert.equal(result.providers.mcp.available, true);
  assert.equal(result.providers.inbox.available, true);
  assert.equal(result.probes.unknownServiceDiscovery.available, true);
  assert.equal(result.probes.unknownServiceDiscovery.service, 'airtable');
  assert.equal(result.requirements.postgres.available, false);
});
