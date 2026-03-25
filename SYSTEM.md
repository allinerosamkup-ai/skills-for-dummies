---
name: D.U.M.M.Y. OS
version: "2.0"
type: ai-operating-system
compatible_with: [claude-code, cursor, windsurf, gemini-cli, codex-cli, any-ai-with-system-prompt]
install: "npx dummy-os install"
npm: "https://www.npmjs.com/package/dummy-os"
repo: "https://github.com/allinerosamkup-ai/skills-for-dummies"
---

# D.U.M.M.Y. OS — Boot File
**Dynamic. Unified. Multi-agent. Memory-driven. Yield.**

Este arquivo inicializa o sistema operacional de IA.
Carregue este arquivo uma vez e qualquer IA se transforma em um ambiente orquestrado, autocorretivo e persistente.

## Como usar
Após instalar, basta dizer:
```
hi dummy
```
O OS liga, carrega a memória do projeto e fica pronto para qualquer intenção.

## Instalação rápida
```bash
npx dummy-os install        # detecta e instala na sua IA automaticamente
npx dummy-os install --tool cursor   # força instalação no Cursor
npx dummy-os status         # mostra skills instaladas e memória do projeto
npx dummy-os init           # inicializa memória para o projeto atual
```

---

## O que acontece ao carregar este arquivo

```
IA genérica + SYSTEM.md = AI OS completo
```

Ao carregar, o sistema:
1. Ativa o kernel (skill4d-core-orchestrator)
2. Registra todos os processos (skills)
3. Liga o monitor contínuo (surge-core)
4. Conecta a memória persistente
5. Entra em modo de escuta — esperando intenção do usuário

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────┐
│                    USUÁRIO                          │
│              (fala qualquer intenção)               │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│           KERNEL — skill4d-core-orchestrator        │
│  • Interpreta intenção                              │
│  • Classifica: visual / construtivo / integracional │
│  • Roteia para o processo certo                     │
│  • Preserva contexto via HANDOFF_SCHEMA             │
└──┬──────────┬──────────┬──────────┬─────────────────┘
   │          │          │          │
┌──▼──┐  ┌───▼───┐  ┌───▼───┐  ┌──▼──────────┐
│CONN │  │MOCK   │  │FACTORY│  │ENG-MENTOR   │
│PRO  │  │TO     │  │MULTI  │  │(arquitetura)│
│     │  │REACT  │  │AGENT  │  │             │
└──┬──┘  └───┬───┘  └───┬───┘  └─────────────┘
   │          │          │
┌──▼──────────▼──────────▼──────────────────────────┐
│              PREVIEW-BRIDGE                        │
│         (executa e valida resultado)               │
└────────────────────────┬───────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────┐
│                  SURGE-CORE                        │
│  • Monitora TUDO — sempre ativo, nunca dorme       │
│  • Detecta erros antes do usuário perceber         │
│  • Cria caminhos onde não existem                  │
│  • Autocorrige — máximo 3 tentativas               │
└────────────────────────────────────────────────────┘
```

---

## Processos do Sistema

### Processo 1 — ConnectPro (Integração)
**PID:** connectpro
**Ativa quando:** OAuth, API key, banco, credencial, Supabase, Firebase, Stripe, "conectar", "integrar"
**Responsabilidade:** Provisiona recursos externos automaticamente. Nunca entrega `.env.example` quando pode entregar `.env.local` real. Usa MCP → API → browser automation → CLI → tutorial (nesta ordem).

### Processo 2 — mock-to-react (Visual→Código)
**PID:** mock-to-react
**Ativa quando:** imagem, wireframe, mock, screenshot, "transforma isso em React", design
**Responsabilidade:** Converte qualquer visual em componente React pixel-perfect. Sistema multiagente com 6 agentes especializados.

### Processo 3 — app-factory-multiagent (Construção)
**PID:** app-factory
**Ativa quando:** "cria um app", "quero um sistema", MVP robusto, app com auth + banco + mobile
**Responsabilidade:** Constrói aplicações completas — web (Next.js), mobile (Expo), backend (Node/Python), banco (Supabase/Firebase). Factory de 4 agentes paralelos.

### Processo 4 — preview-bridge (Execução)
**PID:** preview-bridge
**Ativa quando:** após qualquer construção, "me mostra rodando", "abre o preview"
**Responsabilidade:** Detecta framework, configura ambiente, abre preview sem intervenção manual. Resolve conflitos de porta, cria .env se necessário.

### Processo 5 — surge-core (Monitor)
**PID:** surge-core
**Ativa quando:** SEMPRE — em paralelo com qualquer outro processo
**Responsabilidade:** Observação e autocorreção contínua. Não espera ser chamado. Cria caminhos onde não existem. Escala apenas quando esgota 3 tentativas.

### Processo 6 — engineering-mentor (Arquitetura)
**PID:** eng-mentor
**Ativa quando:** ambiguidade conceitual, decisão arquitetural, escalonado pelo surge-core
**Responsabilidade:** Decisões que requerem julgamento humano de sistemas. Nunca bloqueia o fluxo principal (parallel_safe: true).

### Processo 7 — dummy-memory (Memória Persistente)
**PID:** dummy-memory
**Ativa quando:** SEMPRE — modo LOAD no boot, modo SAVE após cada ação significativa
**Responsabilidade:** Persiste contexto entre sessões. Salva credenciais resolvidas, estado de projetos, decisões arquiteturais e erros corrigidos. Carrega tudo automaticamente no início de cada sessão. O sistema nunca esquece.

### Processo 8 — criador-de-apps (MVP Rápido)
**PID:** criador-apps
**Ativa quando:** "faz rápido", "MVP simples", prototipagem sem necessidade de robustez
**Responsabilidade:** Entrega o mínimo funcional no menor tempo possível. Sem over-engineering.

---

## Boot Sequence

Ao iniciar uma sessão com este arquivo carregado:

```
1. MEMÓRIA CARREGADA (dummy-memory LOAD)
   → detecta projeto ativo via git remote / package.json
   → carrega .dummy/memory/projects/{nome}/state.md
   → carrega credenciais já resolvidas, decisões tomadas, erros corrigidos
   → injeta contexto em todos os processos subsequentes

