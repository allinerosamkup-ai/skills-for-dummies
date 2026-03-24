const callClaude = require('../tools/claude');

module.exports = async function runPlanner(analysis) {
  const prompt = `Você é o Agent Planner. Crie um plano de conexão simples e seguro.
Input: ${JSON.stringify(analysis)}
Responda APENAS JSON: { "steps": ["oauth_stripe", "create_supabase_project"], "order": [...] }`;
  return await callClaude(prompt);
};
