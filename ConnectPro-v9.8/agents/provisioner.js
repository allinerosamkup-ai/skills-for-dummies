const { provisionStripe, provisionSupabase } = require('../tools/stripe-tool');
const { createProxyCredential } = require('../tools/oauth-proxy');

module.exports = async function runProvisioner(plan, userId) {
  const results = [];
  for (const step of plan.steps) {
    if (step.includes('stripe')) {
      const real = await provisionStripe();
      results.push(await createProxyCredential('stripe', real, userId));
    }
    if (step.includes('supabase')) {
      const real = await provisionSupabase();
      results.push(await createProxyCredential('supabase', real, userId));
    }
  }
  return { services: results };
};
