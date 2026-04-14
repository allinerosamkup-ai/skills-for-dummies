---
name: dummy-memory
description: "Use when persistent project memory is needed to load prior context at session start, save meaningful progress without blocking flow, and recover what was decided, configured, or fixed across sessions."
---

# dummy-memory v1.1 — Memória Persistente do D.U.M.M.Y. OS

Sem dummy-memory, cada sessão começa do zero.
Com dummy-memory, o OS lembra — projetos, credenciais, decisões, erros corrigidos.

Contrato detalhado de leitura/escrita → **SPEC.md**

---

## Contract Snapshot

```yaml
name: dummy-memory
role: memória persistente
objective: carregar contexto útil no boot, salvar progresso relevante sem bloquear o fluxo e consolidar memória para evitar degradação

activation_rules:
  - rule: início de sessão precisa recuperar estado do projeto
    priority: high
  - rule: ação significativa foi concluída (build, fix, decisão, integração, preview)
    priority: high
  - rule: usuário pede retomada, histórico, contexto ou consolidação de memória
    priority: medium
  - rule: orchestrator está prestes a chamar skill com dependsOn (injetar snapshot no handoff)
    priority: high
  - rule: usuário pede "dummy snapshot" ou "o que cada skill produziu"
    priority: medium

minimum_inputs:
  - project_context_or_session_signal

optional_inputs:
  - skill_result
  - user_preferences_update
  - dream_trigger_signal

execution_policy:
  non_blocking: true
  never_save_credentials: true
  checkpoint_often: true
  save_on_meaningful_events: true
  load_on_session_start: true
  support_dream_consolidation: true

output_schema:
  status: success | partial | blocked | failed
  summary: memória carregada/salva/consolidada + impacto no contexto
  artifacts: state_entry, env_reference, decisions_entry, errors_entry, execution_log_entry
  issues: memory_missing, memory_corrupted, conflict_detected, stale_env_reference
  next_step: continue_flow | ConnectPro | skill4d-core-orchestrator | user
  confidence_score: 0.0-1.0

handoff_targets:
  - skill_name: skill4d-core-orchestrator
    when: contexto foi carregado e pode alimentar roteamento
  - skill_name: ConnectPro
    when: referência de credencial existe mas integração falhou
  - skill_name: user
    when: conflito de memória exige decisão humana
```

---

## Estrutura de Disco

```
.dummy/
  memory/
    projects/{project-name}/
      state.md      — o que foi construído, stack, status
      env.md        — credenciais resolvidas (NUNCA os valores, só referências)
      decisions.md  — decisões arquiteturais e de autonomia
      errors.md     — erros corrigidos neste projeto
    user/
      preferences.md — linguagem, frameworks, nível técnico, idioma
      profile.md     — perfil e objetivos do usuário (opcional)
    global/
      errors.md          — padrões de erro reutilizáveis entre projetos
      patterns.md        — padrões de execução validados (opcional)
      execution-log.md   — log de execução de skills (observabilidade de validação)
      dream-log.md       — histórico de consolidações (data, entradas removidas, próximo dream)
```

**Proteção:** `.dummy/memory/` está no `.gitignore`. Nunca commitar.

---

## execution-log.md — Registro de Observabilidade

Arquivo especial para fase de validação do sistema. Registra o que cada skill fez em cada sessão.

**Formato de entrada:**
```
## {DATA} {HORA} — {projeto}
skill: {nome}
modo: {COPY|CREATIVE|LOAD|SAVE|etc}
trigger: {o que acionou}
steps: {passos executados}
resultado: {✓ sucesso | ✗ falha}
nota: {observação livre — o que funcionou ou não}
```

**Quando salvar:** após cada skill concluir (sucesso ou falha).
**Quem usa:** o usuário pode perguntar "o que rodou hoje?" ou "mock-to-react funcionou?" e receber resposta baseada neste log.
**Limite:** manter apenas as últimas 20 entradas. Rotacionar automaticamente.

---

## 📢 Protocolo de Feedback Obrigatório

