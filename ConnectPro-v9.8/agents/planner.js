const callClaude = require('../tools/claude');
const { getConnector, getOrderedStrategies } = require('../core/connector-catalog');

function buildDeterministicPlan(analysis) {
  const services = Array.isArray(analysis?.services) ? analysis.services : [];
  const capabilities = Array.isArray(analysis?.capabilities) ? analysis.capabilities : [];
  const normalizedServices = services
    .map((service) => getConnector(service)?.service || String(service).toLowerCase())
    .filter(Boolean);

  // Capability hints that commonly map to a concrete service/tool.
  // This preserves the old service-first behavior, while allowing "I need X" requests
  // to be routed to a discoverable MCP connector.
  const normalizedCaps = capabilities.map((c) => String(c).toLowerCase());
  if (normalizedCaps.includes('workflow_automation') && !normalizedServices.includes('n8n')) {
    normalizedServices.push('n8n');
  }
  if (normalizedCaps.includes('email_confirmation') && !normalizedServices.includes('gmail')) {
    normalizedServices.push('gmail');
  }

  return {
    steps: normalizedServices.map((service) => `connect_${service}`),
    order: normalizedServices,
    servicePlans: normalizedServices.map((service) => ({
      service,
      strategies: getOrderedStrategies(service)
    })),
    capabilities
  };
}

async function runPlanner(analysis) {
  if (Array.isArray(analysis?.services) && analysis.services.length > 0) {
    return buildDeterministicPlan(analysis);
  }

  const prompt = `Você é o Agent Planner. Crie um plano de conexão simples e seguro.
Input: ${JSON.stringify(analysis)}
Responda APENAS JSON: { "steps": ["connect_stripe", "connect_supabase"], "order": [...], "capabilities": ["web_search"] }`;
  return await callClaude(prompt);
}

module.exports = runPlanner;
module.exports.runPlanner = runPlanner;
