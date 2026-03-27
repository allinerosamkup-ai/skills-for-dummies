const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('analyzer resolves common services locally without API keys', async () => {
  const { runAnalyzer } = require(localPath('agents', 'analyzer.js'));

  const result = await runAnalyzer('Quero conectar Stripe, Supabase e GitHub no projeto');

  assert.deepEqual(result.services.sort(), ['github', 'stripe', 'supabase']);
  assert.equal(result.intent.includes('conectar'), true);
  assert.equal(Array.isArray(result.minDataNeeded), true);
});

test('planner builds a deterministic plan locally from inferred services', async () => {
  const { runPlanner } = require(localPath('agents', 'planner.js'));

  const result = await runPlanner({
    services: ['stripe', 'supabase']
  });

  assert.deepEqual(result.order, ['stripe', 'supabase']);
  assert.deepEqual(result.steps, ['connect_stripe', 'connect_supabase']);
  assert.equal(result.servicePlans.length, 2);
});

test('conversational agent returns local human explanation without external model', async () => {
  const { runConversational } = require(localPath('agents', 'conversational.js'));

  const result = await runConversational(
    'Conectar Stripe',
    'faltou autenticação',
    { getStatus: () => ({ tasks: [] }) }
  );

  assert.equal(result.success, false);
  assert.match(result.message, /faltou autenticação/i);
  assert.match(result.message, /mínimo|minimo|preciso/i);
});
