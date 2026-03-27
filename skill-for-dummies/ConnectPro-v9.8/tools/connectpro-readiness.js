const { CONNECTOR_CATALOG, getOrderedStrategies } = require('../core/connector-catalog');
const { canUseMcpInboxProvider, getBundledInboxBridgeConfig } = require('./inbox-provider');
const { getBundledMcpBridgeConfig, resolveMcpProvider } = require('./mcp-direct');

function getInboxProviderStatus({ mcpProvider } = {}) {
  if (process.env.CONNECTPRO_INBOX_COMMAND) {
    return { available: true, source: 'command' };
  }

  if (process.env.CONNECTPRO_INBOX_SEARCH_URL && process.env.CONNECTPRO_INBOX_READ_URL) {
    return { available: true, source: 'http' };
  }

  if (getBundledInboxBridgeConfig()) {
    return { available: true, source: 'bundled_bridge' };
  }

  const resolvedMcpProvider = resolveMcpProvider(mcpProvider);
  if (canUseMcpInboxProvider(resolvedMcpProvider)) {
    return { available: true, source: 'mcp_bridge' };
  }

  return { available: false, source: 'unconfigured' };
}

function getMcpProviderStatus() {
  if (process.env.CONNECTPRO_MCP_COMMAND) {
    return { available: true, source: 'command' };
  }

  if (getBundledMcpBridgeConfig()) {
    return { available: true, source: 'bundled_bridge' };
  }

  return { available: false, source: 'unconfigured' };
}

function hasToken(envName) {
  if (!envName) return true;
  return Boolean(process.env[envName]);
}

function isBrowserAvailable() {
  try {
    require.resolve('playwright');
    return true;
  } catch {
    return false;
  }
}

function getStrategyStatus(connector, strategy, providerStatus) {
  if (strategy === 'mcp_direct') {
    return {
      name: strategy,
      available: providerStatus.mcp.available && Boolean(connector.mcpDirect?.operation),
      source: providerStatus.mcp.source
    };
  }

  if (strategy === 'api_http') {
    return {
      name: strategy,
      available: Boolean(connector.apiHttp?.url) && hasToken(connector.apiHttp?.tokenEnv),
      source: connector.apiHttp?.tokenEnv || 'direct'
    };
  }

  if (strategy === 'browser_auto') {
    return {
      name: strategy,
      available: isBrowserAvailable(),
      source: 'connectpro-browser'
    };
  }

  if (strategy === 'email_loop') {
    return {
      name: strategy,
      available: providerStatus.inbox.available && Boolean(connector.emailLoop),
      source: providerStatus.inbox.source
    };
  }

  return {
    name: strategy,
    available: false,
    source: 'not_implemented'
  };
}

function getConnectorReadiness(connector, providerStatus) {
  const strategies = getOrderedStrategies(connector).map((strategy) =>
    getStrategyStatus(connector, strategy, providerStatus)
  );

  return {
    service: connector.service,
    strategies,
    ready: strategies.some((entry) => entry.available)
  };
}

function getConnectProReadiness(options = {}) {
  const providerStatus = {
    inbox: getInboxProviderStatus(options),
    mcp: getMcpProviderStatus()
  };

  const connectors = Object.fromEntries(
    Object.values(CONNECTOR_CATALOG).map((connector) => [
      connector.service,
      getConnectorReadiness(connector, providerStatus)
    ])
  );

  return {
    ready: Object.values(connectors).some((entry) => entry.ready),
    providers: providerStatus,
    connectors
  };
}

if (require.main === module) {
  process.stdout.write(`${JSON.stringify(getConnectProReadiness(), null, 2)}\n`);
}

module.exports = {
  getConnectProReadiness,
  getConnectorReadiness,
  getInboxProviderStatus,
  getMcpProviderStatus,
  getStrategyStatus
};
