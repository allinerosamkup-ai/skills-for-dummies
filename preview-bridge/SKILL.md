---
name: preview-bridge
description: "GLOBAL SKILL — instantly opens live preview for any web project without manual setup. Auto-detects React, Next.js, Vue, Svelte, and HTML projects from package.json, handles projects outside the working directory, verifies .env.local exists before starting, resolves port conflicts automatically, configures .claude/launch.json, and fires the dev server. Takes screenshots, reads console logs, and hands off errors to surge-core. Triggers: preview, show me, ver, mostrar, como ficou, open preview, live view."
---

# PreviewBridge v3.0 — Live Preview Robusto (Global)

Skill global de validação visual. Detecta framework, resolve blockers automaticamente e abre o preview
sem ação manual do usuário.

---

## Regra Fundamental

**Nunca peça para o usuário verificar manualmente.** Se algo bloquear o preview, resolva antes de
escalar. Só escala para o usuário se o bloqueio for genuinamente irresolvível.

---

## Fluxo Obrigatório (executar nesta ordem)

### Passo 1: Detectar framework com MCP nativo

**SEMPRE usar os MCPs nativos antes de qualquer detecção manual:**

```
1. mcp__previewbridge__preview_detect { project_path: "/caminho/absoluto/do/projeto" }
   → Retorna: framework, dev command, port, status de node_modules

2. mcp__previewbridge__preview_setup { project_path: "/caminho/absoluto/do/projeto" }
   → Cria launch.json DENTRO do projeto automaticamente
   → Retorna o nome do servidor para usar em preview_start

3. Se o projeto estiver FORA do diretório de sessão (diretório irmão, etc.):
   → Escrever TAMBÉM na sessão: .claude/launch.json com npm --prefix /caminho/absoluto
   → Usar o mesmo "name" retornado pelo preview_setup
   → Exemplo: { runtimeArgs: ["--prefix", "/caminho/absoluto", "run", "dev"] }

4. mcp__previewbridge__preview_check → confirmar estado antes de iniciar
```

### Passo 2: Verificar .env.local / .env

**ANTES de iniciar o servidor**, verificar se o arquivo de variáveis existe:

```
1. Verificar se .env.local existe na raiz do app

2. Se não existe:
   a. Verificar se .env.example existe → copiar como .env.local com valores placeholder
   b. Se nem .env.example existe → criar .env.local minimal baseado no framework:
      - Next.js + Supabase: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY com placeholders
      - Next.js puro: sem env vars obrigatórias, não criar
   c. Informar ao usuário: "Criei .env.local com placeholders — substitua pelos valores reais para
      funcionalidade completa"

3. Se existe mas tem placeholders óbvios (ex: "placeholder", "your-key-here", "XXXXX"):
   → Avisar ao usuário mas NÃO bloquear o preview
   → Preview abrirá em modo degradado (auth/API podem falhar, mas UI renderiza)
```

### Passo 4: Verificar dependências

```
1. node_modules existe na raiz do app?
   → NÃO: executar npm install --prefix /caminho/do/app antes de iniciar

2. package-lock.json existe mas node_modules não?
   → npm ci --prefix /caminho/do/app (mais rápido)
```

### Passo 5: Configurar launch.json

Para projetos dentro do diretório de trabalho:
```json
{
  "version": "0.0.1",
  "configurations": [{
    "name": "nome-do-projeto",
    "runtimeExecutable": "npm",
    "runtimeArgs": ["run", "dev"],
    "cwd": "caminho/relativo/ao/projeto",
    "port": 3000
  }]
}
```

Para projetos **fora** do diretório de trabalho (diretório irmão):
```json
{
  "version": "0.0.1",
  "configurations": [{
    "name": "nome-do-projeto",
    "runtimeExecutable": "npm",
    "runtimeArgs": ["--prefix", "/caminho/absoluto/do/projeto", "run", "dev"],
    "port": 3000
  }]
}
```

### Passo 6: Resolver conflito de porta

