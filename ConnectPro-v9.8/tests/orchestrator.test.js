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

test('runConnectPro provisions multiple services and persists the MCP envelope', async (t) => {
  const orchestratorPath = localPath('agents', 'orchestrator.js');
  const analyzerPath = localPath('agents', 'analyzer.js');
  const plannerPath = localPath('agents', 'planner.js');
  const provisionerPath = localPath('agents', 'provisioner.js');
  const validatorPath = localPath('agents', 'validator.js');
  const securityPath = localPath('agents', 'security-agent.js');
  const claudePath = localPath('tools', 'claude.js');
  const memoryPath = localPath('agents', 'memory.js');
  const watcherPath = localPath('surge', 'watcher.js');

  const touched = [
    orchestratorPath,
    analyzerPath,
    plannerPath,
    provisionerPath,
    validatorPath,
    securityPath,
    claudePath,
    memoryPath,
    watcherPath
  ];

  for (const modulePath of touched) {
    clearModule(modulePath);
  }

  const saved = [];

  stubModule(claudePath, async (prompt, json = true) => {
    if (prompt.includes('Agent Analyzer')) {
      return {
        services: ['stripe', 'supabase'],
        intent: 'receber pagamentos',
        minDataNeeded: ['email']
      };
    }

    if (prompt.includes('Agent Planner')) {
      return {
        steps: ['oauth_stripe', 'create_supabase_project'],
        order: ['oauth_stripe', 'create_supabase_project']
      };
    }

    if (!json) {
      return 'Falha de validacao.';
    }

    throw new Error(`Unexpected prompt in test: ${prompt}`);
  });

  stubModule(memoryPath, {
    getMemory: async () => ({ connected: false }),
    saveMemory: async (userId, mcp) => {
      saved.push({ userId, mcp });
    }
  });

  stubModule(provisionerPath, {
    runProvisioner: async () => ({
      services: [
        { service: 'stripe', proxyKey: 'stripe_proxy', realKey: 'sk_live_real' },
        { service: 'supabase', proxyKey: 'supabase_proxy', realKey: 'sb_service_role' }
      ]
    })
  });

  class FakeWatcher {
    constructor(userId) {
      this.userId = userId;
      this.monitored = [];
    }

    monitor(mcp) {
      this.monitored.push(mcp);
    }
  }

  stubModule(watcherPath, FakeWatcher);

  t.after(() => {
    for (const modulePath of touched) {
      clearModule(modulePath);
    }
  });

  const { runConnectPro } = require(orchestratorPath);
  const result = await runConnectPro('Quero Stripe e Supabase', 'user-1');

  assert.equal(result.success, true);
  assert.deepEqual([...result.mcp.capabilities].sort(), ['stripe', 'supabase']);
  assert.equal(Array.isArray(result.mcp.proxyCredentials), true);
  assert.equal(result.mcp.proxyCredentials.length, 2);
  assert.equal(result.mcp.proxyCredential, result.mcp.proxyCredentials[0].proxyKey);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].userId, 'user-1');
});