Todo modo de execução deve reportar progresso:

```
[dummy-memory] LOAD ⚙️ — buscando contexto do projeto
[dummy-memory] ✓ LOAD — {projeto}: {resumo 1 linha} | serviços: {lista}
[dummy-memory] SAVE ⚙️ — salvando {tipo de dado}
[dummy-memory] ✓ SAVE — {arquivo}.md atualizado
[dummy-memory] CONSULTA ⚙️ — lendo estado atual
[dummy-memory] ✓ CONSULTA — {resposta resumida}
```

Nunca executar silenciosamente — mesmo salvando em background, confirmar conclusão.

---

## Checkpoint Rápido (Anti-Token-Cutoff)

Problema: sessão expira e o chat pode morrer antes do `SAVE` grande.
Solução: checkpoint leve e frequente em `.dummy/memory/SESSION.md`.

Regra: após cada tarefa concluída (e antes de operações longas), escrever um checkpoint.

Preferência quando disponível:
`dummyos.memory.checkpoint` (tool do `dummyos-plugin`).

Formato recomendado:
```
dummyos.memory.checkpoint {
  event: "task_complete",
  phase: "{start|progress|done}",
  summary: "{1 linha do que mudou}",
  tags: ["{skill}", "{task}"],
  data: { files_changed: [...], commands: [...], issues: [...] }
}
```

Limites:
- Nunca incluir valores de token/secret
- `summary` 1 linha
- `data` pequeno

## Três Modos

### MODO LOAD — Boot de sessão

Executado automaticamente pelo kernel no início de cada sessão:

```
[dummy-memory] LOAD ⚙️ — buscando contexto do projeto

1. Detectar projeto ativo (via git remote ou package.json)
2. Ler state.md + env.md + decisions.md
3. Ler user/preferences.md
4. Reportar ao kernel:
   memory_loaded: true/false
   state_summary: [1-2 linhas]
   env_resolved: [lista de serviços configurados]
   known_decisions: [lista]
   user_prefs: {objeto}

[dummy-memory] ✓ LOAD — {projeto} | estado: {resumo} | serviços: {lista}
```

Se `.dummy/memory/` não existir: criar estrutura vazia, retornar `memory_loaded: false`.
Output: `[dummy-memory] ✓ LOAD — novo projeto, memória iniciada`

### MODO SAVE — Após ação significativa

**Auto-save triggers — executar SEMPRE após:**
- Arquivo criado ou modificado com sucesso
- Bug corrigido e verificado
- Credencial ou serviço externo configurado
- Decisão arquitetural tomada
- Preview validado com screenshot
- Sessão encerrando ("bye dummy")

**Regras críticas:**
- Salvar em background — nunca bloquear o fluxo principal
- Confirmar conclusão com `[dummy-memory] ✓ SAVE — {arquivo} atualizado`
- NUNCA salvar o valor de credenciais — só o nome da var e que foi resolvida
- Máximo 10 linhas por entrada. Memória verbose é inútil.
- Prefira atualizar a duplicar
- Salvar também em `global/execution-log.md` (ver abaixo)

### MODO DREAM — Consolidação automática de memória

Inspirado no conceito "Auto Dream Memory" — funciona como REM sleep para o OS.
Previne **memory rot**: notas contraditórias, obsoletas e duplicadas que confundem o sistema.

**Trigger automático:** após 5+ sessões desde o último dream OU ao detectar > 200 linhas em qualquer arquivo de memória.
**Trigger manual:** usuário digita `dummy dream` / `consolidar memória` / `limpar memória`

