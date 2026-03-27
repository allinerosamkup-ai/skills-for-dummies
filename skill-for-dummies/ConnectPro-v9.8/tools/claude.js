function extractFirstJsonObject(text) {
  try {
    return JSON.parse(text);
  } catch {}

  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch) {
    return JSON.parse(fencedMatch[1]);
  }

  const starts = ['{', '['];
  for (let i = 0; i < text.length; i++) {
    if (!starts.includes(text[i])) continue;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let j = i; j < text.length; j++) {
      const ch = text[j];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === '"') {
          inString = false;
        }
        continue;
      }

      if (ch === '"') {
        inString = true;
        continue;
      }

      if (ch === '{' || ch === '[') depth++;
      if (ch === '}' || ch === ']') depth--;

      if (depth === 0) {
        const candidate = text.slice(i, j + 1);
        return JSON.parse(candidate);
      }
    }
  }

  throw new SyntaxError('No JSON object found in model response');
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function detectServices(message) {
  const value = normalizeText(message);
  const mapping = [
    ['stripe', ['stripe', 'checkout', 'payment', 'pagamento']],
    ['supabase', ['supabase', 'postgres', 'database', 'banco']],
    ['github', ['github', 'gh', 'repo', 'reposit']],
    ['vercel', ['vercel', 'deploy']],
    ['figma', ['figma', 'design']],
    ['google', ['google', 'gmail', 'oauth', 'google cloud']],
    ['n8n', ['n8n', 'workflow', 'automação', 'automacao']],
    ['notion', ['notion']],
    ['google_drive', ['google drive', 'drive']]
  ];

  return uniq(
    mapping
      .filter(([, aliases]) => aliases.some((alias) => value.includes(alias)))
      .map(([service]) => service)
  );
}

function inferIntent(message, services) {
  const value = normalizeText(message);
  if (value.includes('conect')) return `conectar ${services.join(', ') || 'serviços'}`;
  if (value.includes('pag')) return 'receber pagamentos';
  if (value.includes('deploy')) return 'publicar projeto';
  if (services.length > 0) return `integrar ${services.join(', ')}`;
  return 'resolver integrações';
}

function analyzePrompt(prompt) {
  const messageMatch = prompt.match(/Mensagem:\s*"([\s\S]*)"$/);
  const message = messageMatch ? messageMatch[1] : prompt;
  const services = detectServices(message);

  return {
    services,
    intent: inferIntent(message, services),
    minDataNeeded: ['email']
  };
}

function planPrompt(prompt) {
  const inputMatch = prompt.match(/Input:\s*([\s\S]*)/);
  if (inputMatch) {
    try {
      const parsed = extractFirstJsonObject(inputMatch[1]);
      const services = Array.isArray(parsed?.services) ? parsed.services.map((service) => String(service).toLowerCase()) : [];
      return {
        steps: services.map((service) => `connect_${service}`),
        order: services,
        servicePlans: services.map((service) => ({ service, strategies: [] }))
      };
    } catch {}
  }

  return { steps: [], order: [], servicePlans: [] };
}

function conversationalPrompt(prompt) {
  const userMatch = prompt.match(/Usuário disse:\s*"([\s\S]*?)"/);
  const errorMatch = prompt.match(/Erro:\s*([\s\S]*?)\nExplique/i);
  const userMessage = userMatch ? userMatch[1] : 'sua solicitação';
  const error = errorMatch ? errorMatch[1].trim() : 'houve um problema na integração';
  return `Não consegui concluir "${userMessage}" porque ${error}. Preciso só do mínimo necessário para continuar.`;
}

async function callClaude(prompt, json = true) {
  if (prompt.includes('Agent Analyzer do ConnectPro')) {
    return analyzePrompt(prompt);
  }

  if (prompt.includes('Agent Planner')) {
    return planPrompt(prompt);
  }

  if (!json && prompt.includes('Agent Conversacional')) {
    return conversationalPrompt(prompt);
  }

  return json ? extractFirstJsonObject(prompt) : String(prompt);
}

callClaude.extractFirstJsonObject = extractFirstJsonObject;
callClaude.detectServices = detectServices;
module.exports = callClaude;
