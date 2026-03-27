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

test('provisioner discovers unknown service via mcp registry before giving up', async (t) => {
  const provisionerPath = localPath('agents', 'provisioner.js');
  const catalogPath = localPath('core', 'connector-catalog.js');
  const proxyPath = localPath('tools', 'oauth-proxy.js');
  const mcpPath = localPath('tools', 'mcp-direct.js');
  const browserPath = localPath('tools', 'browser-auto.js');
  const apiPath = localPath('tools', 'api-http.js');
  const discoveryPath = localPath('tools', 'mcp-discovery.js');
  const stripeToolPath = localPath('tools', 'stripe-tool.js');
  const supabaseToolPath = localPath('tools', 'supabase-tool.js');

  for (const modulePath of [provisionerPath, catalogPath, proxyPath, mcpPath, browserPath, apiPath, discoveryPath, stripeToolPath, supabaseToolPath]) {
    clearModule(modulePath);
  }

  stubModule(catalogPath, {
    getConnector: (service) => (service === 'airtable' ? null : null),
    getOrderedStrategies: (connector) => connector.strategies || [],
    resolveConnectorStep: () => null
  });

  stubModule(discoveryPath, {
    discoverConnectorByService: async (service) => ({
      service,
      aliases: [service],
      strategies: ['mcp_direct'],
      mcpDirect: {
        operation: 'connect_airtable',
        mcp: { id: 'mcp__airtable' }
      }
    })
  });

  stubModule(proxyPath, {
    createProxyCredential: (service, credentials, userId, metadata = {}) => ({
      service,
      userId,
      ...credentials,
      ...metadata,
      proxyKey: `${service}_proxy`
    })
  });

  stubModule(mcpPath, {
    runMcpDirectForConnector: async () => ({
      success: true,
      mode: 'mcp_direct',
      credentials: {
        realKey: 'airtable_real_key',
        env: {
          AIRTABLE_TOKEN: 'airtable_real_key'
        }
      }
    })
  });

  stubModule(apiPath, {
    runApiHttpForConnector: async () => ({ success: false })
  });

  stubModule(browserPath, {
    runBrowserAutomationForStep: async () => ({ success: false })
  });

  stubModule(stripeToolPath, { provisionStripe: async () => ({}) });
  stubModule(supabaseToolPath, { provisionSupabase: async () => ({}) });

  t.after(() => {
    for (const modulePath of [provisionerPath, catalogPath, proxyPath, mcpPath, browserPath, apiPath, discoveryPath, stripeToolPath, supabaseToolPath]) {
      clearModule(modulePath);
    }
  });

  const { runProvisioner } = require(provisionerPath);
  const result = await runProvisioner(
    {
      servicePlans: [{ service: 'airtable' }]
    },
    'user-unknown'
  );

  assert.equal(result.services.length, 1);
  assert.equal(result.services[0].service, 'airtable');
  assert.equal(result.services[0].strategy, 'mcp_direct');
  assert.equal(result.services[0].realKey, 'airtable_real_key');
});
