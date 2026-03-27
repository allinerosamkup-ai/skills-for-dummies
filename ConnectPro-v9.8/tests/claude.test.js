const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('local callClaude keeps JSON extraction and service detection behavior', async () => {
  const callClaude = require(localPath('tools', 'claude.js'));

  assert.deepEqual(
    callClaude.extractFirstJsonObject('prefixo {"ok":true,"count":2} sufixo'),
    { ok: true, count: 2 }
  );

  assert.deepEqual(
    callClaude.detectServices('Quero conectar Stripe, Supabase e GitHub').sort(),
    ['github', 'stripe', 'supabase']
  );

  const parsed = await callClaude('{"steps":["oauth_stripe"]}');
  assert.deepEqual(parsed, { steps: ['oauth_stripe'] });
});
