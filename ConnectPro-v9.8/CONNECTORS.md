# ConnectPro — CONNECTORS.md
# Playbooks de integração por serviço
# Atualizar aqui quando um dashboard mudar layout — sem mexer no SKILL.md

---

## Supabase — mcp_direct (canônico)

```
1. Verificar projeto existente
   → mcp__67a82d94__list_projects
   → Se existir com nome similar: usar esse projeto

2. Se não existir, criar
   → mcp__67a82d94__list_organizations → pegar org_id
   → mcp__67a82d94__get_cost { type: "project" }
   → AUTONOMY_POLICY: mostrar custo ao usuário → confirmar antes de criar
   → mcp__67a82d94__create_project { name, org_id, region: "sa-east-1" }
   → Aguardar status "ACTIVE_HEALTHY"

3. Obter credenciais
   → mcp__67a82d94__get_project_url { project_id }        → SUPABASE_URL
   → mcp__67a82d94__get_publishable_keys { project_id }   → ANON_KEY, SERVICE_ROLE_KEY

4. Aplicar migrations (se existirem)
   → Para cada arquivo em packages/database/migrations/:
     mcp__67a82d94__apply_migration { project_id, name, query }

5. Injetar no .env.local com valores reais
   → NUNCA usar placeholders se valores foram obtidos

6. Verificar
   → mcp__67a82d94__list_tables { project_id } → confirmar tabelas
```

**Vars injetadas:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

---

## Stripe — browser_auto

```
1. Navegar ao dashboard de API keys (usuário já logado)
   → Ver BROWSER_AUTO.md → script [Stripe — obter publishable e secret key]

2. Para configurar webhook
   → Navegar a /webhooks → Add endpoint
   → URL: https://{deploy_url}/api/stripe/webhook
   → Selecionar eventos: checkout.session.completed, customer.subscription.deleted
   → Copiar webhook secret

3. Para criar produtos/preços
   → Navegar a /products → Add product
   → Criar produto Pro ($19/mês) → copiar price_id
   → Criar produto Team ($49/mês) → copiar price_id
```

**Vars injetadas:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_TEAM`

---

## Google OAuth — browser_auto + email_loop

```
1. Verificar se GOOGLE_CLIENT_ID já existe → validar e usar

2. Se não existe
   → Ver BROWSER_AUTO.md → script [Google Cloud — obter OAuth Client ID]
   → AUTONOMY_POLICY: criação de credencial → confirmar com usuário

3. Email loop (se Google mandar verification email)
   → gmail_search_messages: query "Google Cloud verification" após criação
   → Extrair código ou link
   → browser_auto: inserir código na página de verificação
```

**Vars injetadas:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

---

## Vercel — browser_auto

```
1. Verificar Vercel CLI disponível
   → which vercel → se disponível: usar CLI direto

2. Via CLI (preferido)
   → vercel --yes --prod (dentro do diretório do projeto)
   → Obter URL de deploy

3. Via browser_auto (se sem CLI)
   → Ver BROWSER_AUTO.md → script [Vercel — obter deploy token]
   → vercel --token {token} --yes --prod
```

**Vars injetadas:** `VERCEL_TOKEN`, `NEXT_PUBLIC_APP_URL`

---

## GitHub — codebase_cli ou api_http

```
1. Verificar se gh CLI está disponível
   → which gh → se sim: usar gh auth token para obter token

2. Via API HTTP com token já fornecido
   → GET https://api.github.com/user → validar token
   → Extrair username, default_branch

3. Para criar repositório
   → AUTONOMY_POLICY: criação de recurso público → confirmar com usuário
   → gh repo create {nome} --public/--private
```

**Vars injetadas:** `GITHUB_TOKEN`, `GITHUB_USERNAME`

---

## n8n — mcp_direct

```
→ MCP ID: mcp__n8n-mcp
→ Para criar workflow: mcp__n8n-mcp__get_template (buscar template similar)
→ Validar: mcp__n8n-mcp__validate_workflow
→ Deploy: mcp__n8n-mcp__get_node (verificar nodes necessários)
```

---

## Modo: api_http

Para serviços com API mas sem MCP (credencial já fornecida pelo usuário):
```
1. Chamar API para validar credencial
2. Extrair dados adicionais necessários (project_id, webhook_url, etc.)
3. Escrever .env.local com todos os valores
```

---

## Modo: codebase_cli

Para serviço com código/app local mas sem MCP/API:
```
1. discover_codebase → localizar repo/caminho
2. analyze_app → ler package.json / requirements.txt
3. design_cli → definir comandos necessários para a integração
4. generate_cli → gerar wrapper em Node/Commander ou Python/Click
   → Salvar em: .connectpro/cli/{app-name}/index.js
5. test_cli → executar com --json, verificar output válido
6. register_connector → .connectpro/connectors/{app-name}.json
   → { name, type: "cli", command, subcommands, status: "active" }
```

---

## Modo: tutorial_manual (último recurso)

Usar APENAS se MCP + API + browser_auto + cli falharem:
```
1. Identificar exatamente qual valor está faltando
2. Dar URL exata + instrução de 1 linha
3. Oferecer: "Cole o valor aqui e eu injeto no .env automaticamente"
```

**Nunca usar tutorial_manual sem antes verificar mcp__mcp-registry__search_mcp_registry.**
