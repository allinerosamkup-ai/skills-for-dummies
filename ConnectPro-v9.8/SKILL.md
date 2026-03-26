---
name: ConnectPro-v9.8
description: "Resolve OAuth, API keys, banco de dados e qualquer setup de integração antes que a construção comece. Zero configuração manual: ConnectPro detecta os serviços necessários, usa MCPs disponíveis, browser automation ou CLI — o que for necessário — para provisionar automaticamente sem pedir nada ao usuário além do mínimo absoluto. Cria .env real com credenciais injetadas e passa o contexto pronto para a próxima skill. Triggers: OAuth, SSO, Supabase, Firebase, Stripe, API key, banco de dados, credenciais, integrar, conectar, setup."
---

# ConnectPro v3.1 — Integração Automática via MCP, API ou CLI

Skill de preparação do ecossistema Skill4Dummies. Resolve integrações, credenciais e setup
**automaticamente** usando a melhor estratégia disponível antes que as skills de construção entrem.

---

## REGRA ZERO — ONE-SHOT OBRIGATÓRIO

**O usuário deu um único prompt. ConnectPro resolve tudo sozinho.**

O usuário não chama ConnectPro diretamente. O orquestrador chama.
ConnectPro não pede ajuda para o usuário — ele escalona modos internamente até resolver.
Só faz uma pergunta ao usuário se for absolutamente impossível prosseguir sem ela.

```
FLUXO CORRETO:
usuário → "cria app com Stripe"
         ↓
orchestrator → ConnectPro
              ↓
              tenta MCP → falhou
              ↓ (automático, sem avisar usuário)
              tenta API → falhou
              ↓ (automático, sem avisar usuário)
              ativa browser_auto via dev-browser → extrai keys → injeta .env
              ↓
              entrega .env.local preenchido para app-factory
              ↓
              app-factory constrói
              ↓
ENTREGA ao usuário — sem interrupções
```

---

## REGRAS FUNDAMENTAIS

1. **Nunca entregue `.env.example` quando pode entregar `.env.local` com valores reais.**
2. **Nunca peça ao usuário para fazer algo manualmente quando o browser_auto pode fazer.**
3. **browser_auto ativa SOZINHO** — é a terceira etapa da árvore de decisão, não um modo opcional.
4. **Pergunte o mínimo absoluto** — só login se o serviço exigir autenticação manual impossível de automatizar.
5. **Se não houver caminho, crie um** — dev-browser, CLI custom, workaround, o que for.

---

## Árvore de Decisão (executar nesta ordem — AUTOMÁTICO)

```
Para cada serviço necessário:

1. MCP disponível para este serviço?
   → SIM: usar modo "mcp_direct" — provisionar agora, sem perguntar
   → NÃO: continuar AUTOMATICAMENTE...

2. API HTTP oficial disponível com credenciais já fornecidas?
   → SIM: usar modo "api_http" — chamar API, obter tokens, injetar no .env
   → NÃO: continuar AUTOMATICAMENTE...

3. [ATIVA SOZINHO] Browser automation pode resolver?
   → SEMPRE tentar antes de pedir ao usuário
   → verificar: dev-browser instalado? → usar dev-browser
   → dev-browser não instalado? → usar mcp__Claude_in_Chrome__*
   → executar script, extrair valores, injetar no .env
   → se falhar por precisar de login: pedir APENAS email/senha, uma vez
   → NÃO: continuar AUTOMATICAMENTE...

4. Existe código/app/CLI local para este serviço?
   → SIM: usar modo "codebase_cli" — gerar CLI agent-native, registrar como conector
   → NÃO: continuar AUTOMATICAMENTE...

5. ÚLTIMO RECURSO — tutorial_manual:
   → usar APENAS se os 4 modos acima falharam ou forem impossíveis
   → instrução mínima e precisa (URL + 1 linha)
   → SEMPRE oferecer: "quando você colar o valor aqui, eu injeto automaticamente"
```

**Nenhum desses passos é anunciado ao usuário.** ConnectPro executa silenciosamente e reporta apenas o resultado final.

---

## Inventário de MCPs Disponíveis

Estes MCPs estão ativos na sessão atual. Usar **sempre que o serviço for necessário**:

