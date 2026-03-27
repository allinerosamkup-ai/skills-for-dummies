const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('dev-browser adapter builds connect args and extracts JSON from stdout', async () => {
  const browserAuto = require(localPath('tools', 'browser-auto.js'));

  assert.deepEqual(browserAuto.buildDevBrowserArgs({ connect: true }), ['--connect']);
  assert.deepEqual(browserAuto.buildDevBrowserArgs({ headless: true }), ['--headless']);
  assert.deepEqual(
    browserAuto.extractJsonFromOutput('prefixo\n{"ok":true,"value":"abc"}\nsufixo'),
    { ok: true, value: 'abc' }
  );
});

test('dev-browser adapter executes script through injected runner', async () => {
  const browserAuto = require(localPath('tools', 'browser-auto.js'));

  const result = await browserAuto.runDevBrowserScript(
    {
      script: 'console.log("oi")',
      connect: true
    },
    {
      runner: () => ({
        status: 0,
        stdout: '{"service":"stripe","credentials":{"realKey":"rk_live_123"}}',
        stderr: ''
      })
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.engine, 'dev-browser');
  assert.equal(result.data.service, 'stripe');
  assert.equal(result.data.credentials.realKey, 'rk_live_123');
});

test('browser-auto prefers connectpro-browser before dev-browser when both are available', async () => {
  const browserAuto = require(localPath('tools', 'browser-auto.js'));

  const result = await browserAuto.runBrowserAutomationForStep(
    {
      connector: {
        service: 'stripe',
        browserAutomation: {
          mode: 'connect',
          script: () => 'console.log("noop")'
        }
      }
    },
    {
      internalRunner: async () => ({
        success: true,
        engine: 'connectpro-browser',
        data: {
          service: 'stripe',
          credentials: { realKey: 'internal_key' }
        }
      }),
      availabilityRunner: () => ({ status: 0 }),
      runner: () => ({
        status: 0,
        stdout: '{"service":"stripe","credentials":{"realKey":"external_key"}}',
        stderr: ''
      })
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.engine, 'connectpro-browser');
  assert.equal(result.credentials.realKey, 'internal_key');
});

test('browser-auto triggers email loop when browser step requires confirmation', async () => {
  const browserAuto = require(localPath('tools', 'browser-auto.js'));

  const result = await browserAuto.runBrowserAutomationForStep(
    {
      connector: {
        service: 'google',
        browserAutomation: {
          mode: 'connect',
          script: () => 'console.log("noop")'
        },
        emailLoop: {
          queries: ['google verification code']
        }
      }
    },
    {
      internalRunner: async () => ({
        success: true,
        engine: 'connectpro-browser',
        data: {
          service: 'google',
          confirmationRequired: true
        }
      }),
      emailProvider: {
        searchMessages: async () => [{ id: 'm1' }],
        readMessage: async () => ({
          id: 'm1',
          body: 'Verification code: 654321'
        })
      },
      emailCompletionHandler: async ({ artifact }) => ({
        ok: artifact.value === '654321'
      })
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.verification.success, true);
  assert.equal(result.verification.artifact.value, '654321');
});
