---
name: preview-bridge
description: "Use when a web project needs live preview, visual validation, or runtime inspection, including requests like preview, show me, ver, mostrar, como ficou, open preview, or live view."
---

# PreviewBridge v3.0 — Live Preview Robusto (Global)

Skill global de validação visual. Detecta framework, resolve blockers automaticamente e abre o preview
sem ação manual do usuário.

---

## Contract Snapshot

```yaml
name: preview-bridge
role: validação visual
objective: detectar framework, abrir preview ao vivo e devolver sinais visuais e de runtime utilizáveis

activation_rules:
  - rule: pedido explicitamente menciona preview, mostrar, ver, open preview, live view ou equivalente
    priority: high
  - rule: qualquer skill gerou artefato visual ou projeto web que precisa de validação
    priority: high
  - rule: existe app web com necessidade de screenshot, console log ou confirmação visual
    priority: medium

minimum_inputs:
  - project_path_or_web_artifact

optional_inputs:
  - expected_framework
  - preferred_port
  - known_env_requirements
  - previous_runtime_errors

execution_policy:
  ask_minimum: true
  preserve_context: true
  prefer_partial_delivery: true
  auto_observe_if_possible: true
  call_preview_if_visual: true
  call_surge_if_execution_occurs: true
  never_ask_user_to_check_manually: true
  auto_resolve_port_conflicts: true
  auto_create_env_placeholder: true
  auto_install_if_no_node_modules: true
  handle_sibling_directories: true

output_schema:
  status: success | partial | blocked | failed
  summary: framework detectado + estado do preview
  artifacts: preview_url, launch_config, screenshots, console_findings
  issues: framework_not_detected, build_failure, runtime_console_error, missing_env
  next_step: surge-core ou próxima validação
  confidence_score: 0.0-1.0

failure_policy:
  recoverable: true
  ask_user_only_if_blocked: true
  must_explain_blocker: true
  must_propose_next_action: true

handoff_targets:
  - skill_name: surge-core
    when: preview revelar erro visual, runtime error ou console error não autocorrigível
    payload: console_errors, visual_diff, preview_screenshot, network_failures
  - skill_name: dummy-memory
    when: preview relevante foi aberto ou o diagnóstico gerou sinal reutilizável
    payload: preview_url, framework_detected, issues, screenshots

success_criteria:
  - preview aberto sem ação manual do usuário
  - framework detectado corretamente
  - screenshot ou evidência visual capturada
  - erros de console e blockers relevantes reportados

observability_signals:
  - signal: framework_detected
    description: framework e comando de dev inferidos
  - signal: preview_opened
    description: URL do preview ficou acessível
  - signal: env_placeholder_created
    description: preview exigiu .env.local placeholder
  - signal: console_errors_found
    description: runtime visual abriu com erros de console
  - signal: surge_handoff
    description: problema precisa de observação/correção adicional
```

---

## Formato de Reporte

```
[preview-bridge] iniciando — detectando framework em {projeto} ⚙️
[preview-bridge] passo 1/6: framework detectado — {Next.js | React | Vue | ...}
[preview-bridge] passo 2/6: .env verificado — {ok | placeholder criado}
[preview-bridge] passo 3/6: dependências — {ok | instalando npm...} ⚙️
[preview-bridge] passo 4/6: launch.json configurado ✓
[preview-bridge] passo 5/6: iniciando servidor na porta {N} ⚙️
[preview-bridge] passo 6/6: ✓ preview ao vivo — {URL}
[preview-bridge] ✗ bloqueado em passo {N} — {motivo} → escalando para surge-core
```

---

## Regra Fundamental

**Nunca peça para o usuário verificar manualmente.** Se algo bloquear o preview, resolva antes de
escalar. Só escala para o usuário se o bloqueio for genuinamente irresolvível.

**Nunca invente nomes de tools ou MCPs.** Use as capacidades reais expostas no ambiente atual; se o
ambiente tiver helpers extras de detecção, setup, logs ou rede, use-os como otimização, não como
pré-requisito do contrato.

---

## Fluxo Obrigatório (executar nesta ordem)

### Passo 1: Detectar ambiente e framework

**SEMPRE preferir as capacidades reais do ambiente antes de assumir um fluxo específico:**

```
1. Se existir runtime PreviewBridge/MCP no ambiente:
   → ativar o runtime disponível
   → usar screenshot, viewport, foco de componente e leitura de erros quando houver

2. Se o ambiente expuser helpers extras de detecção/setup/start:
   → usar esses helpers
   → tratar isso como aceleração do fluxo, não como dependência obrigatória

3. Se não existir helper de detecção:
   → ler package.json
   → inferir framework, comando de dev e porta
   → detectar se o projeto está dentro da sessão ou em diretório irmão

4. Se o projeto estiver FORA do diretório de sessão:
   → escrever também na sessão: .claude/launch.json com npm --prefix /caminho/absoluto
   → manter o mesmo nome lógico do servidor
   → exemplo: { runtimeArgs: ["--prefix", "/caminho/absoluto", "run", "dev"] }
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

### Passo 3: Verificar dependências

```
1. node_modules existe na raiz do app?
   → NÃO: executar npm install --prefix /caminho/do/app antes de iniciar

2. package-lock.json existe mas node_modules não?
   → npm ci --prefix /caminho/do/app (mais rápido)
```

### Passo 4: Configurar launch.json

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

### Passo 5: Resolver conflito de porta

```
Antes de iniciar o servidor:

1. Verificar se a porta está em uso
   → Windows: netstat -ano | findstr ":PORTA"
   → Unix: lsof -i :PORTA

2. Se porta ocupada:
   a. Identificar o PID
   b. Verificar se é uma instância anterior do mesmo servidor
      → SIM: matar o processo e reiniciar limpo
      → NÃO: tentar porta alternativa (ex: 3001, 3002) OU perguntar ao usuário
         se o serviço na porta original pode ser parado
```

### Passo 6: Iniciar preview e verificar

```
1. Iniciar o servidor de desenvolvimento com a configuração montada

2. Aguardar servidor inicializar
   → se houver captura de logs/erros no ambiente, usar
   → se não houver, validar por resposta HTTP, screenshot e sinais do terminal

3. Capturar preview_screenshot

4. Analisar resultado:
   - Página branca + falhas HTTP/erros de runtime → identificar causa raiz via logs, terminal,
     captura de erros ou sinais de rede disponíveis
   - Erro "URL/Key required" (Supabase) → .env.local com placeholders confirmado,
     estado esperado para ambiente sem credenciais reais
   - Página renderizando → SUCESSO, capturar screenshot final e reportar ao usuário

5. Se houver erro de console após renderização:
   → Tentar autocorrigir se for erro óbvio (módulo não encontrado, import errado)
   → Se não resolver em 1 tentativa: escalar para surge-core
```

---

## Interface CLI Esperada (opcional para conectores)

Se o ambiente expuser um wrapper CLI para o Preview-Bridge, o contrato recomendado é:

```bash
# Exemplo de interface
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

**Flags recomendadas:**
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

## Nota de Alinhamento com o Skill Contract

O bloco `Contract Snapshot` acima é a fonte principal desta skill. O `skill4d-core-orchestrator`
deve permanecer alinhado com:

- ativação automática após artefato visual ou pedido explícito de preview
- abertura do preview sem pedir verificação manual ao usuário
- diagnóstico por sinais reais do ambiente
- handoff para `surge-core` quando houver blocker não autocorrigível