### Supabase
- MCP ID: `mcp__67a82d94-d27d-4df2-933c-a256070e9b4e`
- Capacidades: criar projeto, aplicar migrations, executar SQL, obter URLs e keys, listar tabelas, deploy edge functions
- Modo: `mcp_direct`

### Figma
- MCP ID: `mcp__fe2db17e-a720-464a-95d2-cbb3d1e41394`
- Capacidades: ler designs, exportar assets, inspecionar componentes
- Modo: `mcp_direct`

### Notion
- MCP ID: `mcp__7575f97e-874e-4ed0-b686-28146a8d0321`
- Capacidades: criar/ler/atualizar páginas e databases
- Modo: `mcp_direct`

### Gmail / Google Calendar
- MCPs: `mcp__642d228a-e79a-4eb7-bd03-9bc1ac3deecd` / `mcp__e5927538-0356-4f74-8c37-cfe5ea1de67e`
- Modo: `mcp_direct`

### n8n
- MCP ID: `mcp__n8n-mcp`
- Capacidades: criar workflows de automação
- Modo: `mcp_direct`

### MCP Registry
- MCP ID: `mcp__mcp-registry`
- Usar para: descobrir MCPs de serviços não listados acima antes de desistir

---

## Execução por Modo

### Modo: mcp_direct (Supabase — exemplo canônico)

Quando o projeto precisa de Supabase, executar **nesta sequência exata**:

```
1. Verificar se já existe projeto Supabase:
   → mcp__67a82d94__list_projects
   → Se existir com nome similar: usar esse projeto

2. Se não existir, criar:
   → mcp__67a82d94__list_organizations → pegar org_id
   → mcp__67a82d94__get_cost { type: "project" } → mostrar custo ao usuário
   → mcp__67a82d94__confirm_cost → confirmar
   → mcp__67a82d94__create_project { name, org_id, region: "sa-east-1" }
   → Aguardar status "ACTIVE_HEALTHY"

3. Obter credenciais:
   → mcp__67a82d94__get_project_url { project_id } → SUPABASE_URL
   → mcp__67a82d94__get_publishable_keys { project_id } → ANON_KEY, SERVICE_ROLE_KEY

4. Aplicar migrations (se existirem no projeto):
   → Para cada arquivo em packages/database/migrations/:
     mcp__67a82d94__apply_migration { project_id, name, query: <conteúdo do arquivo> }

5. Injetar no .env.local:
   → Escrever arquivo .env.local REAL com valores obtidos nos passos anteriores
   → NUNCA usar placeholders se os valores reais foram obtidos

6. Verificar:
   → mcp__67a82d94__list_tables { project_id } → confirmar que tabelas existem
```

### Modo: mcp_direct (outros serviços)

Para serviços com MCP mas sem script canônico:
1. Consultar `mcp__mcp-registry__suggest_connectors` para descobrir capabilities
2. Executar o fluxo equivalente ao Supabase acima
3. Sempre terminar escrevendo valores reais no .env

### Modo: api_http

Quando não há MCP mas existe API com credencial já fornecida pelo usuário:
1. Chamar a API para validar a credencial
2. Se a API retornar dados adicionais necessários (ex: project_id, webhook_url), extrair
3. Escrever .env.local com todos os valores

### Modo: codebase_cli

Quando o serviço necessário tem código/app local mas sem MCP/API:

```
Pipeline codebase_cli:

1. discover_codebase
   → Localizar repo/caminho: perguntar ao usuário se não for óbvio

2. analyze_app
   → Ler package.json / Cargo.toml / requirements.txt
   → Identificar: linguagem, comandos disponíveis, capacidades expostas

3. design_cli
   → Definir comandos necessários para a integração
   → Padrão de saída: --json sempre disponível
   → Estrutura: <app> <subcommand> [flags] --json

4. generate_cli
   → Gerar wrapper CLI em Node/Commander ou Python/Click
   → Salvar em: .connectpro/cli/<app-name>/index.js (ou .py)

5. test_cli
   → Executar comando básico com --json
   → Verificar que output é JSON válido

6. register_connector
   → Salvar em: .connectpro/connectors/<app-name>.json
   → Formato: { name, type: "cli", command, subcommands, status: "active" }
```

O conector CLI registrado é tratado igual a um MCP pelo restante do ecossistema.

### Modo: browser_auto

Quando não há MCP/API mas o serviço tem interface web (dashboard, console, painel).

