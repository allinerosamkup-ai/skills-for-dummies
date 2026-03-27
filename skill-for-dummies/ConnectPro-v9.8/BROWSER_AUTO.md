# ConnectPro — BROWSER_AUTO.md
# Scripts de browser automation por serviço
# Atualizar aqui quando dashboards mudarem layout — sem mexer no SKILL.md

---

## Setup dev-browser

```bash
# Verificar instalação
dev-browser --version 2>/dev/null || npm install -g dev-browser && dev-browser install

# Modo headless (sem login necessário)
dev-browser --headless <<'EOF'
const page = await browser.getPage("connectpro");
// ... script
EOF

# Modo conectado (usuário já logado no Chrome)
dev-browser --connect <<'EOF'
const page = await browser.getPage("connectpro");
// Chrome já está logado — apenas navegar e extrair
EOF
```

**Fallback se dev-browser não disponível:**
```
mcp__Claude_in_Chrome__navigate    → ir para URL
mcp__Claude_in_Chrome__find        → localizar elemento
mcp__Claude_in_Chrome__form_input  → preencher campo
mcp__Claude_in_Chrome__javascript_tool → executar JS
mcp__Claude_in_Chrome__read_page   → ler conteúdo
```

---

## Regras de ouro

- Nunca pedir ao usuário para abrir o browser — você abre
- Nunca pedir ao usuário para copiar/colar — você extrai via script
- `--connect` quando login já existe no Chrome (caso comum)
- `--headless` para tudo que não precisa de sessão autenticada
- Sempre parsear output como JSON e injetar no .env.local
- Sempre verificar com `JSON.stringify` o que foi extraído antes de injetar

---

## Scripts prontos

### [Supabase — desabilitar email confirmation]

```javascript
// dev-browser --connect
const page = await browser.getPage("supabase");
await page.goto("https://supabase.com/dashboard/project/PROJECT_ID/auth/providers");
await page.locator('text=Confirm email').locator('..').locator('button[role="switch"]').click();
await page.locator('button:has-text("Save")').click();
const saved = await page.locator('text=Saved').isVisible();
console.log(JSON.stringify({ success: saved }));
```

### [Stripe — obter publishable e secret key]

```javascript
// dev-browser --connect
const page = await browser.getPage("stripe");
await page.goto("https://dashboard.stripe.com/test/apikeys");
const publishable = await page.locator('[data-testid="api-key-publishable"] code').textContent();
// Secret key requer reveal button
await page.locator('button:has-text("Reveal test key")').click();
const secret = await page.locator('[data-testid="api-key-secret"] code').textContent();
console.log(JSON.stringify({
  STRIPE_PUBLISHABLE_KEY: publishable?.trim(),
  STRIPE_SECRET_KEY: secret?.trim()
}));
```

### [Stripe — criar produto e obter price_id]

```javascript
// dev-browser --connect
const page = await browser.getPage("stripe");
await page.goto("https://dashboard.stripe.com/products/create");
// Preencher produto Pro
await page.locator('input[name="name"]').fill("D.U.M.M.Y. OS Pro");
await page.locator('input[name="amount"]').fill("19");
await page.locator('button:has-text("Save product")').click();
// Extrair price_id da URL ou do elemento
const url = page.url();
const priceId = url.match(/price_[a-zA-Z0-9]+/)?.[0];
console.log(JSON.stringify({ STRIPE_PRICE_PRO: priceId }));
```

### [Vercel — obter deploy token]

```javascript
// dev-browser --connect
const page = await browser.getPage("vercel");
await page.goto("https://vercel.com/account/tokens");
await page.locator('button:has-text("Create")').click();
await page.locator('input[placeholder*="token name"]').fill("dummy-os");
await page.locator('button:has-text("Create Token")').click();
const token = await page.locator('[data-testid="token-value"]').textContent();
console.log(JSON.stringify({ VERCEL_TOKEN: token?.trim() }));
```

### [Google Cloud — obter OAuth Client ID]

```javascript
// dev-browser --connect
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
console.log(JSON.stringify({
  GOOGLE_CLIENT_ID: clientId?.trim(),
  GOOGLE_CLIENT_SECRET: secret?.trim()
}));
```

---

## Email Loop — capturar confirmação por email

Quando um serviço manda um email de verificação/confirmação,
ConnectPro captura automaticamente sem pausar o fluxo.

### Protocolo Email Loop

```
1. TRIGGER: ConnectPro realiza ação que gera email de confirmação
   (criar conta Stripe, verificar Google OAuth, confirmar Supabase, 2FA via email)

2. ESPERAR: 5-10 segundos para o email chegar

3. BUSCAR via Gmail MCP:
   → mcp__642d228a__gmail_search_messages
     { query: "{termo_do_servico} verification OR confirm OR code", maxResults: 3 }

4. LER o email mais recente:
   → mcp__642d228a__gmail_read_message { messageId }

5. EXTRAIR código/link do body:
   → Regex: /\b\d{6}\b/  → código numérico de 6 dígitos
   → Regex: /https?:\/\/[^\s"]+confirm[^\s"]*/  → link de confirmação
   → Regex: /https?:\/\/[^\s"]+verify[^\s"]*/   → link de verificação

6. COMPLETAR via browser_auto:
   → Se código: inserir no campo de verificação aberto no browser
   → Se link: dev-browser --connect → navegar para o link → confirmar

7. RESULTADO: ação concluída sem interromper o usuário
```

### Serviços que usam Email Loop

| Serviço | Trigger | O que buscar no email |
|---|---|---|
| Stripe | criação de conta | "Stripe verification", code 6 dígitos |
| Google Cloud | 2FA por email | "Google verification code" |
| Supabase | magic link / email auth | "Confirm your email", link |
| GitHub | verify email | "Please verify", link |
| Vercel | team invite | "Join the team", link |
| Qualquer serviço | confirm account | "confirm" OR "verify" OR "activate" |

### Regras do Email Loop

- **Nunca pausar o fluxo** para pedir ao usuário que abra o email
- **Máximo 3 tentativas** de busca (email pode demorar)
- **Se não encontrar em 30s**: avisar usuário com instrução direta de 1 linha
- **Sempre confirmar** que a verificação foi completada com sucesso
- **Registrar em decisions.md**: qual serviço foi verificado, quando
