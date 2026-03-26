# dummy-memory — SPEC.md
# Contrato formal de leitura e escrita
# Este documento define o protocolo que TODA skill deve seguir ao interagir com a memória

---

## Estrutura de Disco

```
.dummy/
  memory/
    projects/
      {project-name}/
        state.md       — o que foi construído, stack, status atual
        env.md         — quais credenciais foram resolvidas e via qual modo (NUNCA o valor)
        decisions.md   — decisões arquiteturais e de autonomia tomadas
        errors.md      — erros corrigidos neste projeto
    user/
      preferences.md   — preferências do usuário (linguagem, frameworks, estilo, nível)
      profile.md       — quem é o usuário, objetivos, contexto
    global/
      errors.md        — erros corrigidos globalmente (reutilizáveis entre projetos)
      patterns.md      — padrões que funcionaram bem
```

**Proteção obrigatória:** `.dummy/memory/` deve estar no `.gitignore` do projeto.
`env.md` contém referências a credenciais reais — nunca commitar.

---

## Contrato de LOAD

Executado pelo kernel no início de toda sessão:

```
Ordem de leitura:
1. state.md      → "O que foi construído até agora"
2. env.md        → "Quais credenciais já estão resolvidas"
3. decisions.md  → "Quais decisões foram tomadas"
4. user/preferences.md → injetar no contexto do kernel

Retorno para o kernel:
  memory_loaded: true | false
  project: {nome inferido do git remote ou package.json}
  last_session: {data da última entrada em state.md}
  state_summary: {1-2 linhas do que foi feito}
  env_resolved: [lista de serviços configurados]
  known_decisions: [lista de decisões tomadas]
  user_prefs: {objeto de preferências}
```

Se `.dummy/memory/` não existir: criar estrutura vazia, retornar `memory_loaded: false`.

---

## Contrato de SAVE por Skill

### ConnectPro → env.md

```markdown
## {DATA} — {SERVIÇO} configurado via {MODO}
serviço: Supabase
modo: mcp_direct
vars_resolvidas: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
project_id: {id}
migrations_applied: true
autonomia: criação de projeto confirmada pelo usuário ($25/mês)
nota: não reconfigurar — já está ativo
```

**Regra crítica: NUNCA salvar o valor das credenciais. Só o nome da var e que foi resolvida.**

### app-factory → state.md

```markdown
## {DATA} — Estado do Projeto
stack: Next.js 14 + Supabase + Tailwind
auth: email/password via @supabase/ssr
banco: tabelas [profiles, notes] com RLS ativo
rotas_criadas: [/, /dashboard, /api/notes]
componentes: [AuthForm, Sidebar, NotesFAB]
preview_url: http://localhost:3000
status: funcional | parcial | bloqueado
```

### engineering-mentor → decisions.md

```markdown
## {DATA} — {TÍTULO DA DECISÃO}
decisão: usar window.location.href em vez de router.push após auth
motivo: race condition entre cookie e SSR do Next.js 15
alternativas_descartadas: [router.push + router.refresh()]
válido_enquanto: projeto usa @supabase/ssr com Next.js 13+
```

### surge-core → errors.md (projeto) e global/errors.md

```markdown
## {DATA} — {TÍTULO DO ERRO}
sintoma: "Email not confirmed" após signUp
causa: usuário criado antes de desabilitar confirmation no Supabase
correção: UPDATE auth.users SET email_confirmed_at = NOW()
reutilizável_quando: Supabase com email confirmation desabilitado
autonomia_usada: não (correção técnica, sem confirmação necessária)
```

### ConnectPro (autonomia) → decisions.md

```markdown
## {DATA} — ConnectPro: {SERVIÇO} {AÇÃO}
ação: criado projeto Supabase "my-app"
custo_estimado: $25/mês
confirmado_pelo_usuário: sim
```

---

## Política de TTL (validade dos dados)

| Tipo de dado | TTL | Motivo |
|---|---|---|
| state.md | Sem expiração | Estado do projeto é sempre válido |
| env.md — referência a credencial | 90 dias | Credenciais podem ser rotacionadas |
| decisions.md | Sem expiração | Decisões são históricas |
| errors.md | Sem expiração | Erros são históricas para aprendizado |
| user/preferences.md | Sem expiração | Preferências mudam lentamente |

Se env.md tiver mais de 90 dias: verificar se credenciais ainda são válidas antes de usar.

---

## Política de Conflito

Se dados contraditórios existirem:
1. **Dados mais recentes** têm prioridade dentro do mesmo arquivo
2. **project/** tem prioridade sobre **global/** para erros e padrões
3. **preferences.md do usuário** tem prioridade sobre defaults do sistema
4. **Em caso de dúvida**: perguntar ao usuário — não assumir

---

## Política de Corrupção / Ausência

| Situação | Comportamento |
|---|---|
| Arquivo ausente | Criar vazio, continuar sem erro |
| Arquivo corrompido (não é markdown válido) | Ignorar, criar novo, registrar o evento |
| Diretório `.dummy/` ausente | Criar estrutura completa, continuar |
| Credencial em env.md mas serviço falha | Escalar para ConnectPro reconfigurar |

---

## Payload Mínimo por Arquivo

Cada escrita deve incluir no mínimo:
- **Data** da entrada (formato: `YYYY-MM-DD`)
- **Quem escreveu** (skill responsável)
- **O que foi feito** (1 linha)
- **Status** (sucesso / parcial / falhou)

Máximo por entrada: **10 linhas**. Memória verbose é memória inútil.

---

## Triggers Obrigatórios de SAVE

| Evento | Skill responsável | Arquivo alvo |
|---|---|---|
| Credencial resolvida | ConnectPro | env.md |
| Ação com custo realizada | ConnectPro | decisions.md |
| Arquivo criado com sucesso | app-factory | state.md |
| Bug corrigido e verificado | surge-core | errors.md |
| Decisão arquitetural | engineering-mentor | decisions.md |
| Preview validado | preview-bridge | state.md |
| Preferência mencionada pelo usuário | qualquer skill | user/preferences.md |
| Sessão encerrando ("bye dummy") | orchestrator | state.md |
