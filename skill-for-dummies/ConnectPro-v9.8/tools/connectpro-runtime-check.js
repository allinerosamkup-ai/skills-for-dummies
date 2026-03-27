const { getConnectProReadiness } = require('./connectpro-readiness');
const { canUseMcpInboxProvider } = require('./inbox-provider');
const { resolveMcpProvider } = require('./mcp-direct');
const { discoverConnectorByService } = require('./mcp-discovery');

function valueFromEnv(env, key) {
  if (env && Object.prototype.hasOwnProperty.call(env, key)) {
    return env[key];
  }
  return process.env[key];
}

function requirementStatus(env, key, label) {
  return {
    name: label,
    available: Boolean(valueFromEnv(env, key)),
    source: key
  };
}

async function getConnectProRuntimeCheck({ mcpProvider, inboxProvider, env, probeService = 'airtable' } = {}) {
  const resolvedMcpProvider = resolveMcpProvider(mcpProvider);
  const readiness = getConnectProReadiness({ mcpProvider: resolvedMcpProvider });
  const unknownService = resolvedMcpProvider
    ? await discoverConnectorByService(probeService, { provider: resolvedMcpProvider })
    : null;

  return {
    ready: readiness.ready,
    providers: {
      ...readiness.providers,
      mcp: {
        ...readiness.providers.mcp,
        available: readiness.providers.mcp.available || Boolean(resolvedMcpProvider)
      },
      inbox: {
        ...readiness.providers.inbox,
        available:
          readiness.providers.inbox.available ||
          Boolean(inboxProvider) ||
          canUseMcpInboxProvider(resolvedMcpProvider)
      }
    },
    requirements: {
      postgres: requirementStatus(env, 'POSTGRES_URL', 'Postgres persistence')
    },
    probes: {
      unknownServiceDiscovery: {
        available: Boolean(unknownService),
        service: unknownService?.service || probeService,
        strategy: unknownService?.strategies?.[0] || null
      }
    }
  };
}

if (require.main === module) {
  getConnectProRuntimeCheck()
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    })
    .catch((error) => {
      process.stderr.write(String(error.message || error));
      process.exit(1);
    });
}

module.exports = {
  getConnectProRuntimeCheck
};
