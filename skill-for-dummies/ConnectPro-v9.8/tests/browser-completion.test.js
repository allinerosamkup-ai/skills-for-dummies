const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('default browser completion handler fills verification code when confirmation context is present', async () => {
  const browserAuto = require(localPath('tools', 'browser-auto.js'));

  const calls = [];
  const completion = await browserAuto.createDefaultEmailCompletionHandler({
    internalRunner: async ({ script }) => {
      await script({
        browser: {
          getPage: async () => ({
            locator: (selector) => ({
              fill: async (value) => calls.push(['fill', selector, value]),
              click: async () => calls.push(['click', selector])
            }),
            goto: async (url) => calls.push(['goto', url])
          })
        }
      });

      return {
        engine: 'connectpro-browser',
        data: { completed: true }
      };
    }
  })({
    artifact: { type: 'code', value: '123456' },
    confirmationContext: {
      pageName: 'connectpro-google',
      codeInputSelector: '#code',
      submitSelector: '#submit'
    }
  });

  assert.equal(completion.ok, true);
  assert.deepEqual(calls, [
    ['fill', '#code', '123456'],
    ['click', '#submit']
  ]);
});

test('default browser completion handler opens confirmation link when artifact is a link', async () => {
  const browserAuto = require(localPath('tools', 'browser-auto.js'));

  const calls = [];
  const completion = await browserAuto.createDefaultEmailCompletionHandler({
    internalRunner: async ({ script }) => {
      await script({
        browser: {
          getPage: async () => ({
            locator: () => ({
              fill: async () => {},
              click: async () => {}
            }),
            goto: async (url) => calls.push(['goto', url])
          })
        }
      });

      return {
        engine: 'connectpro-browser',
        data: { completed: true }
      };
    }
  })({
    artifact: { type: 'link', value: 'https://example.com/verify?id=1' },
    confirmationContext: {
      pageName: 'connectpro-generic'
    }
  });

  assert.equal(completion.ok, true);
  assert.deepEqual(calls, [['goto', 'https://example.com/verify?id=1']]);
});
