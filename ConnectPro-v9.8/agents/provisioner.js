const { provisionStripe } = require('../tools/stripe-tool');
const { provisionSupabase } = require('../tools/supabase-tool');
const { createProxyCredential } = require('../tools/oauth-proxy');
const { getConnector, getOrderedStrategies, resolveConnectorStep } = require('../core/connector-catalog');
const { runBrowserAutomationForStep } = require('../tools/browser-auto');
const { runMcpDirectForConnector } = require('../tools/mcp-direct');
const { runApiHttpForConnector } = require('../tools/api-http');
const { discoverConnectorByService } = require('../tools/mcp-discovery');

async function tryStrategy({ connector, strategy, step, userId, registry }) {
  registry?.recordStrategyAttempt({
    service: connector.service,
    strategy,
    step
  });

  if (strategy === 'mcp_direct') {
    const mcpProvision = await runMcpDirectForConnector(connector);
    if (mcpProvision.success && mcpProvision.credentials) {
      registry?.recordStrategyOutcome({
        service: connector.service,
        strategy,
        status: 'success'
      });
      return createProxyCredential(connector.service, mcpProvision.credentials, userId, {
        mode: mcpProvision.mode,
        strategy
      });
    }
    registry?.recordStrategyOutcome({
      service: connector.service,
      strategy,
      status: 'failed',
      reason: mcpProvision.reason || 'mcp_direct_not_resolved'
    });
  }

  if (strategy === 'api_http') {
    const apiProvision = await runApiHttpForConnector(connector);
    if (apiProvision.success && apiProvision.credentials) {
      registry?.recordStrategyOutcome({
        service: connector.service,
        strategy,
        status: 'success'
      });
      return createProxyCredential(connector.service, apiProvision.credentials, userId, {
        mode: apiProvision.mode,
        strategy
      });
    }
    registry?.recordStrategyOutcome({
      service: connector.service,
      strategy,
      status: 'failed',
      reason: apiProvision.reason || 'api_http_not_resolved'
    });
  }

  if (strategy === 'browser_auto') {
    const browserProvision = await runBrowserAutomationForStep({
      step,
      service: connector.service,
      connector
    });

    if (browserProvision.success && browserProvision.credentials) {
      registry?.recordStrategyOutcome({
        service: connector.service,
        strategy,
        status: 'success'
      });
      return createProxyCredential(connector.service, browserProvision.credentials, userId, {
        mode: browserProvision.mode,
        engine: browserProvision.engine,
        strategy
      });
    }
    registry?.recordStrategyOutcome({
      service: connector.service,
      strategy,
      status: 'failed',
      reason: browserProvision.reason || 'browser_auto_not_resolved'
    });
  }

  return null;
}

async function fallbackProvision(step, userId) {
  if (step.includes('stripe')) {
    const real = await provisionStripe();
    if (!real?.realKey) return null;
    return createProxyCredential('stripe', real, userId, { mode: 'fallback_tool', strategy: 'fallback_tool' });
  }

  if (step.includes('supabase')) {
    const real = await provisionSupabase();
    if (!real?.realKey) return null;
    return createProxyCredential('supabase', real, userId, { mode: 'fallback_tool', strategy: 'fallback_tool' });
  }

  return null;
}

async function resolveConnectorForService(service) {
  const catalogConnector = getConnector(service);
  if (catalogConnector) {
    return catalogConnector;
  }

  return discoverConnectorByService(service);
}

function inferServiceFromStep(step) {
  const value = String(step || '').toLowerCase();
  if (value.startsWith('connect_')) {
    return value.slice('connect_'.length);
  }
  return null;
}

async function runProvisioner(plan, userId, registry = null) {
  const results = [];
  const servicePlans = Array.isArray(plan?.servicePlans) ? plan.servicePlans : [];
  const steps = Array.isArray(plan?.steps) ? plan.steps : [];

  for (const servicePlan of servicePlans) {
    const connector = await resolveConnectorForService(servicePlan.service);
    if (!connector) continue;

    const orderedStrategies = servicePlan.strategies?.length
      ? servicePlan.strategies
      : getOrderedStrategies(connector);

    let provisioned = null;
    for (const strategy of orderedStrategies) {
      provisioned = await tryStrategy({
        connector,
        strategy,
        step: `connect_${connector.service}`,
        userId,
        registry
      });
      if (provisioned) break;
    }

    if (!provisioned) {
      provisioned = await fallbackProvision(`connect_${connector.service}`, userId);
    }

    if (provisioned) {
      results.push(provisioned);
    }
  }

  if (servicePlans.length > 0) {
    return { services: results };
  }

  for (const step of steps) {
    const connector = resolveConnectorStep(step) || await resolveConnectorForService(inferServiceFromStep(step));

    if (connector) {
      const orderedStrategies = getOrderedStrategies(connector);
      let provisioned = null;

      for (const strategy of orderedStrategies) {
        provisioned = await tryStrategy({ connector, strategy, step, userId, registry });
        if (provisioned) {
          results.push(provisioned);
          break;
        }
      }

      if (provisioned) continue;
    }

    const fallback = await fallbackProvision(step, userId);
    if (fallback) results.push(fallback);
  }
  return { services: results };
}

module.exports = runProvisioner;
module.exports.runProvisioner = runProvisioner;
