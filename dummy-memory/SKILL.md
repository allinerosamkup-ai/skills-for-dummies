---
name: dummy-memory
description: "Camada de memória persistente do D.U.M.M.Y. OS. Auto-salva contexto de projetos, credenciais resolvidas, decisões arquiteturais e erros corrigidos ao final de cada ação significativa. Auto-carrega o contexto relevante ao iniciar uma sessão. O M de Memory-driven. Triggers: session start, project context, remember, recall, o que fizemos, contexto do projeto, retomar, continuar."
version: "1.0"
category: memory
tags: [memory, context, persistence, session, project-state, learning]
ecosystem: dummy-os
role: memória persistente
compatible_with: [claude-code, cursor, gemini-cli, codex-cli]
---

# dummy-memory v1.0 — Memória Persistente do D.U.M.M.Y. OS

O **M de Memory-driven**.

Sem dummy-memory, cada sessão começa do zero.
Com dummy-memory, o OS lembra de tudo — projetos, credenciais, decisões, erros corrigidos.

---

## Responsabilidade

dummy-memory tem **dois modos de operação**:

### MODO LOAD — Boot de sessão
Executado automaticamente pelo kernel ao iniciar qualquer sessão.
Injeta contexto relevante antes de qualquer ação.

### MODO SAVE — Após ação significativa
Executado automaticamente por qualquer skill ao concluir uma ação relevante.
Grava o que foi feito, decidido ou resolvido.

---

## Estrutura de Armazenamento

```
.dummy/
  memory/
    projects/
      {project-name}/
        state.md         — estado atual do projeto
        env.md           — credenciais e vars de ambiente resolvidas
        decisions.md     — decisões arquiteturais tomadas
        errors.md        — erros corrigidos neste projeto
    user/
      preferences.md     — preferências do usuário (linguagem, frameworks, estilo)
      profile.md         — quem é o usuário, nível técnico, objetivos
    global/
      errors.md          — erros corrigidos globalmente (extends surge-core/snippets.md)
      patterns.md        — padrões de projeto que funcionaram bem
```

---

## MODO LOAD — Protocolo Completo

Executado pelo kernel no início de toda sessão:

```
1. DETECTAR PROJETO ATIVO
   → Verificar se existe .dummy/memory/projects/{nome-do-projeto}/
   → Usar git remote ou package.json para inferir nome do projeto
   → Se não existir: criar estrutura vazia

2. CARREGAR CONTEXTO DO PROJETO
   → Ler state.md     → "O que foi construído até agora"
   → Ler env.md       → "Quais credenciais já estão resolvidas"
   → Ler decisions.md → "Quais decisões arquiteturais foram tomadas"

3. CARREGAR PREFERÊNCIAS DO USUÁRIO
   → Ler user/preferences.md
   → Injetar no contexto do kernel

4. CARREGAR ERROS GLOBAIS CONHECIDOS
   → Ler global/errors.md
   → surge-core usa para evitar repetir os mesmos erros

5. REPORTAR AO KERNEL
   → Formato:
     memory_loaded: true
     project: {nome}
     last_session: {data}
     state_summary: {1-2 linhas do que foi feito}
     env_resolved: [lista de vars já disponíveis]
     known_decisions: [lista de decisões tomadas]
     user_prefs: {objeto de preferências}
```

---

## MODO SAVE — Protocolo por Skill

### Quando ConnectPro chama dummy-memory:
```yaml
trigger: após resolver credenciais de qualquer serviço
salvar em: .dummy/memory/projects/{nome}/env.md

formato:
  ## {DATA} — {SERVIÇO} configurado via {MODO}
  - NEXT_PUBLIC_SUPABASE_URL: resolvida (mcp_direct)
  - NEXT_PUBLIC_SUPABASE_ANON_KEY: resolvida (mcp_direct)
  - project_id: {id do projeto Supabase}
  - migrations_applied: true
  nota: "ConnectPro usou MCP automático — não precisa reconfigurar"
```

### Quando app-factory chama dummy-memory:
```yaml
trigger: após construir qualquer componente, rota ou feature
salvar em: .dummy/memory/projects/{nome}/state.md

formato:
  ## {DATA} — Estado do Projeto
  stack: Next.js 14 + Supabase + Tailwind
  auth: email/password via @supabase/ssr
  banco: tabelas [profiles, notes] com RLS ativo
  rotas_criadas: [/, /notes, /api/notes]
  componentes: [AuthForm, Sidebar, NotesFAB, SignOutButton]
  preview_url: http://localhost:3000
  status: funcional
```

### Quando engineering-mentor chama dummy-memory:
```yaml
trigger: após tomar decisão arquitetural
salvar em: .dummy/memory/projects/{nome}/decisions.md

formato:
  ## {DATA} — {TÍTULO DA DECISÃO}
  decisão: usar window.location.href em vez de router.push após signUp
  motivo: race condition entre cookie de sessão e SSR do Next.js 15
  alternativas_descartadas: [router.push + router.refresh()]
  válido_enquanto: projeto usa @supabase/ssr com Next.js 13+
```

