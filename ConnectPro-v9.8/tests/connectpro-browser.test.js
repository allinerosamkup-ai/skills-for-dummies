const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('connectpro-browser builds launch options and parses structured output', async () => {
  const engine = require(localPath('tools', 'connectpro-browser.js'));

  assert.deepEqual(
    engine.buildLaunchOptions({ headless: true, connect: false }),
    { headless: true }
  );

  assert.deepEqual(
    engine.extractJsonFromPageResult('prefixo {"service":"stripe","ok":true} sufixo'),
    { service: 'stripe', ok: true }
  );
});

test('connectpro-browser executes through injected implementation as primary engine', async () => {
  const engine = require(localPath('tools', 'connectpro-browser.js'));

  const result = await engine.runConnectProBrowser(
    {
      script: async () => ({
        service: 'stripe',
        credentials: { realKey: 'internal_browser_key' }
      }),
      connect: true
    },
    {
      implementation: async ({ script }) => {
        const payload = await script({});
        return {
          engine: 'connectpro-browser',
          data: payload
        };
      }
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.engine, 'connectpro-browser');
  assert.equal(result.data.credentials.realKey, 'internal_browser_key');
});