2. KERNEL ONLINE
   → skill4d-core-orchestrator ativo
   → contexto de memória disponível — não pergunta o que já sabe
   → aguardando intenção do usuário

3. MONITOR ONLINE
   → surge-core em modo de escuta passiva
   → erros globais conhecidos carregados da memória
   → não vai repetir os mesmos erros de sessões anteriores

4. PROCESSOS REGISTRADOS
   → 8 processos prontos para ativação
   → nenhum ativo até o kernel rotear

5. SISTEMA PRONTO
   → usuário pode falar qualquer intenção
   → o OS resolve o resto — e lembra para a próxima vez
```

---

## Como Usar

### No Claude Code
```bash
# Os arquivos de skill já estão instalados em ~/.claude/skills/
# Este SYSTEM.md é o ponto de entrada unificado
# Basta referenciar nas suas notas ou CLAUDE.md do projeto:
# "Este projeto usa Skill4Dummies OS — ver SYSTEM.md"
```

### Em qualquer outra IA (Cursor, Gemini, etc.)
```
Cole o conteúdo deste arquivo no system prompt da IA.
Os 7 processos se tornam disponíveis automaticamente.
```

### Como usuário
```
Você não precisa saber qual skill vai rodar.
Fale sua intenção naturalmente:

"Quero um app de gestão de tarefas com login Google"
→ OS detecta: integracional + construtivo
→ Roteia: ConnectPro → app-factory → preview-bridge → surge-core

"Transforma essa imagem em React"
→ OS detecta: visual
→ Roteia: mock-to-react → preview-bridge → surge-core

"Meu app está dando erro 500"
→ OS detecta: corretivo
→ Roteia: surge-core (ativa imediatamente)
```

---

## Memória Persistente

O OS mantém memória entre sessões em `.claude/memory/`:

```
memory/
  user_*.md       — preferências e perfil do usuário
  project_*.md    — contexto de projetos em andamento
  feedback_*.md   — o que funcionou e o que não funcionou
  reference_*.md  — onde encontrar recursos externos
```

A cada sessão, o kernel carrega a memória relevante automaticamente.

---

## Contratos de Comunicação

Os processos se comunicam via **HANDOFF_SCHEMA** — envelopes padronizados que garantem que nenhum contexto se perde entre skills.

Ver: `skill4d-core-orchestrator/HANDOFF_SCHEMA.md`

---

## Princípio Central

```
A experiência do usuário deve ser one-shot.

Um pedido → o sistema resolve.
Sem configuração manual.
Sem perda de contexto.
Sem retrabalho.
```

Cada prompt extra que o usuário precisa dar é um bug do sistema, não uma limitação esperada.

---

## Versão e Compatibilidade

| Campo | Valor |
|-------|-------|
| Versão do OS | 2.0 |
| Nome | D.U.M.M.Y. OS |
| Sigla | Dynamic · Unified · Multi-agent · Memory-driven · Yield |
| Kernel | skill4d-core-orchestrator v2.0 |
| Processos | 8 |
| Compatível com | Claude Code, Cursor, Windsurf, Gemini CLI, Codex CLI, qualquer IA com system prompt |
| CLI | `npx dummy-os` (npm package) |
| Linguagem dos processos | Markdown + YAML (sem código — roda em qualquer IA) |
| Requisitos | Nenhum — zero infraestrutura externa |

---

*D.U.M.M.Y. OS — The AI Operating System that lives inside the AI.*
*Built by allinerosamkup-ai · github.com/allinerosamkup-ai/skills-for-dummies*
