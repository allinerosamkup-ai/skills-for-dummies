const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('mcp inventory exposes concrete server metadata for known services', () => {
  const inventory = require(localPath('core', 'mcp-inventory.js'));

  const supabase = inventory.getMcpService('supabase');
  const gmail = inventory.getMcpService('gmail');

  assert.equal(supabase.id, 'mcp__67a82d94-d27d-4df2-933c-a256070e9b4e');
  assert.equal(supabase.operations.provision, 'provision_supabase');
  assert.equal(gmail.id, 'mcp__642d228a-e79a-4eb7-bd03-9bc1ac3deecd');
  assert.equal(gmail.operations.searchMessages, 'gmail_search_messages');
});
