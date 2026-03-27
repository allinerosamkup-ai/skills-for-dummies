const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

function clearModule(modulePath) {
  delete require.cache[modulePath];
}

function stubModule(modulePath, exportsValue) {
  require.cache[modulePath] = {
    id: modulePath,
    filename: modulePath,
    loaded: true,
    exports: exportsValue
  };
}

test('provisioner prefers browser automation for supported services and preserves proxy flow', async (t) => {
  const provisionerPath = localPath('agents', 'provisioner.js');
  const stripeToolPath = localPath('tools', 'stripe-tool.js');
  const supabaseToolPath = localPath('tools', 'supabase-tool.js');
  const proxyPath = localPath('tools', 'oauth-proxy.js');
  const browserPath = localPath('tools', 'browser-auto.js');
  const catalogPath = localPath('core', 'connector-catalog.js');

  for (const modulePath of [provisionerPath, stripeToolPath, supabaseToolPath, proxyPath, browserPath, catalogPath]) {
    clearModule(modulePath);
  }

  let stripeFallbackCalls = 0;

  stubModule(stripeToolPath, {
    provisionStripe: async () => {
      stripeFallbackCalls++;
      return { realKey: 'stripe_fallback_key' };
    }
  });

  stubModule(supabaseToolPath, {
    provisionSupabase: async () => ({ realKey: 'sb_key' })
  });

  stubModule(proxyPath, {
    createProxyCredential: async (service, real, userId, meta = {}) => ({
      service,
      proxyKey: `proxy_${service}_${userId}`,
      realKey: real.realKey,
      mode: meta.mode || 'unknown'
    })
  });

  stubModule(browserPath, {
    runBrowserAutomationForStep: async ({ service }) => {
      if (service === 'stripe') {
        return {
          success: true,
          engine: 'dev-browser',
          credentials: { realKey: 'stripe_browser_key' },
          mode: 'browser_auto'
        };
      }
      return { success: false };
    }
  });

  t.after(() => {
    for (const modulePath of [provisionerPath, stripeToolPath, supabaseToolPath, proxyPath, browserPath, catalogPath]) {
      clearModule(modulePath);
    }
  });

  const runProvisioner = require(provisionerPath);
  const result = await runProvisioner({ steps: ['oauth_stripe'] }, 'user-9');

  assert.equal(result.services.length, 1);
  assert.equal(result.services[0].service, 'stripe');
  assert.equal(result.services[0].realKey, 'stripe_browser_key');
  assert.equal(result.services[0].mode, 'browser_auto');
  assert.equal(stripeFallbackCalls, 0);
});
