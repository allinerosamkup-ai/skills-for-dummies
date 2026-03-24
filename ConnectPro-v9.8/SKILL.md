---
name: ConnectPro
description: |
  Skill de preparação invisível. Use quando a tarefa exigir integração, credencial,
  dependência externa, OAuth, banco, API key ou setup antes da construção principal.
  Ativada antes de criador-de-apps, app-factory-multiagent ou mock-to-react quando
  houver serviços externos envolvidos.
role: preparação invisível
version: "2.0"
ecosystem: skill4dummies
compatible_with: [claude-code, cursor, gemini-cli, codex-cli, antigravity]
---

# ConnectPro — Integração e Setup Invisível

Skill de preparação do ecossistema Skill4Dummies. Resolve integrações, credenciais,
dependências externas e setup silencioso antes que as skills de construção entrem.

---

## Quando usar

Ative ConnectPro quando o pedido envolver qualquer um destes elementos:

- OAuth / SSO (Google, GitHub, Supabase Auth, Clerk)
- API keys (OpenAI, Stripe, Twilio, SendGrid, etc.)
- Banco de dados (conexão, URL, credenciais, migrações iniciais)
- Serviços externos (Supabase, Firebase, PlanetScale, Neon)
- Docker / serviços locais que precisam estar rodando
- Variáveis de ambiente obrigatórias para o build
- Dependências que bloqueiam a construção principal

---

## Como invocar (ConnectPro-v9.8)

```js
const { runConnectPro } = require('../ConnectPro-v9.8/agents/orchestrator');
```

```bash
cd ConnectPro-v9.8
npm install
node server.js
```

---

## Contrato (Skill4Dummies SKILL_CONTRACT.md §7.1)

```yaml
name: ConnectPro
role: preparação invisível
objective: resolver integrações, credenciais, setup e dependências antes da execução principal

activation_rules:
  - rule: tarefa menciona banco de dados, API key, OAuth ou serviço externo
    priority: high
  - rule: criador-de-apps ou app-factory precisam de env vars antes de iniciar
    priority: high
  - rule: erro de runtime aponta para credencial faltando
    priority: high
  - rule: usuário menciona "configurar", "conectar", "integrar" antes de construir
    priority: medium

minimum_inputs:
  - name: goal
    type: string
    required: true
    description: objetivo principal da tarefa que exige integração
  - name: required_services
    type: array
    required: true
    description: lista de serviços externos necessários

optional_inputs:
  - name: existing_env
    type: object
    required: false
    description: variáveis de ambiente já disponíveis
  - name: project_path
    type: string
    required: false
    description: raiz do projeto onde o .env será criado

execution_policy:
  ask_minimum: true
  preserve_context: true
  prefer_partial_delivery: true
  auto_observe_if_possible: true
  call_preview_if_visual: false
  call_surge_if_execution_occurs: true

output_schema:
  status: success | partial | blocked | failed
  summary: string
  artifacts:
    - resolved_connections
    - setup_notes
    - env_template
  issues:
    - missing_permissions
    - blocked_integrations
    - missing_credentials
  next_step: string
  confidence_score: number

failure_policy:
  recoverable: true
  ask_user_only_if_blocked: true
  must_explain_blocker: true
  must_propose_next_action: true

handoff_targets:
  - skill_name: criador-de-apps
    when: ambiente básico resolvido, MVP pode ser construído
    payload: env_vars_resolved, services_connected
  - skill_name: app-factory-multiagent
    when: projeto robusto depende de serviços externos prontos
    payload: full_integration_context
  - skill_name: mock-to-react
    when: fluxo visual pode seguir após setup de assets/APIs
    payload: api_endpoints_available
  - skill_name: surge-core
    when: integração produziu erros observáveis
    payload: error_log, integration_status

success_criteria:
  - todas as credenciais necessárias estão disponíveis ou documentadas
  - variáveis de ambiente criadas ou template gerado
  - serviços externos verificados como acessíveis
  - próxima skill pode iniciar sem bloqueios de setup

observability_signals:
  - signal: integration_resolved
    description: serviço externo conectado com sucesso
  - signal: credential_missing
    description: credencial não encontrada — requer ação manual do usuário
  - signal: env_created
    description: arquivo .env ou .env.example gerado
  - signal: blocked_integration
    description: integração bloqueada por permissão ou rate limit
```

---

## Referência sistêmica

ConnectPro é a **camada de Preparação** na arquitetura Skill4Dummies:

```
Usuário
↓ core-orchestrator — interpreta, classifica, roteia
↓ ConnectPro       ← você está aqui
↓ mock-to-react | criador-de-apps | app-factory — construção
↓ preview-bridge — validação visual
↓ surge-core — observação e autocorreção
```

Nunca tente construir o que pertence às skills de construção.
Nunca oculte falhas de integração — registre e informe o usuário.
