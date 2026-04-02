---
name: ConnectPro-v9.8
description: "Resolve OAuth, API keys, banco de dados e qualquer setup de integração antes que a construção comece. Zero configuração manual: ConnectPro detecta os serviços necessários, usa MCPs disponíveis, browser automation ou CLI — o que for necessário — para provisionar automaticamente sem pedir nada ao usuário além do mínimo absoluto. Cria .env real com credenciais injetadas e passa o contexto pronto para a próxima skill. Triggers: OAuth, SSO, Supabase, Firebase, Stripe, API key, banco de dados, credenciais, integrar, conectar, setup."
---

# ConnectPro v3.2 — Integração Automática

Skill de preparação do ecossistema D.U.M.M.Y. OS.
Resolve integrações, credenciais e setup **automaticamente** usando a melhor estratégia disponível.

Playbooks detalhados por serviço → **CONNECTORS.md**
Scripts de browser automation → **BROWSER_AUTO.md**
Limites de autonomia → **AUTONOMY_POLICY** (seção abaixo)

---

## REGRA ZERO — ONE-SHOT OBRIGATÓRIO

O usuário não chama ConnectPro diretamente. O orquestrador chama.
ConnectPro não pede ajuda ao usuário — escala modos internamente até resolver.
Faz uma pergunta ao usuário **só** se for absolutamente impossível prosseguir.

```
usuário → "cria app com Stripe"
         ↓
orchestrator → ConnectPro
  → tenta MCP → falhou (automático, silencioso)
  → tenta API → falhou (automático, silencioso)
  → ativa browser_auto → extrai keys → verifica email loop se necessário
  → injeta .env.local real
  → entrega contexto para app-factory
```

---

## Formato de Reporte

```
[ConnectPro] iniciando — {serviços detectados: Supabase, Stripe, ...}
[ConnectPro] {serviço}: tentando {modo} ⚙️
[ConnectPro] {serviço}: ✓ {modo usado} — vars injetadas: {lista}
[ConnectPro] {serviço}: ✗ {modo} falhou — tentando próximo modo ⚙️
[ConnectPro] ✓ concluído — {N} serviços resolvidos | .env.local pronto | entregando para app-factory
[ConnectPro] ✗ bloqueado — {serviço} requer ação manual: {instrução}
```

---

## REGRAS FUNDAMENTAIS

1. **Nunca entregar `.env.example` quando pode entregar `.env.local` com valores reais.**
2. **Nunca pedir ao usuário para fazer algo manualmente quando browser_auto pode fazer.**
3. **browser_auto ativa SOZINHO** — terceira etapa da árvore de decisão, não opcional.
4. **Email Loop ativa SOZINHO** — quando um serviço manda email de confirmação, ConnectPro lê e completa sem pausar.
5. **Se não houver caminho, crie um** — CLI custom, workaround, bridge, o que for.

---

## Árvore de Decisão (automática, silenciosa)

```
Para cada serviço necessário:

1. MCP disponível?
   → SIM: mcp_direct — provisionar agora
   → NÃO: continuar...

2. API HTTP com credencial disponível?
   → SIM: api_http — chamar API, extrair tokens, injetar .env
   → NÃO: continuar...

3. [ATIVA SOZINHO] browser_auto
   → dev-browser --connect (Chrome já logado do usuário)
   → Executar script do BROWSER_AUTO.md para este serviço
   → Se serviço manda email de confirmação → EMAIL LOOP automático
   → NÃO resolveu: continuar...

4. Software local disponível?
   → SIM: codebase_cli — gerar wrapper CLI, registrar como conector
   → NÃO: continuar...

5. ÚLTIMO RECURSO: tutorial_manual
   → URL exata + 1 instrução
   → "Cole o valor e eu injeto automaticamente"
```

Nenhum desses passos é anunciado ao usuário. Só o resultado final é reportado.

---

## AUTONOMY_POLICY — Limites de Autonomia

### Ações sem confirmação (executa silenciosamente)
- Leitura de dados de qualquer serviço
- Detecção de serviços existentes
- Validação de credenciais já fornecidas
- Extração de keys via browser_auto em serviços onde usuário já está logado
- Email loop para capturar códigos de verificação

### Ações com confirmação obrigatória (PARAR e perguntar antes)
- **Criar projeto** que gera custo (ex: novo projeto Supabase, nova instância cloud)
- **Emitir token permanente** (ex: token de deploy do Vercel, chave de API longa duração)
- **Provisionar recurso pago** (ex: banco de dados, instância de servidor)
- **Ação irreversível em conta existente** (ex: deletar dados, revogar acesso)

