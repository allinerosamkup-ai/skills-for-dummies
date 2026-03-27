const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('command inbox provider calls external bridge for search and read', async () => {
  const providerFactory = require(localPath('tools', 'inbox-provider.js'));

  const calls = [];
  const provider = providerFactory.createCommandInboxProvider(
    {
      command: 'node',
      args: ['bridge.js']
    },
    {
      runner: (command, args, options) => {
        calls.push([command, args, options.input]);
        const payload = JSON.parse(options.input);

        if (payload.action === 'search') {
          return {
            status: 0,
            stdout: JSON.stringify({ messages: [{ id: 'cmd-1' }] }),
            stderr: ''
          };
        }

        return {
          status: 0,
          stdout: JSON.stringify({ message: { id: payload.messageId, body: 'Code: 777888' } }),
          stderr: ''
        };
      }
    }
  );

  const search = await provider.searchMessages({ query: 'confirm code', maxResults: 2 });
  const message = await provider.readMessage({ messageId: 'cmd-1' });

  assert.equal(search[0].id, 'cmd-1');
  assert.equal(message.body, 'Code: 777888');
  assert.equal(calls[0][0], 'node');
  assert.match(calls[0][2], /"action":"search"/);
  assert.match(calls[1][2], /"action":"read"/);
});
