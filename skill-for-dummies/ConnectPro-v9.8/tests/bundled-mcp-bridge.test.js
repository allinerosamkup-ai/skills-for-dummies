const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

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

test('runMcpDirectForConnector uses bundled local bridge with fixture config', async () => {
  const mcpDirect = require(localPath('tools', 'mcp-direct.js'));
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'connectpro-mcp-'));
  const fixturePath = path.join(tmpDir, 'mcp-fixture.json');

  fs.writeFileSync(
    fixturePath,
    JSON.stringify({
      operations: {
        provision_supabase: {
          credentials: {
            realKey: 'sb_real_key',
            env: {
              NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
              NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key'
            }
          }
        }
      }
    }),
    'utf8'
  );

  await withEnv(
    {
      CONNECTPRO_MCP_COMMAND: null,
      CONNECTPRO_MCP_ARGS: null,
      CONNECTPRO_MCP_FIXTURE_PATH: fixturePath
    },
    async () => {
      const result = await mcpDirect.runMcpDirectForConnector({
        service: 'supabase',
        mcpDirect: {
          operation: 'provision_supabase',
          input: { region: 'sa-east-1' }
        }
      });

      assert.equal(result.success, true);
      assert.equal(result.mode, 'mcp_direct');
      assert.equal(result.credentials.realKey, 'sb_real_key');
      assert.equal(result.raw.credentials.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'anon-key');
    }
  );
});
