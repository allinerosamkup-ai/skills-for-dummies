const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

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

test('readiness only marks browser_auto available when a browser script exists', () => {
  const readiness = require(localPath('tools', 'connectpro-readiness.js'));
  const providerStatus = {
    mcp: { available: false, source: 'unconfigured' },
    inbox: { available: false, source: 'unconfigured' }
  };

  const connector = {
    service: 'custom',
    strategies: ['browser_auto']
  };

  const strategy = readiness.getStrategyStatus(connector, 'browser_auto', providerStatus);
  const connectorStatus = readiness.getConnectorReadiness(connector, providerStatus);

  assert.equal(strategy.available, false);
  assert.equal(strategy.source, 'no-browser-script');
  assert.equal(connectorStatus.ready, false);
});

test('runConnectPro writes real env vars to .env.local and only stores env var names in MCP', async (t) => {
  const orchestratorPath = localPath('agents', 'orchestrator.js');
  const analyzerPath = localPath('agents', 'analyzer.js');
  const plannerPath = localPath('agents', 'planner.js');
  const provisionerPath = localPath('agents', 'provisioner.js');
  const validatorPath = localPath('agents', 'validator.js');
  const securityPath = localPath('agents', 'security-agent.js');
  const memoryPath = localPath('agents', 'memory.js');
  const watcherPath = localPath('surge', 'watcher.js');

  const touched = [
    orchestratorPath,
    analyzerPath,
    plannerPath,
    provisionerPath,
    validatorPath,
    securityPath,
    memoryPath,
    watcherPath
  ];

  for (const modulePath of touched) {
    clearModule(modulePath);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'connectpro-env-'));
  const saved = [];

  stubModule(analyzerPath, {
    runAnalyzer: async () => ({ services: ['supabase'], capabilities: [] })
  });
  stubModule(plannerPath, {
    runPlanner: async () => ({
      servicePlans: [{ service: 'supabase' }]
    })
  });
  stubModule(provisionerPath, {
    runProvisioner: async () => ({
      services: [
        {
          service: 'supabase',
          proxyKey: 'proxy_supabase',
          realKey: 'sb_service_role_real',
          env: {
            NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_anon_real',
            SUPABASE_SERVICE_ROLE_KEY: 'sb_service_role_real'
          }
        }
      ]
    })
  });
  stubModule(validatorPath, {
    runValidator: async () => ({ valid: true })
  });
  stubModule(securityPath, {
    runSecurityCheck: async () => ({ passed: true })
  });
  stubModule(memoryPath, {
    getMemory: async () => ({ connected: false }),
    saveMemory: async (userId, mcp) => saved.push({ userId, mcp })
  });

  class FakeWatcher {
    monitor() {}
  }
  stubModule(watcherPath, FakeWatcher);

  t.after(() => {
    for (const modulePath of touched) {
      clearModule(modulePath);
    }
  });

  const { runConnectPro } = require(orchestratorPath);
  const result = await runConnectPro('conectar supabase', 'user-env', { projectPath: tmpDir });
  const envFile = path.join(tmpDir, '.env.local');
  const envText = fs.readFileSync(envFile, 'utf8');

  assert.equal(result.success, true);
  assert.match(envText, /NEXT_PUBLIC_SUPABASE_URL=https:\/\/project\.supabase\.co/);
  assert.match(envText, /NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_anon_real/);
  assert.match(envText, /SUPABASE_SERVICE_ROLE_KEY=sb_service_role_real/);
  assert.equal(result.envFile.path, envFile);
  assert.deepEqual(result.envFile.variables.sort(), [
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]);
  assert.deepEqual(saved[0].mcp.proxyCredentials[0].envVars.sort(), result.envFile.variables.sort());
  assert.doesNotMatch(JSON.stringify(saved[0].mcp), /sb_service_role_real/);
});

