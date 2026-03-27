const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

function withEnv(overrides, fn) {
  const previous = {};
  for (const [key, value] of Object.entries(overrides)) {
    previous[key] = process.env[key];
    if (value == null) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const [key, value] of Object.entries(previous)) {
        if (value == null) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    });
}

test('resolveInboxProvider uses bundled local bridge with fixture config', async () => {
  const providerFactory = require(localPath('tools', 'inbox-provider.js'));
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'connectpro-inbox-'));
  const fixturePath = path.join(tmpDir, 'inbox-fixture.json');

  fs.writeFileSync(
    fixturePath,
    JSON.stringify({
      searchResults: {
        'google verification code': [{ id: 'msg-1', subject: 'Google code' }]
      },
      messages: {
        'msg-1': {
          id: 'msg-1',
          body: 'Your verification code is 123456'
        }
      }
    }),
    'utf8'
  );

  await withEnv(
    {
      CONNECTPRO_INBOX_COMMAND: null,
      CONNECTPRO_INBOX_ARGS: null,
      CONNECTPRO_INBOX_SEARCH_URL: null,
      CONNECTPRO_INBOX_READ_URL: null,
      CONNECTPRO_INBOX_TOKEN: null,
      CONNECTPRO_INBOX_FIXTURE_PATH: fixturePath
    },
    async () => {
      const provider = providerFactory.resolveInboxProvider();
      const search = await provider.searchMessages({ query: 'google verification code', maxResults: 1 });
      const message = await provider.readMessage({ messageId: 'msg-1' });

      assert.equal(search[0].id, 'msg-1');
      assert.match(message.body, /123456/);
    }
  );
});
