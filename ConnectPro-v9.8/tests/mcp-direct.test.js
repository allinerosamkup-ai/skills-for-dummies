const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('mcp direct executes bridge command and extracts credentials', async () => {
  const mcpDirect = require(localPath('tools', 'mcp-direct.js'));

  const result = await mcpDirect.runMcpDirectForConnector(
    {
      service: 'supabase',
      mcpDirect: {
        operation: 'provision_supabase',
        input: { region: 'sa-east-1' }
      }
    },
    {
      provider: {
        invoke: async ({ service, operation, input }) => ({
          service,
          operation,
          credentials: {
            realKey: 'sb_real_key',
            env: {
              NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co',
              NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon'
            }
          },
          input
        })
      }
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.mode, 'mcp_direct');
  assert.equal(result.credentials.realKey, 'sb_real_key');
  assert.equal(result.raw.operation, 'provision_supabase');
});