test('provisioner records thrown strategy errors and continues to the next strategy', async (t) => {
  const provisionerPath = localPath('agents', 'provisioner.js');
  const catalogPath = localPath('core', 'connector-catalog.js');
  const proxyPath = localPath('tools', 'oauth-proxy.js');
  const mcpPath = localPath('tools', 'mcp-direct.js');
  const browserPath = localPath('tools', 'browser-auto.js');
  const apiPath = localPath('tools', 'api-http.js');
  const stripeToolPath = localPath('tools', 'stripe-tool.js');
  const supabaseToolPath = localPath('tools', 'supabase-tool.js');

  const touched = [
    provisionerPath,
    catalogPath,
    proxyPath,
    mcpPath,
    browserPath,
    apiPath,
    stripeToolPath,
    supabaseToolPath
  ];

  for (const modulePath of touched) {
    clearModule(modulePath);
  }

  const connector = {
    service: 'supabase',
    strategies: ['mcp_direct', 'browser_auto'],
    mcpDirect: { operation: 'provision_supabase' },
    browserAutomation: { mode: 'connect', script: () => 'noop' }
  };

  stubModule(catalogPath, {
    getConnector: () => connector,
    getOrderedStrategies: () => ['mcp_direct', 'browser_auto'],
    resolveConnectorStep: () => connector
  });
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
      throw new Error('mcp exploded');
    }
  });
  stubModule(browserPath, {
    runBrowserAutomationForStep: async () => ({
      success: true,
      credentials: { realKey: 'browser_real' },
      mode: 'browser_auto',
      engine: 'test-browser'
    })
  });
  stubModule(apiPath, {
    runApiHttpForConnector: async () => ({ success: false, reason: 'unused' })
  });
  stubModule(stripeToolPath, { provisionStripe: async () => null });
  stubModule(supabaseToolPath, { provisionSupabase: async () => null });

  const strategyAttempts = [];
  const registry = {
    recordStrategyAttempt: (entry) => strategyAttempts.push({ ...entry, status: 'started' }),
    recordStrategyOutcome: ({ service, strategy, status, reason }) => {
      const attempt = [...strategyAttempts].reverse().find((entry) =>
        entry.service === service && entry.strategy === strategy && entry.status === 'started'
      );
      Object.assign(attempt, { status, reason });
    }
  };

  t.after(() => {
    for (const modulePath of touched) {
      clearModule(modulePath);
    }
  });

  const runProvisioner = require(provisionerPath);
  const result = await runProvisioner(
    { servicePlans: [{ service: 'supabase', strategies: ['mcp_direct', 'browser_auto'] }] },
    'user-fallback',
    registry
  );

  assert.equal(result.services[0].realKey, 'browser_real');
  assert.equal(result.services[0].strategy, 'browser_auto');
  assert.deepEqual(
    strategyAttempts.map((entry) => [entry.strategy, entry.status, entry.reason || null]),
    [
      ['mcp_direct', 'failed', 'mcp exploded'],
      ['browser_auto', 'success', null]
    ]
  );
});