### Quando surge-core chama dummy-memory:
```yaml
trigger: após corrigir qualquer erro
salvar em: .dummy/memory/global/errors.md

formato:
  ## {DATA} — {TÍTULO DO ERRO}
  sintoma: "Email not confirmed" após signUp sem email confirmation
  causa: usuário criado antes de desabilitar confirmation no Supabase
  correção: UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL
  reutilizável_quando: Supabase com email confirmation desabilitado
```

### Quando o usuário diz algo sobre suas preferências:
```yaml
trigger: usuário menciona preferência ("prefiro React", "não gosto de TypeScript", "sou iniciante")
salvar em: .dummy/memory/user/preferences.md

formato:
  ## Preferências do Usuário
  linguagem_preferida: JavaScript (não TypeScript)
  framework_web: Next.js
  framework_mobile: Expo
  banco: Supabase
  estilo_código: simples, sem over-engineering
  nível_técnico: intermediário
  idioma: português
```

---

## Regras Fundamentais

1. **Nunca bloqueie o fluxo.** dummy-memory salva em background — não interrompe a skill que está executando.

2. **Salve sempre no final, não no meio.** Só persiste quando a ação foi concluída com sucesso.

3. **Seja conciso.** Cada entrada de memória deve ter no máximo 10 linhas. Memória vaga é inútil.

4. **Nunca salve credenciais em texto puro.** Em env.md, registre apenas que a var foi resolvida e via qual modo — nunca o valor.

5. **Prefira atualizar a duplicar.** Se o arquivo já existe, atualize a seção relevante em vez de criar novo arquivo.

6. **O contexto de projeto tem prioridade sobre preferências globais.** Se o projeto usa TypeScript, use TypeScript — mesmo que a preferência global seja JavaScript.

---

## Consulta de Memória (Modo Manual)

Quando o usuário perguntar "o que a gente fez?", "qual o estado do projeto?", "o que já está configurado?":

```
1. Ler .dummy/memory/projects/{projeto}/state.md
2. Ler .dummy/memory/projects/{projeto}/env.md
3. Ler .dummy/memory/projects/{projeto}/decisions.md
4. Gerar resumo em linguagem natural:
   "Você tem um app de notas em Next.js 14 rodando em localhost:3000.
    Supabase já está configurado (projeto qyqhiksonoqxhsgctjbl).
    Auth é email/password. Tabelas: profiles e notes.
    Última decisão: usar window.location.href para evitar race condition."
```

---

## Integração com o Kernel

O kernel (skill4d-core-orchestrator) chama dummy-memory em dois momentos obrigatórios:

```yaml
on_session_start:
  - dummy-memory LOAD
  - injetar contexto no envelope de handoff de toda skill

on_session_end (ou após entrega significativa):
  - dummy-memory SAVE com resumo do que foi feito
```

---

## Contrato Skill4Dummies / D.U.M.M.Y. OS

```yaml
name: dummy-memory
role: memória persistente
version: "1.0"

activation_rules:
  - rule: início de qualquer sessão (via kernel)
    mode: LOAD — automático
  - rule: após ação significativa de qualquer skill
    mode: SAVE — chamado pela skill que completou a ação
  - rule: usuário pergunta sobre estado/contexto
    mode: LOAD — consulta manual

execution_policy:
  non_blocking: true          # nunca interrompe o fluxo principal
  save_on_success_only: true  # só persiste ações concluídas
  never_save_credentials: true # registra que foi resolvida, nunca o valor
  max_entry_lines: 10         # entradas concisas

success_criteria:
  - contexto carregado no início da sessão sem prompt do usuário
  - skills não perguntam o que já foi feito antes
  - erros não se repetem entre sessões
  - credenciais não precisam ser reconfiguradas em projetos existentes

handoff_targets:
  - skill_name: skill4d-core-orchestrator
    when: LOAD concluído
    payload: memory_context (state_summary, env_resolved, decisions, user_prefs)
```

---

## Referência Sistêmica

```
D.U.M.M.Y. OS
  ├── kernel (skill4d-core-orchestrator)
  │     └── chama dummy-memory LOAD no boot
  ├── ConnectPro    → chama SAVE após credenciais
  ├── app-factory   → chama SAVE após construção
  ├── eng-mentor    → chama SAVE após decisão
  ├── surge-core    → chama SAVE após correção
  └── dummy-memory  ← você está aqui
        ├── LOAD: injeta contexto no boot
        └── SAVE: persiste após cada ação relevante
```

O M de Memory-driven é o que transforma uma coleção de skills em um sistema que aprende.