**Ferramenta primária: `dev-browser`** — CLI sandboxed com Playwright completo.
Mais rápido e mais confiável que Chrome MCP para extração de dados de dashboards.

#### Setup (verificar antes de usar)

```bash
# Checar se dev-browser está instalado
dev-browser --version 2>/dev/null || npm install -g dev-browser && dev-browser install
```

#### Como executar scripts dev-browser

```bash
# Modo headless (sem abrir janela)
dev-browser --headless <<'EOF'
const page = await browser.getPage("connectpro");
await page.goto("https://exemplo.com/dashboard");
// ... interações
EOF

# Modo conectado ao Chrome do usuário (necessário para login)
dev-browser --connect <<'EOF'
const page = await browser.getPage("connectpro");
// O Chrome já está logado — apenas navegar e extrair
EOF
```

#### Scripts prontos por serviço

**[Supabase — desabilitar email confirmation]**
```javascript
// Executar via: dev-browser --connect
const page = await browser.getPage("supabase");
await page.goto("https://supabase.com/dashboard/project/PROJECT_ID/auth/providers");
await page.locator('text=Confirm email').locator('..').locator('button[role="switch"]').click();
await page.locator('button:has-text("Save")').click();
const saved = await page.locator('text=Saved').isVisible();
console.log(JSON.stringify({ success: saved }));
```

**[Stripe — obter publishable e secret key]**
```javascript
// Executar via: dev-browser --connect
const page = await browser.getPage("stripe");
await page.goto("https://dashboard.stripe.com/test/apikeys");
const publishable = await page.locator('[data-testid="api-key-publishable"] code').textContent();
console.log(JSON.stringify({ STRIPE_PUBLISHABLE_KEY: publishable?.trim() }));
```

**[Vercel — obter deploy token]**
```javascript
// Executar via: dev-browser --connect
const page = await browser.getPage("vercel");
await page.goto("https://vercel.com/account/tokens");
await page.locator('button:has-text("Create")').click();
await page.locator('input[placeholder*="token name"]').fill("dummy-os");
await page.locator('button:has-text("Create Token")').click();
const token = await page.locator('[data-testid="token-value"]').textContent();
console.log(JSON.stringify({ VERCEL_TOKEN: token?.trim() }));
```

**[Google Cloud — obter OAuth Client ID]**
```javascript
// Executar via: dev-browser --connect
const page = await browser.getPage("gcp");
await page.goto("https://console.cloud.google.com/apis/credentials");
await page.locator('button:has-text("Create Credentials")').click();
await page.locator('text=OAuth client ID').click();
await page.locator('select[name="applicationType"]').selectOption("WEB_APPLICATION");
await page.locator('button:has-text("Add URI")').click();
await page.locator('input[placeholder*="redirect"]').fill("http://localhost:3000/auth/callback");
await page.locator('button:has-text("Create")').click();
const clientId = await page.locator('[data-testid="client-id"]').textContent();
const secret = await page.locator('[data-testid="client-secret"]').textContent();
console.log(JSON.stringify({ GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: secret }));
```

#### Fallback: mcp__Claude_in_Chrome

Se `dev-browser` não estiver disponível, usar MCPs do Chrome:
```
- mcp__Claude_in_Chrome__navigate    → ir para URL
- mcp__Claude_in_Chrome__find        → localizar elemento
- mcp__Claude_in_Chrome__form_input  → preencher campo
- mcp__Claude_in_Chrome__javascript_tool → executar JS
- mcp__Claude_in_Chrome__read_page   → ler conteúdo
```

#### Regras de ouro do browser_auto
- Nunca peça ao usuário para abrir o browser — você abre
- Nunca peça ao usuário para copiar/colar — você extrai via script
- Use `--connect` quando login manual for necessário (peça só 1x)
- Use `--headless` para tudo que não precisa de sessão autenticada
- Sempre parsear output como JSON e injetar no .env.local automaticamente

### Modo: tutorial_manual

Último recurso absoluto — quando browser_auto falhar ou for impossível:
1. Identificar exatamente qual valor está faltando
2. Dar URL exata e instrução de 1 linha
3. Oferecer: "Cole o valor aqui e eu injeto no .env automaticamente"

**Nunca** usar tutorial_manual sem antes tentar browser_auto.
**Nunca** terminar em tutorial_manual sem antes tentar `mcp__mcp-registry__search_mcp_registry`.

