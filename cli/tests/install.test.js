import test from 'node:test';
import assert from 'node:assert/strict';
import { install, uninstall, listInstalled } from '../lib/install.js';

test('install rejects unknown tools instead of pretending success', async () => {
  const result = await install('bogus-tool');
  assert.equal(result.success, false);
  assert.match(result.error, /Unknown tool/i);
});

test('uninstall rejects unknown tools instead of returning an empty success', async () => {
  const result = await uninstall('bogus-tool');
  assert.equal(result.success, false);
  assert.match(result.error, /Unknown tool/i);
});

test('listInstalled rejects unknown tools consistently', async () => {
  await assert.rejects(() => listInstalled('bogus-tool'), /Unknown tool/i);
});
