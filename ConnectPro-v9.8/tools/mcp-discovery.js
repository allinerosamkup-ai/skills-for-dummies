const { getMcpService } = require('../core/mcp-inventory');
const { resolveMcpProvider } = require('./mcp-direct');

function normalizeRegistryResult(result, requestedService) {
  if (!result || typeof result !== 'object') {
    return null;
  }

  const service = String(result.service || requestedService || '').toLowerCase();
  const provisionOperation =
    result.operations?.provision ||
    result.operation ||
    result.provisionOperation ||
    `connect_${service}`;

  if (!service || !provisionOperation) {
    return null;
  }

  return {
    service,
    aliases: [service],
    strategies: ['mcp_direct'],
    mcpDirect: {
      operation: provisionOperation,
      input: {},
      mcp: {
        id: result.id || null,
        operations: result.operations || {}
      }
    }
  };
}

async function discoverConnectorByService(service, { provider } = {}) {
  const resolvedProvider = resolveMcpProvider(provider);
  if (!resolvedProvider) {
    return null;
  }

  const registry = getMcpService('mcp_registry');
  if (!registry?.operations?.search) {
    return null;
  }

  const response = await resolvedProvider.invoke({
    service: 'mcp_registry',
    operation: registry.operations.search,
    input: { query: service, service },
    mcp: registry
  });

  const results = Array.isArray(response?.results)
    ? response.results
    : Array.isArray(response?.services)
      ? response.services
      : [];

  const exactMatch = results.find((entry) => String(entry?.service || '').toLowerCase() === String(service || '').toLowerCase());
  const candidate = exactMatch || results[0] || null;
  return normalizeRegistryResult(candidate, service);
}

module.exports = {
  discoverConnectorByService,
  normalizeRegistryResult
};