test('provisioner executes declared cli, codebase_cli and email_loop strategies', async (t) => {
  const provisionerPath = localPath('agents', 'provisioner.js');
  const catalogPath = localPath('core', 'connector-catalog.js');
  const proxyPath = localPath('tools', 'oauth-proxy.js');
  const mcpPath = localPath('tools', 'mcp-direct.js');
  const browserPath = localPath('tools', 'browser-auto.js');
  const apiPath = localPath('tools', 'api-http.js');
  const emailPath = localPath('tools', 'email-loop.js');
  const cliPath = localPath('tools', 'cli-strategy.js');
  const stripeToolPath = localPath('tools', 'stripe-tool.js');
  const supabaseToolPath = localPath('tools', 'supabase-tool.js');

  const touched = [
    provisionerPath,
    catalogPath,
    proxyPath,
    mcpPath,
    browserPath,
    apiPath,
    emailPath,
    cliPath,
    stripeToolPath,
    supabaseToolPath
  ];

  for (const modulePath of touched) {
    clearModule(modulePath);
  }

  const connectors = {
    vercel: { service: 'vercel', strategies: ['cli'] },
    github: { service: 'github', strategies: ['codebase_cli'] },
    google: { service: 'google', strategies: ['email_loop'], emailLoop: { queries: ['google code'] } }
  };

  stubModule(catalogPath, {
    getConnector: (service) => connectors[service],
    getOrderedStrategies: (connector) => connector.strategies,
    resolveConnectorStep: () => null
  });
  stubModule(proxyPath, {
    createProxyCredential: async (service, real, userId, meta = {}) => ({
      service,
      proxyKey: `proxy_${service}_${userId}`,
      realKey: real.realKey,
      env: real.env || null,
      ...meta
    })
  });
  stubModule(mcpPath, {
    runMcpDirectForConnector: async () => ({ success: false, reason: 'unused' })
  });
  stubModule(browserPath, {
    runBrowserAutomationForStep: async () => ({ success: false, reason: 'unused' })
  });
  stubModule(apiPath, {
    runApiHttpForConnector: async () => ({ success: false, reason: 'unused' })
  });
  stubModule(emailPath, {
    runEmailLoop: async () => ({
      success: true,
      credentials: {
        realKey: 'google_client_secret',
        env: { GOOGLE_CLIENT_SECRET: 'google_client_secret' }
      }
    })
  });
  stubModule(cliPath, {
    runCliForConnector: async (connector) => ({
      success: true,
      credentials: {
        realKey: `${connector.service}_token`,
        env: { [`${connector.service.toUpperCase()}_TOKEN`]: `${connector.service}_token` }
      }
    }),
    runCodebaseCliForConnector: async (connector) => ({
      success: true,
      credentials: {
        realKey: `${connector.service}_token`,
        env: { GITHUB_TOKEN: `${connector.service}_token` }
      }
    })
  });
  stubModule(stripeToolPath, { provisionStripe: async () => null });
  stubModule(supabaseToolPath, { provisionSupabase: async () => null });

  t.after(() => {
    for (const modulePath of touched) {
      clearModule(modulePath);
    }
  });

  const runProvisioner = require(provisionerPath);
  const result = await runProvisioner(
    {
      servicePlans: [
        { service: 'vercel' },
        { service: 'github' },
        { service: 'google' }
      ]
    },
    'user-strategies'
  );

  assert.deepEqual(
    result.services.map((service) => [service.service, service.strategy]).sort(),
    [
      ['github', 'codebase_cli'],
      ['google', 'email_loop'],
      ['vercel', 'cli']
    ]
  );
});

test('surge watcher performs active health checks instead of only logging', async () => {
  const SurgeWatcher = require(localPath('surge', 'watcher.js'));
  const watcher = new SurgeWatcher('user-surge', { autoStart: false, intervalMs: 5 });

  const healthyMcp = {
    id: 'mcp_live',
    status: 'active',
    proxyCredentials: [{ service: 'stripe', proxyKey: 'proxy_stripe' }],
    envFile: { path: '.env.local', variables: ['STRIPE_SECRET_KEY'] },
    createdAt: new Date().toISOString()
  };

  const monitorReport = watcher.monitor(healthyMcp);
  const healthyReport = await watcher.checkNow();
  const brokenReport = await watcher.checkNow({
    id: 'mcp_broken',
    status: 'active',
    proxyCredentials: []
  });

  watcher.beginSprint({ tasks: ['t1'] });
  const taskReport = watcher.onTaskComplete('t1', {
    registryStatus: { strategyAttempts: [] },
    mcp: healthyMcp
  });
  const sprintReport = watcher.endSprint({ mcp: healthyMcp });

  watcher.stop();

  assert.equal(monitorReport.healthy, true);
  assert.equal(healthyReport.healthy, true);
  assert.equal(healthyReport.checks.some((entry) => entry.name === 'proxy_credentials'), true);
  assert.equal(brokenReport.healthy, false);
  assert.equal(brokenReport.issues.some((issue) => issue.code === 'missing_proxy_credentials'), true);
  assert.equal(taskReport.type, 'task_validation');
  assert.equal(typeof taskReport.score, 'number');
  assert.equal(sprintReport.type, 'sprint_validation');
});
