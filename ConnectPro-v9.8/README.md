# ConnectPro package v9.8 — runtime bundle, skill contract v3.2

Skill multi-agente oficial do Super App Tresformar.
Alinhada 100% com o pitch (MCP + Coordination Protocol + SURGE).

Nota: a especificação comportamental canônica desta skill está em [`SKILL.md`](./SKILL.md).
Este `README.md` descreve o pacote/runtime desta pasta, não substitui o contrato da skill.

## O que mudou (abril/2026)

- `.env.local` real: ConnectPro escreve variáveis resolvidas em `.env.local` (e o envelope MCP só guarda nomes, nunca valores).
- Fallback resiliente: uma estratégia que dá exception não derruba o fluxo; ele registra e tenta a próxima.
- Estratégias que existiam só no catálogo agora executam: `cli`, `codebase_cli`, `email_loop`.
- SURGE 24/7 real: watcher faz health checks e validação por tarefa (não só no fim da sprint).

Rodar:
npm install
node server.js

Usar em qualquer skill:
const { runConnectPro } = require('../ConnectPro-v9.8/agents/orchestrator');
