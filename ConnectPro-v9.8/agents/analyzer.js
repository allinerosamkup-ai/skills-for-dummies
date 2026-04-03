const callClaude = require('../tools/claude');

async function runAnalyzer(userMessage) {
  const prompt = `Você é o Agent Analyzer do ConnectPro (Tresformar).
Analise esta mensagem do usuário e retorne APENAS JSON com:
- services: lista de serviços (ex: stripe, supabase, github) quando detectáveis
- capabilities: lista de capacidades quando o usuário descreve "o que precisa" sem nome do serviço
  (ex: "web_search", "browser_automation", "email_confirmation", "workflow_automation", "image_to_code")
Não explique nada. Exemplo de saída:
{
  "services": ["stripe", "supabase"],
  "capabilities": ["web_search", "browser_automation"],
  "intent": "receber pagamentos",
  "minDataNeeded": ["email"]
}
Mensagem: "${userMessage}"`;

  return await callClaude(prompt);
}

module.exports = runAnalyzer;
module.exports.runAnalyzer = runAnalyzer;