```
[dummy-memory] DREAM ⚙️ — consolidando memória do projeto

Fase 1 — ORIENTAÇÃO:
  → Ler índice: listar todos os arquivos em .dummy/memory/
  → Identificar tamanho de cada arquivo e data do último dream

Fase 2 — COLETA DE SINAIS:
  → Buscar entradas de alto valor: correções do usuário, decisões confirmadas
  → Marcar entradas obsoletas: refs a features removidas, erros já resolvidos
  → Identificar contradições: duas decisões opostas sobre a mesma escolha

Fase 3 — CONSOLIDAÇÃO:
  → Converter datas relativas → absolutas ("ontem" → "2026-03-27")
  → Deletar entradas contraditórias (manter a mais recente)
  → Mesclar entradas duplicadas em uma única entrada atualizada
  → Remover erros já corrigidos há mais de 3 sessões

Fase 4 — PODA E INDEXAÇÃO:
  → state.md: máximo 50 linhas
  → decisions.md: máximo 30 linhas
  → errors.md: máximo 20 linhas
  → execution-log.md: máximo 20 entradas
  → Salvar data/hora do dream em global/dream-log.md

[dummy-memory] ✓ DREAM — {N} entradas consolidadas, {M} removidas | próximo dream: {data estimada}
```

**Regras do DREAM:**
- Nunca deletar decisões ativas ou credenciais resolvidas
- Em caso de contradição: manter entrada mais recente + registrar o conflito resolvido
- Rodar em background — nunca bloquear o fluxo
- Reportar resumo ao usuário após concluir

---

### MODO PERFIL — profile-user

Aprende o perfil do desenvolvedor para personalizar todas as respostas futuras do OS.

**Trigger:** `profile-user` / "me conhece melhor" / "aprenda meu estilo" / "personaliza o OS pra mim"

```
[dummy-memory] PERFIL ⚙️ — coletando perfil do desenvolvedor

5 perguntas (máximo):
1. Qual sua stack principal? (ex: Next.js + Supabase, Python + FastAPI, React Native + Expo)
2. Nível de experiência: iniciante | intermediário | sênior | especialista?
3. Prefere código com muitos comentários ou limpo e direto?
4. Idioma preferido nas respostas: português | inglês | misturado?
5. Qual seu maior objetivo agora? (ex: lançar SaaS, aprender, projeto freelance, startup)

→ Com as respostas: salvar em .dummy/memory/user/profile.md
→ Confirmar: "[dummy-memory] ✓ PERFIL salvo — personalizando respostas para {nome do perfil}"
```

**Formato do profile.md:**

```markdown
# Perfil do Usuário

stack: {tecnologias principais}
nivel: iniciante | intermediário | sênior | especialista
estilo_codigo: comentado | limpo
idioma: português | inglês | misturado
objetivo_atual: {objetivo em 1 linha}
preferencias_extras: {observações coletadas em uso ao longo das sessões}
atualizado_em: {data}
```

**Como usar o perfil:**
- engineering-mentor: ajusta profundidade das explicações ao nível declarado
- mock-to-react: adapta stack sugerida às preferências do usuário
- orchestrator: usa idioma preferido nas confirmações
- Toda skill: evita perguntar o que o perfil já responde

**Atualização automática:** quando o usuário corrige uma suposição errada ("não, eu uso Expo, não React Native puro"), salvar a correção em `preferencias_extras`.

---

### MODO CONSULTA — Usuário pergunta sobre o projeto

Quando: "o que a gente fez?", "qual o estado?", "o que está configurado?"

```
[dummy-memory] CONSULTA ⚙️

1. Ler state.md + env.md + decisions.md
2. Responder em linguagem natural:
   "Você tem um app de notas em Next.js 14 rodando em localhost:3000.
    Supabase configurado (projeto qyqhiksonoqxhsgctjbl).
    Auth email/password. Tabelas: profiles e notes."

[dummy-memory] ✓ CONSULTA — contexto entregue
```

---

## NAMESPACE DE SKILLS — Memória Cross-Skill

Cada skill escreve resultados relevantes em um namespace próprio dentro da memória de sessão. Qualquer skill posterior pode ler o que outra produziu — sem re-executar ou perguntar ao usuário.

**Formato de chave:** `{skill_name}/{key}`

