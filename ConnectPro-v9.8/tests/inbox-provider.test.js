const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('http inbox provider uses configured search/read endpoints', async () => {
  const providerFactory = require(localPath('tools', 'inbox-provider.js'));

  const calls = [];
  const provider = providerFactory.createHttpInboxProvider(
    {
      searchUrl: 'https://inbox.local/search',
      readUrl: 'https://inbox.local/read'
    },
    {
      httpClient: {
        post: async (url, body) => {
          calls.push([url, body]);
          if (url.endsWith('/search')) {
            return { data: { messages: [{ id: 'msg-http-1' }] } };
          }
          return { data: { message: { id: body.messageId, body: 'Code: 111222' } } };
        }
      }
    }
  );

  const search = await provider.searchMessages({ query: 'google verification code', maxResults: 1 });
  const message = await provider.readMessage({ messageId: search[0].id });

  assert.equal(search[0].id, 'msg-http-1');
  assert.equal(message.body, 'Code: 111222');
  assert.deepEqual(calls, [
    ['https://inbox.local/search', { query: 'google verification code', maxResults: 1 }],
    ['https://inbox.local/read', { messageId: 'msg-http-1' }]
  ]);
});
