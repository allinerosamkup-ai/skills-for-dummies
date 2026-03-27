const callClaude = require('../tools/claude');
const { getConnector, getOrderedStrategies } = require('../core/connector-catalog');

function buildDeterministicPlan(analysis) {
  const services = Array.isArray(analysis?.services) ? analysis.services : [];
  const normalizedServices = services
    .map((service) => getConnector(service)?.service || String(service).toLowerCase())
    .filter(Boolean);

  return {
    steps: normalizedServices.map((service) => `connect_${service}`),
    order: normalizedServices,
    servicePlans: normalizedServices.map((service) => ({
      service,
      strategies: getOrderedStrategies(service)
    }))
  };
}

async function runPlanner(analysis) {
  if (Array.isArray(analysis?.services) && analysis.services.length > 0) {
    return buildDeterministicPlan(analysis);
  }

  const prompt = `Você é o Agent Planner. Crie um plano de conexão simples e seguro.
Input: ${JSON.stringify(analysis)}
Responda APENAS JSON: { "steps": ["oauth_stripe", "create_supabase_project"], "order": [...] }`;
  return await callClaude(prompt);
}

module.exports = runPlanner;
module.exports.runPlanner = runPlanner;
