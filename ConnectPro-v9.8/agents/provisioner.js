const { provisionStripe } = require('../tools/stripe-tool');
const { provisionSupabase } = require('../tools/supabase-tool');
const { createProxyCredential } = require('../tools/oauth-proxy');
const { getConnector, getOrderedStrategies, resolveConnectorStep } = require('../core/connector-catalog');
const { runBrowserAutomationForStep } = require('../tools/browser-auto');
const { runMcpDirectForConnector } = require('../tools/mcp-direct');
const { runApiHttpForConnector } = require('../tools/api-http');
const { discoverConnectorByService } = require('../tools/mcp-discovery');
const { runEmailLoop } = require('../tools/email-loop');
const { runCliForConnector, runCodebaseCliForConnector } = require('../tools/cli-strategy');

function errorReason(error) {
  return String(error?.message || error?.code || error || 'strategy_threw');
}

async function executeStrategy({ connector, strategy, step }) {
  if (strategy === 'mcp_direct') {
    return runMcpDirectForConnector(connector);
  }

  if (strategy === 'api_http') {
    return runApiHttpForConnector(connector);
  }

  if (strategy === 'browser_auto') {
    return runBrowserAutomationForStep({
      step,
      service: connector.service,
      connector
    });
  }

  if (strategy === 'email_loop') {
    return runEmailLoop({
      connector,
      service: connector.service
    });
  }

  if (strategy === 'cli') {
    return runCliForConnector(connector);
  }

  if (strategy === 'codebase_cli') {
    return runCodebaseCliForConnector(connector);
  }

  return { success: false, reason: 'strategy-not-implemented' };
}

function strategyFailureReason(strategy, provision) {
  if (provision?.reason) return provision.reason;

  if (provision?.success && !provision.credentials) {
    return `${strategy}_no_credentials`;
  }

  return `${strategy}_not_resolved`;
}

async function tryStrategy({ connector, strategy, step, userId, registry }) {
  registry?.recordStrategyAttempt({
    service: connector.service,
    strategy,
    step
  });

  let provision = null;

  try {
    provision = await executeStrategy({ connector, strategy, step });
  } catch (error) {
    registry?.recordStrategyOutcome({
      service: connector.service,
      strategy,
      status: 'failed',
      reason: errorReason(error)
    });
    return null;
  }

  if (provision?.success && provision.credentials) {
    registry?.recordStrategyOutcome({
      service: connector.service,
      strategy,
      status: 'success'
    });

    return createProxyCredential(connector.service, provision.credentials, userId, {
      mode: provision.mode || strategy,
      engine: provision.engine || null,
      strategy
    });
  }

  registry?.recordStrategyOutcome({
    service: connector.service,
    strategy,
    status: 'failed',
    reason: strategyFailureReason(strategy, provision)
  });

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

function normalizeCapability(capability) {
  return String(capability || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

async function runProvisioner(plan, userId, registry = null) {
  const results = [];
  const servicePlans = Array.isArray(plan?.servicePlans) ? plan.servicePlans : [];
  const capabilities = Array.isArray(plan?.capabilities) ? plan.capabilities : [];
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
    // Provision capabilities (capability-first) as additional connectors when requested.
    // These may map to an MCP/tool via the registry even when no explicit service exists.
    for (const capability of capabilities) {
      const normalized = normalizeCapability(capability);
      if (!normalized) continue;

      const connector = await resolveConnectorForService(normalized);
      if (!connector) continue;

      const orderedStrategies = getOrderedStrategies(connector);
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
