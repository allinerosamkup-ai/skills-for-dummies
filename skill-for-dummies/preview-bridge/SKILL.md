---
name: preview-bridge
description: "Use when a web project or generated web artifact needs a real live preview, hot refresh, screenshot validation, runtime inspection, or browser evidence. Triggers: preview, show me, ver, mostrar, como ficou, open preview, live view, static HTML, Vite/Next/React UI, or any visual artifact after build."
---

# PreviewBridge v3.1 — Truly Live Preview

PreviewBridge existe para fazer uma coisa principal: abrir um preview vivo e validado sem jogar
trabalho manual para a Alline.

Referencia comportamental: Live Server++ (`ritwickdey/vscode-live-server-plus-plus`) prioriza preview
realmente vivo: sem precisar salvar quando o ambiente fornece conteudo em memoria, sem reload completo
para HTML/CSS, root/porta/index/timeout configuraveis, abertura de browser e start/stop controlaveis.

No D.U.M.M.Y. OS, isso vira contrato operacional:

1. Gerou ou recebeu HTML/CSS/JS, JSX, TSX, Vite, Next ou qualquer UI visual -> PreviewBridge entra automaticamente.
2. Primeiro tenta o runtime real `dummyos.preview.*` quando disponivel.
3. Se for artefato estatico ou HTML em memoria, usa live static preview com update sem salvar.
4. Se for app com `package.json`, detecta framework, instala dependencias quando necessario, inicia dev server e valida no browser.
5. Nao declara sucesso sem URL viva, HTTP OK, evidencia visual e checagem de erros.

---

## Contract Snapshot

```yaml
name: preview-bridge
role: live preview + runtime validation
objective: abrir preview vivo, atualizar sem atrito, validar visualmente e devolver evidencias acionaveis

activation_rules:
  - rule: usuario pede preview, mostrar, ver, open preview, live view ou equivalente
    priority: high
  - rule: qualquer skill gerou artefato visual web, incluindo HTML/JSX/TSX/CSS
    priority: high
  - rule: existe app web que precisa de screenshot, console log, verificacao HTTP ou runtime inspection
    priority: high
  - rule: artefato ainda esta em memoria e nao deve depender de "salvar arquivo" para aparecer
    priority: high

minimum_inputs:
  - project_path_or_web_artifact

optional_inputs:
  - html
  - virtual_files
  - expected_framework
  - preferred_port
  - server_root
  - index_file
  - reload_delay_ms
  - browser_preference
  - known_env_requirements
  - previous_runtime_errors

execution_policy:
  ask_minimum: true
  never_ask_user_to_check_manually: true
  use_runtime_tool_first: true
  prefer_chrome_devtools_mcp_for_browser_evidence: true
  evidence_budget:
    goal: "evidencia suficiente com custo minimo; evitar loop alucinado de screenshot"
    max_browser_sessions_per_task: 1
    max_screenshots_per_preview: 1
    screenshot_only_when:
      - first_validation_for_preview
      - http_not_ok
      - blank_page_suspected
      - console_has_errors
      - visual_delta_detected
    prefer_dom_snapshot_over_screenshot_after_first: true
    dedupe_key: "preview_id + url + dom_hash"
    max_console_messages: 40
    max_network_failures: 20
  token_budget:
    max_report_chars: 3500
    never_repeat_full_logs: true
    summarize_and_clip: true
  support_static_html_without_package_json: true
  support_virtual_no_save_updates: true
  support_css_hot_swap: true
  support_soft_html_refresh: true
  auto_resolve_port_conflicts: true
  auto_detect_framework: true
  auto_install_if_no_node_modules: true
  auto_create_env_placeholder: true
  validate_with_http_and_browser: true
  call_surge_if_execution_fails: true

output_schema:
  status: success | partial | blocked | failed
  summary: preview_url + modo usado + validacao executada
  artifacts: preview_url, preview_id, port, screenshot_path, console_findings, network_findings
  issues: runtime_tool_missing, framework_not_detected, build_failure, runtime_console_error, missing_env, blank_page
  next_step: surge-core | dummy-memory | user
  confidence_score: 0.0-1.0

handoff_targets:
  - skill_name: surge-core
    when: preview revelar erro visual, build/runtime error, pagina branca ou console error nao autocorrigivel
    payload: preview_url, preview_id, console_errors, network_failures, screenshot_path, terminal_logs
  - skill_name: ConnectPro
    when: preview depende de credencial real, OAuth, API key ou servico externo ainda nao resolvido
    payload: required_services, env_var_names, degraded_preview_state
  - skill_name: dummy-memory
    when: preview foi validado ou diagnostico gerou aprendizado reutilizavel
    payload: preview_url, framework_detected, runtime_mode, issues, screenshot_path

success_criteria:
  - preview_url responde HTTP 200/3xx esperado
  - browser ou ferramenta equivalente capturou evidencia visual (snapshot/screenshot) dentro do budget
  - HTML/CSS recebem atualizacao viva sem reload completo quando usando runtime estatico
  - porta ocupada foi desviada automaticamente ou processo anterior do mesmo preview foi encerrado
  - erros de console/rede relevantes foram checados
  - estado final foi salvo em dummy-memory
```

