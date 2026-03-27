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

test('provisioner uses mcp_direct before browser_auto when both exist', async (t) => {
  const provisionerPath = localPath('agents', 'provisioner.js');
  const catalogPath = localPath('core', 'connector-catalog.js');
  const proxyPath = localPath('tools', 'oauth-proxy.js');
  const mcpPath = localPath('tools', 'mcp-direct.js');
  const browserPath = localPath('tools', 'browser-auto.js');
  const stripeToolPath = localPath('tools', 'stripe-tool.js');
  const supabaseToolPath = localPath('tools', 'supabase-tool.js');

  for (const modulePath of [provisionerPath, catalogPath, proxyPath, mcpPath, browserPath, stripeToolPath, supabaseToolPath]) {
    clearModule(modulePath);
  }

  stubModule(catalogPath, {
    getConnector: (service) => ({
      service,
      strategies: ['mcp_direct', 'browser_auto'],
      mcpDirect: { operation: 'provision_service' },
      browserAutomation: { mode: 'connect', script: () => 'noop' }
    }),
    getOrderedStrategies: () => ['mcp_direct', 'browser_auto'],
    resolveConnectorStep: () => ({
      service: 'supabase',
      strategies: ['mcp_direct', 'browser_auto'],
      mcpDirect: { operation: 'provision_service' },
      browserAutomation: { mode: 'connect', script: () => 'noop' }
    })
  });

  let browserCalls = 0;
  let mcpCalls = 0;

  stubModule(proxyPath, {
    createProxyCredential: async (service, real, userId, meta = {}) => ({
      service,
      proxyKey: `proxy_${service}_${userId}`,
      realKey: real.realKey,
      ...meta
    })
  });

  stubModule(mcpPath, {
    runMcpDirectForConnector: async () => {
      mcpCalls++;
      return {
        success: true,
        service: 'supabase',
        mode: 'mcp_direct',
        credentials: { realKey: 'mcp_real_key' }
      };
    }
  });

  stubModule(browserPath, {
    runBrowserAutomationForStep: async () => {
      browserCalls++;
      return {
        success: true,
        service: 'supabase',
        mode: 'browser_auto',
        engine: 'connectpro-browser',
        credentials: { realKey: 'browser_key' }
      };
    }
  });

  stubModule(stripeToolPath, { provisionStripe: async () => ({ realKey: 'stripe' }) });
  stubModule(supabaseToolPath, { provisionSupabase: async () => ({ realKey: 'supabase' }) });

  t.after(() => {
    for (const modulePath of [provisionerPath, catalogPath, proxyPath, mcpPath, browserPath, stripeToolPath, supabaseToolPath]) {
      clearModule(modulePath);
    }
  });

  const runProvisioner = require(provisionerPath);
  const result = await runProvisioner(
    {
      servicePlans: [{ service: 'supabase', strategies: ['mcp_direct', 'browser_auto'] }]
    },
    'user-42'
  );

  assert.equal(result.services[0].realKey, 'mcp_real_key');
  assert.equal(result.services[0].strategy, 'mcp_direct');
  assert.equal(mcpCalls, 1);
  assert.equal(browserCalls, 0);
});
