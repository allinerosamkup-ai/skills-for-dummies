const callClaude = require('../tools/claude');

async function runAnalyzer(userMessage) {
  const prompt = `Você é o Agent Analyzer do ConnectPro (Tresformar).
Analise esta mensagem do usuário e retorne APENAS JSON com os serviços necessários.
Não explique nada. Exemplo de saída:
{
  "services": ["stripe", "supabase"],
  "intent": "receber pagamentos",
  "minDataNeeded": ["email"]
}
Mensagem: "${userMessage}"`;

  return await callClaude(prompt);
}

module.exports = runAnalyzer;
module.exports.runAnalyzer = runAnalyzer;