---

## Backend de Evidência no Browser

Quando precisar de screenshot/console/network evidence, a ordem preferida é:

1. Chrome DevTools MCP (`chrome-devtools-mcp`) quando estiver configurado no cliente MCP
2. Browser automation (quando disponível no ambiente)
3. Sem browser evidence: continuar com HTTP + logs e escalar para surge-core se necessário

Tools úteis (prefixo típico `mcp__chrome-devtools__*`):
`take_screenshot`, `list_console_messages`, `list_network_requests`, `get_network_request`, `take_snapshot`, `evaluate_script`.

## Runtime Canonico

Quando `dummyos-plugin` estiver disponivel, PreviewBridge deve usar estas tools antes de qualquer fallback:

```yaml
dummyos.preview.start:
  uso: iniciar preview estatico vivo para HTML/CSS/JS ou artefatos em memoria
  inputs: projectPath, root, port, indexFile, reloadDelayMs, html, virtualFiles, watch
  entrega: previewId, url, port, capabilities

dummyos.preview.update:
  uso: atualizar HTML/CSS/JS em memoria sem exigir save em disco
  inputs: previewId, html, files
  entrega: changed, url

dummyos.preview.status:
  uso: listar previews ativos antes de iniciar outro

dummyos.preview.stop:
  uso: encerrar preview quando a sessao ou validacao terminar
```

Capacidades obrigatorias desse runtime:

- servir projeto estatico mesmo sem `package.json`
- injetar cliente live em HTML
- trocar CSS por cache-busting sem reload completo
- atualizar HTML por soft refresh sem navegacao completa
- atualizar assets sem reload completo quando possivel
- usar arquivos virtuais para preview de conteudo ainda nao salvo
- tentar porta livre automaticamente quando a porta pedida estiver ocupada
- bloquear caminhos sensiveis como `.env`, `.git`, `.dummy` e `node_modules`

Se as tools `dummyos.preview.*` nao existirem no ambiente, registrar `runtime_tool_missing` e seguir fallback:

1. Preview MCP/bridge nativo do ambiente, se existir.
2. Dev server do framework (`npm run dev`, `vite`, `next dev`, etc.).
3. Servidor estatico local simples para HTML/CSS/JS.
4. Se nada abrir, escalar para surge-core com logs e tentativas feitas.

---

## Fluxo Obrigatorio

### Passo 1: Classificar o alvo

```text
HTML/CSS/JS em memoria ou gerado agora
  -> dummyos.preview.start com html/virtualFiles
  -> dummyos.preview.update a cada alteracao relevante

Projeto estatico com index.html e sem package.json
  -> dummyos.preview.start com root/indexFile

Projeto com package.json
  -> detectar framework e comando dev
  -> se for Vite/React/Next/Vue/Svelte, usar dev server do framework
  -> se o app falhar antes de renderizar, usar runtime estatico somente para isolar artefato visual

Projeto fora do cwd
  -> usar caminho absoluto ou npm --prefix
  -> nao pedir para Alline mover pasta
```

### Passo 2: Resolver configuracao

```text
root: default "."
port: default 5555 para static preview; porta do framework para apps com package.json
indexFile: default "index.html"
reloadDelayMs: default 300
browser: abrir via browser automation/preview runtime quando permitido; se exigir app externo, pedir autorizacao
```

### Passo 3: Verificar ambiente

```text
1. Se package.json existe:
   - ler scripts e dependencias
   - escolher comando dev correto
   - instalar dependencias se node_modules nao existe

2. Se .env.local/.env for necessario:
   - copiar .env.example quando existir
   - criar placeholder somente para variaveis publicas indispensaveis
   - nao bloquear preview visual por credencial ausente

3. Se porta estiver ocupada:
   - checar se e preview anterior do mesmo app
   - se for, reiniciar limpo
   - se nao for, usar proxima porta livre
```

### Passo 4: Abrir e validar