---

## Contrato de Conector

Todo serviço integrado pelo ConnectPro produz um conector com este contrato:

```json
{
  "name": "string",
  "type": "mcp | api | browser | cli",
  "status": "active | failed | manual",
  "invoke": "padrão de chamada",
  "output_schema": {
    "status": "success | error",
    "data": "object",
    "error": "string | null",
    "meta": "object"
  },
  "env_vars_injected": ["VAR_NAME_1", "VAR_NAME_2"],
  "fallback": "tutorial_url ou null"
}
```

Este contrato é consumido por app-factory-multiagent e skill4d-core-orchestrator.

---

## Fluxo Completo para Google OAuth (caso sem MCP)

Google OAuth não tem MCP disponível. Fluxo atual:

```
1. Verificar se GOOGLE_CLIENT_ID já existe no ambiente → se sim, validar e usar

2. Se não existe:
   → tutorial_manual com passos precisos:
     a. Abrir: https://console.cloud.google.com/apis/credentials
     b. Criar projeto ou selecionar existente
     c. OAuth 2.0 > Create Credentials > OAuth Client ID
     d. Application type: Web application
     e. Authorized redirect URIs: http://localhost:3000/auth/callback
     f. Copiar Client ID e Client Secret

3. Quando usuário fornecer os valores:
   → Injetar imediatamente no .env.local
   → Confirmar: "Google OAuth configurado. Redirect URI: http://localhost:3000/auth/callback"
```

---

## Output Obrigatório

ConnectPro sempre termina com este relatório:

```yaml
status: success | partial | blocked | failed

serviços:
  - nome: Supabase
    modo_usado: mcp_direct
    resultado: project criado, migrations aplicadas, .env.local escrito
    vars_injetadas: [NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY]

  - nome: Google OAuth
    modo_usado: tutorial_manual
    resultado: instruções fornecidas, aguardando credenciais do usuário
    vars_pendentes: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET]

bloqueios: []

próxima_skill: app-factory-multiagent
contexto_handoff:
  env_vars_resolved: [lista das vars já disponíveis]
  env_vars_pending: [lista das vars ainda manuais]
  project_ids: { supabase: "abc123" }
  migrations_applied: true
```

---

## Contrato Skill4Dummies

```yaml
name: ConnectPro
role: preparação invisível
version: "3.1"

execution_policy:
  ask_minimum: true
  prefer_automatic_over_manual: true      # NOVO: sempre preferir MCP/API/CLI antes de pedir ao usuário
  never_deliver_example_when_real_possible: true  # NOVO: .env.local real > .env.example
  preserve_context: true
  call_surge_if_execution_occurs: true

success_criteria:
  - todas as credenciais disponíveis via MCP foram injetadas automaticamente
  - .env.local criado com valores reais (não placeholders)
  - migrations aplicadas se existirem
  - próxima skill pode iniciar SEM bloqueios de setup
  - serviços sem MCP têm tutorial preciso com URL e passos exatos

handoff_targets:
  - skill_name: dummy-memory
    when: após resolver qualquer credencial ou serviço
    payload: service_name, mode_used, env_vars_resolved, project_ids
  - skill_name: app-factory-multiagent
    when: ambiente resolvido (total ou parcial com manual mínimo)
    payload: env_vars_resolved, services_connected, project_ids, migrations_applied
  - skill_name: surge-core
    when: integração produziu erros observáveis
    payload: error_log, integration_status
```

---

## Referência sistêmica

```
Usuário
↓ skill4d-core-orchestrator — interpreta, classifica, roteia
↓ ConnectPro v3.1     ← você está aqui
  ├── mcp_direct      → provisiona automaticamente (Supabase, Figma, Notion...)
  ├── api_http        → chama API com credenciais fornecidas
  ├── browser_auto    → dev-browser (Playwright sandboxed) ou Chrome MCP
  ├── codebase_cli    → gera CLI para software sem MCP
  └── tutorial_manual → último recurso, instrução precisa
↓ mock-to-react | app-factory-multiagent — construção
↓ preview-bridge — validação visual
↓ surge-core — observação e autocorreção
```

Nunca tente construir o que pertence às skills de construção.
Nunca entregue `.env.example` quando pode entregar `.env.local` real.
Nunca oculte falhas de integração — registre e informe o usuário com próximos passos concretos.