### Ações proibidas (nunca tomar)
- Deletar projeto, banco ou recurso existente
- Revogar credencial ativa
- Transferir ownership de recurso
- Modificar permissões de segurança de recurso em produção

### Auditoria
Toda ação de confirmação realizada deve ser registrada em `.dummy/memory/projects/{nome}/decisions.md`:
```
## {DATA} — ConnectPro: {SERVIÇO} {AÇÃO}
ação: criado projeto Supabase "my-app" na org {org_id}
custo_estimado: $25/mês
confirmado_pelo_usuário: sim
```

---

## Inventário de MCPs Disponíveis

| Serviço | MCP ID | Modo |
|---|---|---|
| Supabase | `mcp__67a82d94-d27d-4df2-933c-a256070e9b4e` | mcp_direct |
| Gmail | `mcp__642d228a-e79a-4eb7-bd03-9bc1ac3deecd` | mcp_direct (email loop) |
| Google Calendar | `mcp__e5927538-0356-4f74-8c37-cfe5ea1de67e` | mcp_direct |
| n8n | `mcp__n8n-mcp` | mcp_direct (workflows) |
| Figma | `mcp__fe2db17e-a720-464a-95d2-cbb3d1e41394` | mcp_direct |
| Notion | `mcp__7575f97e-874e-4ed0-b686-28146a8d0321` | mcp_direct |
| Google Drive | `mcp__c1fc4002-5f49-5f9d-a4e5-93c4ef5d6a75` | mcp_direct |
| MCP Registry | `mcp__mcp-registry` | descoberta de MCPs desconhecidos |

**Antes de desistir de qualquer serviço:** consultar `mcp__mcp-registry__search_mcp_registry`.

---

## Contrato de Conector

Todo serviço integrado produz um conector registrado:

```json
{
  "name": "string",
  "type": "mcp | api | browser | cli",
  "status": "active | failed | manual",
  "env_vars_injected": ["VAR_NAME_1", "VAR_NAME_2"],
  "autonomy_actions_taken": ["descrição das ações com confirmação"],
  "fallback": "tutorial_url ou null"
}
```

---

## Output Obrigatório

```yaml
status: success | partial | blocked | failed

serviços:
  - nome: Supabase
    modo_usado: mcp_direct
    resultado: projeto criado, migrations aplicadas, .env.local escrito
    vars_injetadas: [NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY]
    confirmações_solicitadas: ["criar projeto — custo $25/mês"]

  - nome: Stripe
    modo_usado: browser_auto + email_loop
    resultado: keys extraídas, email de verificação capturado e completado
    vars_injetadas: [STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY]

bloqueios: []
próxima_skill: app-factory-multiagent
contexto_handoff:
  env_vars_resolved: [lista]
  env_vars_pending: [lista]
  project_ids: { supabase: "abc123" }
  migrations_applied: true
```

---

## Contrato Skill4Dummies

```yaml
name: ConnectPro
role: preparação invisível
version: "3.2"

execution_policy:
  ask_minimum: true
  prefer_automatic_over_manual: true
  never_deliver_example_when_real_possible: true
  preserve_context: true
  email_loop_enabled: true
  autonomy_policy: enforced

success_criteria:
  - todas as credenciais via MCP foram injetadas automaticamente
  - .env.local com valores reais (não placeholders)
  - confirmações de autonomia obtidas antes de ações com custo
  - email loops completados sem interromper usuário
  - próxima skill pode iniciar SEM bloqueios de setup

handoff_targets:
  - skill_name: dummy-memory
    when: após resolver qualquer credencial
    payload: service_name, mode_used, env_vars_resolved, autonomy_actions
  - skill_name: app-factory-multiagent
    when: ambiente resolvido
    payload: env_vars_resolved, services_connected, project_ids, migrations_applied
  - skill_name: surge-core
    when: integração produziu erros
    payload: error_log, integration_status
```

---

## Referência

```
Usuário
↓ orchestrator — roteia para ConnectPro
↓ ConnectPro v3.2     ← você está aqui
  ├── mcp_direct      → MCPs disponíveis (Supabase, n8n, Gmail...)
  ├── api_http        → API com credencial fornecida
  ├── browser_auto    → dev-browser ou Chrome MCP (BROWSER_AUTO.md)
  │     └── email_loop → Gmail MCP captura confirmações automáticas
  ├── codebase_cli    → software local sem MCP
  └── tutorial_manual → último recurso
↓ app-factory-multiagent — construção
```

Playbooks detalhados: **CONNECTORS.md**
Scripts browser: **BROWSER_AUTO.md**
