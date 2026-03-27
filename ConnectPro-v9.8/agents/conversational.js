const callClaude = require('../tools/claude');

async function runConversational(userMessage, error, registry) {
  const prompt = `Você é o Agent Conversacional gentil do ConnectPro.
Usuário disse: "${userMessage}"
Erro: ${error}
Explique em português simples, como para uma avó, e peça só o mínimo necessário.
Responda em texto humano.`;
  const response = await callClaude(prompt, false); // texto livre
  return { success: false, message: response, registryStatus: registry.getStatus() };
}

module.exports = runConversational;
module.exports.runConversational = runConversational;
