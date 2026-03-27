const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('.env.example documents required runtime bridge variables', () => {
  const content = fs.readFileSync(localPath('.env.example'), 'utf8');

  for (const key of [
    'POSTGRES_URL',
    'CONNECTPRO_MCP_BRIDGE_URL',
    'CONNECTPRO_MCP_BRIDGE_TOKEN',
    'CONNECTPRO_MCP_COMMAND',
    'CONNECTPRO_INBOX_BRIDGE_SEARCH_URL',
    'CONNECTPRO_INBOX_BRIDGE_READ_URL',
    'CONNECTPRO_INBOX_BRIDGE_TOKEN',
    'CONNECTPRO_INBOX_COMMAND',
    'CONNECTPRO_ALLOW_MOCK_FALLBACK'
  ]) {
    assert.match(content, new RegExp(`^${key}=`, 'm'));
  }
});
