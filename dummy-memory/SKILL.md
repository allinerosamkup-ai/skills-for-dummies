---
name: dummy-memory
description: "Camada de memória persistente do D.U.M.M.Y. OS. Auto-salva contexto de projetos, credenciais resolvidas, decisões arquiteturais e erros corrigidos ao final de cada ação significativa. Auto-carrega o contexto relevante ao iniciar uma sessão. O M de Memory-driven. Triggers: session start, project context, remember, recall, o que fizemos, contexto do projeto, retomar, continuar."
---

# dummy-memory v1.1 — Memória Persistente do D.U.M.M.Y. OS

Sem dummy-memory, cada sessão começa do zero.
Com dummy-memory, o OS lembra — projetos, credenciais, decisões, erros corrigidos.

Contrato detalhado de leitura/escrita → **SPEC.md**

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
    global/
      errors.md          — padrões de erro reutilizáveis entre projetos
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

## Quem Salva o Quê

| Skill | Arquivo | Quando |
|---|---|---|
| ConnectPro | env.md | Após resolver credencial |
| ConnectPro | decisions.md | Ação com custo confirmada pelo usuário |
| app-factory | state.md | Após construir feature/componente |
| engineering-mentor | decisions.md | Após decisão arquitetural |
| surge-core | errors.md | Após corrigir erro |
| preview-bridge | state.md | Preview validado com URL |
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

---

## Contrato Skill4Dummies

```yaml
name: dummy-memory
role: memória persistente
version: "1.1"

execution_policy:
  non_blocking: true
  save_on_success_only: true
  never_save_credentials: true
  dream_trigger: "5+ sessões desde último dream OU arquivo > 200 linhas"
  dream_manual: "dummy dream | consolidar memória | limpar memória"

success_criteria:
  - contexto carregado no boot sem prompt do usuário
  - skills não perguntam o que já foi feito antes
  - erros não se repetem entre sessões
  - credenciais não reconfiguradas em projetos existentes
  - memória não apodrece — dream consolida automaticamente após 5 sessões
  - execution-log disponível para o usuário revisar o que funcionou
```
