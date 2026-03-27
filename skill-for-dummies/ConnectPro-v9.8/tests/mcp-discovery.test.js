const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('mcp discovery resolves unknown service through mcp registry', async () => {
  const discovery = require(localPath('tools', 'mcp-discovery.js'));

  const connector = await discovery.discoverConnectorByService('airtable', {
    provider: {
      invoke: async (payload) => {
        assert.equal(payload.service, 'mcp_registry');
        assert.equal(payload.operation, 'search_mcp_registry');
        return {
          results: [
            {
              service: 'airtable',
              id: 'mcp__airtable',
              operations: {
                provision: 'connect_airtable'
              }
            }
          ]
        };
      }
    }
  });

  assert.equal(connector.service, 'airtable');
  assert.deepEqual(connector.strategies, ['mcp_direct']);
  assert.equal(connector.mcpDirect.operation, 'connect_airtable');
  assert.equal(connector.mcpDirect.mcp.id, 'mcp__airtable');
});
