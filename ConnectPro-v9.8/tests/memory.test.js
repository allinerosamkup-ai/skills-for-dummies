const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

function clearModule(modulePath) {
  delete require.cache[modulePath];
}

test('memory falls back locally and returns a connected envelope when Postgres is unavailable', async (t) => {
  const memoryPath = localPath('agents', 'memory.js');
  const previousUrl = process.env.POSTGRES_URL;

  delete process.env.POSTGRES_URL;
  clearModule(memoryPath);

  t.after(() => {
    clearModule(memoryPath);
    if (previousUrl === undefined) {
      delete process.env.POSTGRES_URL;
    } else {
      process.env.POSTGRES_URL = previousUrl;
    }
  });

  const { getMemory, saveMemory } = require(memoryPath);

  const empty = await getMemory('user-2');
  assert.deepEqual(empty, { connected: false });

  const mcp = { id: 'mcp_123', capabilities: ['stripe'] };
  await saveMemory('user-2', mcp);

  const loaded = await getMemory('user-2');
  assert.equal(loaded.connected, true);
  assert.deepEqual(loaded.mcp, mcp);
});