```text
1. Iniciar preview/dev server.
2. Fazer HTTP fetch da URL.
3. Abrir no browser automation ou preview runtime disponivel.
4. Capturar evidencia visual com budget:
   - Preferir `take_snapshot` (DOM + estado) como evidencia leve
   - Capturar screenshot apenas se for a primeira validacao do preview OU se houver sinal de falha/delta
5. Ler console/runtime errors quando a ferramenta permitir (clipar no max_console_messages).
6. Confirmar que a pagina nao esta branca (sem repetir screenshot se nao houve delta):
   - DOM com conteudo relevante
   - screenshot nao vazio
   - assets essenciais carregaram
7. Em static preview, testar uma atualizacao viva:
   - CSS: confirmar hot swap sem reload completo
   - HTML: confirmar soft refresh
   - virtual update: confirmar `dummyos.preview.update` quando o artefato veio em memoria
```

### Passo 5: Autocorrecao

```text
Erro obvio e local:
  -> corrigir uma vez e revalidar

Build/runtime quebrado:
  -> surge-core com logs, URL, screenshot e causa provavel

Credencial real ausente:
  -> ConnectPro se a funcionalidade depende disso
  -> manter preview degradado se a UI renderiza

Tudo OK:
  -> salvar preview_url e modo em dummy-memory
```

---

## Regras de Qualidade

- PreviewBridge nao e "mande o usuario rodar npm". Ele roda, valida e entrega evidencia.
- Para artefatos estaticos, o caminho preferido e `dummyos.preview.start`, nao `npm run dev`.
- Para conteudo ainda em memoria, nao criar arquivo so para ver se o runtime suporta `html`/`virtualFiles`.
- Para HTML/CSS, evitar full reload quando o runtime vivo estiver disponivel.
- Para JS ou mudanca estrutural pesada, reload completo e aceitavel.
- Nao declarar "funcionou" com base apenas em terminal sem HTTP/browser.
- Nao esconder pagina branca atras de "server started".
- Nao servir arquivos sensiveis.
- Se abrir browser externo exigir autorizacao da plataforma, pedir antes da acao externa e continuar com fetch/screenshot interno quando possivel.

---

## Formato de Reporte

```text
[preview-bridge] iniciando — alvo: {static|virtual|next|vite|react|html}
[preview-bridge] passo 1/7: runtime — {dummyos.preview.start|framework dev server|fallback}
[preview-bridge] passo 2/7: root/porta/index — {root} : {port} : {indexFile}
[preview-bridge] passo 3/7: env/deps — {ok|placeholder|install}
[preview-bridge] passo 4/7: servidor — {url}
[preview-bridge] passo 5/7: HTTP — {status}
[preview-bridge] passo 6/7: browser — screenshot {path|capturado}
[preview-bridge] passo 7/7: live update — {css_hot_swap|soft_html|virtual_update|nao_aplicavel}
[preview-bridge] CONCLUIDO — preview validado: {url}
```

---

## Interface CLI/MCP Esperada

```bash
dummyos-plugin call dummyos.preview.start "{\"projectPath\":\"C:\\\\app\",\"root\":\".\",\"port\":5555}"
dummyos-plugin call dummyos.preview.update "{\"previewId\":\"...\",\"files\":{\"style.css\":\"body{color:red}\"}}"
dummyos-plugin call dummyos.preview.status "{}"
dummyos-plugin call dummyos.preview.stop "{\"previewId\":\"...\"}"
```

Saida minima de `dummyos.preview.start`:

```json
{
  "ok": true,
  "previewId": "...",
  "url": "http://127.0.0.1:5555/",
  "port": 5555,
  "capabilities": {
    "staticServer": true,
    "liveEvents": true,
    "softHtmlRefresh": true,
    "cssHotSwap": true,
    "assetRefresh": true,
    "virtualNoSaveUpdates": true,
    "autoPortFallback": false
  }
}
```

---

## Diagnostico Rapido

| Sintoma | Causa provavel | Acao |
|---|---|---|
| `package.json not found` | projeto estatico | usar `dummyos.preview.start`, nao falhar |
| pagina branca | erro runtime ou asset ausente | browser + console + screenshot, depois surge-core |
| CSS nao muda | live client ausente/cache | confirmar injecao e cache-busting |
| HTML so muda com reload completo | fallback sem runtime vivo | usar `dummyos.preview.start` com soft refresh |
| porta ocupada | processo existente | usar proxima porta livre ou reiniciar preview anterior |
| `.env` ausente | credencial/API real | criar placeholder publico ou escalar ConnectPro |
| preview abriu mas nao validou | falha de verificacao | nao concluir; capturar evidencias |
