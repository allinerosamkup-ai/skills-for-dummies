const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('connector catalog orders strategies from easiest to hardest', async () => {
  const catalog = require(localPath('core', 'connector-catalog.js'));

  assert.deepEqual(
    catalog.getOrderedStrategies('stripe'),
    ['api_http', 'browser_auto']
  );

  assert.deepEqual(
    catalog.getOrderedStrategies('supabase'),
    ['mcp_direct', 'api_http', 'browser_auto']
  );
});

test('planner builds deterministic service plans using ordered strategies', async () => {
  const runPlanner = require(localPath('agents', 'planner.js'));

  const plan = await runPlanner({
    services: ['stripe', 'supabase'],
    intent: 'connect tools'
  });

  assert.deepEqual(plan.order, ['stripe', 'supabase']);
  assert.deepEqual(plan.servicePlans[0].strategies, ['api_http', 'browser_auto']);
  assert.deepEqual(plan.servicePlans[1].strategies, ['mcp_direct', 'api_http', 'browser_auto']);
});
