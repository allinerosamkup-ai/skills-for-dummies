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

test('connectpro readiness reports bundled bridge availability and per-strategy status', async () => {
  const readiness = require(localPath('tools', 'connectpro-readiness.js'));
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'connectpro-ready-'));
  const inboxFixturePath = path.join(tmpDir, 'inbox-fixture.json');
  const mcpFixturePath = path.join(tmpDir, 'mcp-fixture.json');

  fs.writeFileSync(inboxFixturePath, JSON.stringify({ searchResults: {}, messages: {} }), 'utf8');
  fs.writeFileSync(mcpFixturePath, JSON.stringify({ operations: {} }), 'utf8');

  await withEnv(
    {
      CONNECTPRO_INBOX_FIXTURE_PATH: inboxFixturePath,
      CONNECTPRO_MCP_FIXTURE_PATH: mcpFixturePath,
      STRIPE_SECRET_KEY: 'sk_test_123',
      GITHUB_TOKEN: null
    },
    async () => {
      const result = readiness.getConnectProReadiness();

      assert.equal(result.providers.inbox.available, true);
      assert.equal(result.providers.inbox.source, 'bundled_bridge');
      assert.equal(result.providers.mcp.available, true);
      assert.equal(result.providers.mcp.source, 'bundled_bridge');

      const stripeStrategies = result.connectors.stripe.strategies;
      const supabaseStrategies = result.connectors.supabase.strategies;

      assert.equal(stripeStrategies.find((entry) => entry.name === 'api_http').available, true);
      assert.equal(supabaseStrategies.find((entry) => entry.name === 'mcp_direct').available, true);
      assert.equal(result.ready, true);
    }
  );
});
