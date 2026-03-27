const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('email loop extracts codes and confirmation links from message content', async () => {
  const emailLoop = require(localPath('tools', 'email-loop.js'));

  const artifacts = emailLoop.extractVerificationArtifacts(`
    Your verification code is 482991.
    Or confirm here: https://example.com/verify?token=abc123
  `);

  assert.equal(artifacts.codes[0], '482991');
  assert.match(artifacts.links[0], /example\.com\/verify/);
});

test('email loop reads the inbox and completes a verification callback', async () => {
  const emailLoop = require(localPath('tools', 'email-loop.js'));

  const calls = [];
  const result = await emailLoop.runEmailLoop(
    {
      connector: {
        service: 'google',
        emailLoop: {
          queries: ['google verification code']
        }
      },
      service: 'google'
    },
    {
      provider: {
        searchMessages: async ({ query }) => {
          calls.push(['search', query]);
          return [{ id: 'msg-1' }];
        },
        readMessage: async ({ messageId }) => {
          calls.push(['read', messageId]);
          return {
            id: messageId,
            subject: 'Google verification code',
            body: 'Use 123456 to continue or visit https://example.com/confirm?id=1'
          };
        }
      },
      completionHandler: async ({ artifact }) => {
        calls.push(['complete', artifact.type, artifact.value]);
        return { ok: true };
      }
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.artifact.type, 'code');
  assert.equal(result.artifact.value, '123456');
  assert.deepEqual(calls, [
    ['search', 'google verification code'],
    ['read', 'msg-1'],
    ['complete', 'code', '123456']
  ]);
});