| Namespace | Chave | O que armazenar |
|---|---|---|
| `mock-to-react/` | `design_tokens` | JSON de tokens (cores, tipografia, spacing) |
| `mock-to-react/` | `harmony_score` | Score de coesão + avisos da última auditoria |
| `ConnectPro/` | `services_resolved` | Lista de serviços configurados nesta sessão |
| `ConnectPro/` | `env_vars` | Nomes das variáveis (nunca os valores) |
| `app-factory/` | `api_contract` | Contrato de API gerado (endpoints + entidades) |
| `app-factory/` | `stack_chosen` | Stack escolhida + justificativa |
| `engineering-mentor/` | `prd_approved` | Resumo do PRD aprovado |
| `engineering-mentor/` | `issues` | Lista de issues gerados pelo /break |
| `surge-core/` | `errors_fixed` | Erros corrigidos nesta sessão |
| `preview-bridge/` | `preview_url` | URL do preview ativo |

**Regras:**
- Cada skill escreve APENAS no próprio namespace — nunca no de outra
- Leitura é livre — qualquer skill pode consultar qualquer namespace
- Máximo 500 chars por entrada. Sobrescrever é preferível a duplicar.
- NUNCA armazenar valores de credenciais/tokens em qualquer namespace

### MODO SNAPSHOT — estado cross-skill em um bloco

Trigger: `dummy snapshot` / "o que cada skill produziu?" / chamado automaticamente pelo orchestrator antes de qualquer skill com `dependsOn`.

```
[dummy-memory] SNAPSHOT ⚙️

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 D.U.M.M.Y. OS  ▸  Session Snapshot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 engineering-mentor/prd_approved  → "App de notas com auth email + Supabase"
 mock-to-react/harmony_score      → 78/100 (1 aviso WCAG)
 mock-to-react/design_tokens      → {primary:#3B82F6, base:8px, scale:PerfectFourth}
 ConnectPro/services_resolved     → [supabase, resend]
 app-factory/stack_chosen         → Next.js 14 + Supabase + Tailwind
 app-factory/api_contract         → POST/GET/DELETE /notes
 preview-bridge/preview_url       → http://localhost:3000
 surge-core/errors_fixed          → ["TypeError: Cannot read 'user' of undefined"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[dummy-memory] ✓ SNAPSHOT — {N} namespaces ativos
```

**Injeção automática no handoff (orchestrator):**
Quando o orchestrator chama uma skill com `dependsOn`, inclui automaticamente o snapshot dos namespaces das skills dependidas:
```
[orchestrator] t4 app-factory — injetando contexto das dependências:
  → engineering-mentor/prd_approved ✓
  → mock-to-react/design_tokens ✓
  → ConnectPro/env_vars ✓
```

---

## Quem Salva o Quê

| Skill | Arquivo / Namespace | Quando |
|---|---|---|
| ConnectPro | env.md + `ConnectPro/env_vars` | Após resolver credencial |
| ConnectPro | decisions.md | Ação com custo confirmada pelo usuário |
| app-factory-multiagent | state.md + `app-factory/api_contract` + `app-factory/stack_chosen` | Após construir feature/componente |
| engineering-mentor | decisions.md + `engineering-mentor/prd_approved` + `engineering-mentor/issues` | Após decisão arquitetural |
| surge-core | errors.md + `surge-core/errors_fixed` | Após corrigir erro |
| preview-bridge | state.md + `preview-bridge/preview_url` | Preview validado com URL |
| mock-to-react | `mock-to-react/design_tokens` + `mock-to-react/harmony_score` | Após gerar componente |
| qualquer skill | user/preferences.md | Usuário menciona preferência |
| toda skill | global/execution-log.md | Ao concluir (sucesso ou falha) |

---

## Regras Fundamentais

1. Nunca bloqueie o fluxo — dummy-memory salva em background
2. Nunca salve credenciais — registre que foi resolvida e via qual modo
3. O contexto de projeto tem prioridade sobre preferências globais
4. Se memória ausente/corrompida: criar nova, continuar sem erro

---

## Integração com o Kernel

```yaml
on_session_start:
  - dummy-memory LOAD
  - injetar contexto no envelope de handoff de toda skill

on_session_end (ou entrega significativa):
  - dummy-memory SAVE com resumo do que foi feito
```

