const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('registry records strategy attempts and outcomes', async () => {
  const { Registry } = require(localPath('core', 'registry.js'));
  const registry = new Registry('user-7');

  registry.recordStrategyAttempt({
    service: 'supabase',
    strategy: 'mcp_direct',
    step: 'connect_supabase'
  });
  registry.recordStrategyOutcome({
    service: 'supabase',
    strategy: 'mcp_direct',
    status: 'success'
  });

  const status = registry.getStatus();
  assert.equal(Array.isArray(status.strategyAttempts), true);
  assert.equal(status.strategyAttempts.length, 1);
  assert.equal(status.strategyAttempts[0].service, 'supabase');
  assert.equal(status.strategyAttempts[0].strategy, 'mcp_direct');
  assert.equal(status.strategyAttempts[0].status, 'success');
});
