const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('server runtime prefers PORT from environment before default port', () => {
  const runtime = require(localPath('tools', 'server-runtime.js'));
  const ports = runtime.getCandidatePorts({ port: '4567', fallbackSpan: 3 });

  assert.deepEqual(ports, [4567, 4568, 4569, 4570]);
});

test('server runtime retries on EADDRINUSE and binds to the next candidate port', async () => {
  const runtime = require(localPath('tools', 'server-runtime.js'));

  const attempts = [];
  const fakeServer = { close() {} };
  const app = {
    listen(port, callback) {
      attempts.push(port);
      const listeners = {};
      const handle = {
        once(event, handler) {
          listeners[event] = handler;
          if (event === 'error' && port === 3001) {
            setImmediate(() => handler(Object.assign(new Error('in use'), { code: 'EADDRINUSE' })));
          }
          return handle;
        },
        close() {},
        address() {
          return { port };
        }
      };

      if (port !== 3001) {
        setImmediate(() => callback?.());
      }

      return handle;
    }
  };

  const result = await runtime.listenWithFallback(app, [3001, 3002]);

  assert.deepEqual(attempts, [3001, 3002]);
  assert.equal(result.port, 3002);
  assert.equal(typeof result.server.close, 'function');
});