```
Antes de chamar preview_start:

1. Verificar se a porta está em uso
   → Windows: netstat -ano | grep ":PORTA"
   → Unix: lsof -i :PORTA

2. Se porta ocupada:
   a. Identificar o PID
   b. Verificar se é uma instância anterior do mesmo servidor
      → SIM: matar o processo e reiniciar limpo
      → NÃO: tentar porta alternativa (ex: 3001, 3002) OU perguntar ao usuário
         se o serviço na porta original pode ser parado
```

### Passo 7: Iniciar preview e verificar

```
1. Chamar preview_start com a configuração montada

2. Aguardar servidor inicializar (verificar via preview_logs se há erros de startup)

3. Capturar preview_screenshot

4. Analisar resultado:
   - Página branca + erros 500 → verificar preview_logs e preview_network para causa raiz
   - Erro "URL/Key required" (Supabase) → .env.local com placeholders confirmado,
     estado esperado para ambiente sem credenciais reais
   - Página renderizando → SUCESSO, capturar screenshot final e reportar ao usuário

5. Se houver erro de console após renderização:
   → Tentar autocorrigir se for erro óbvio (módulo não encontrado, import errado)
   → Se não resolver em 1 tentativa: escalar para surge-core
```

---

## Interface CLI (para invocação pelo ConnectPro e core-orchestrator)

Preview-Bridge expõe uma interface JSON padronizada:

```bash
# Interface canônica
preview-bridge --project /caminho/do/projeto --json

# Saída esperada
{
  "status": "success | partial | failed",
  "framework_detected": "nextjs | react | vue | svelte | html",
  "dev_server_url": "http://localhost:3000",
  "port": 3000,
  "pid": 12345,
  "screenshot_path": ".preview/screenshot.jpg",
  "console_errors": [],
  "env_status": "real | placeholder | missing",
  "issues": [],
  "next_step": "surge-core | null"
}
```

**Flags:**
- `--project` — caminho absoluto ou relativo ao projeto
- `--port` — porta específica (opcional, detectada automaticamente)
- `--no-install` — pular instalação de dependências
- `--json` — output em JSON (obrigatório para uso como conector)

---

## Diagnóstico Rápido de Erros Comuns

| Erro | Causa | Solução Automática |
|------|-------|-------------------|
| Página branca | .env.local ausente | Criar com placeholders |
| 500 "URL and Key required" | Supabase sem env vars | Estado esperado — informar usuário |
| "Module not found @/" | jsconfig.json ausente | Criar jsconfig.json com baseUrl e paths |
| Port in use | Processo anterior | Matar PID, reiniciar |
| ERR_ABORTED na rede | Servidor ainda iniciando | Aguardar 3s, tentar novamente |
| cwd outside root | Projeto em diretório irmão | Usar --prefix em vez de cwd |

---

## Contrato (Skill4Dummies SKILL_CONTRACT.md §7.5)

```yaml
name: preview-bridge
role: validação visual
version: "3.0"

execution_policy:
  ask_minimum: true
  never_ask_user_to_check_manually: true     # NOVO: resolver blockers antes de escalar
  auto_resolve_port_conflicts: true           # NOVO: matar processo e reiniciar
  auto_create_env_placeholder: true           # NOVO: criar .env.local se ausente
  auto_install_if_no_node_modules: true       # NOVO: npm install automático
  handle_sibling_directories: true            # NOVO: usar --prefix para projetos fora da raiz
  preserve_context: true
  call_surge_if_execution_occurs: true

success_criteria:
  - preview aberto sem ação manual do usuário
  - framework detectado corretamente
  - launch.json configurado para o caminho correto do projeto
  - screenshot capturado e compartilhado com o usuário
  - erros de console reportados (não bloqueiam success se UI renderizar)

handoff_targets:
  - skill_name: surge-core
    when: preview revelar erros visuais, de runtime ou de console não autocorrigíveis
    payload: console_errors, visual_diff, preview_screenshot, network_failures
```
