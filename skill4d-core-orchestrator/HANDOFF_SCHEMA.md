# HANDOFF_SCHEMA.md
# Skill4Dummies — Esquema de Handoff entre Skills

## Objetivo

Este documento define como uma skill passa contexto para outra.

Sem handoff claro:
- contexto se perde
- a skill seguinte recomeça do zero
- surgem prompts extras
- o sistema fica caro e instável

Com handoff claro:
- o fluxo continua
- a próxima skill entende o estado atual
- o sistema parece one-shot por fora

---

## 1. Regra geral

Toda transição entre skills deve carregar um envelope estruturado.

Nenhuma skill deve "adivinhar" o estado do fluxo.
Ela deve recebê-lo.

---

## 2. Envelope canônico de handoff

```json
{
  "goal": "o objetivo final do usuário",
  "user_intent": "interpretação atual da intenção",
  "current_state": "em que estágio do fluxo estamos",
  "requested_capabilities": [],
  "artifacts": [],
  "decisions_made": [],
  "blocking_issues": [],
  "expected_next_step": "o que a skill receptora deve tentar fazer",
  "fallback_if_blocked": "qual a próxima melhor opção se falhar",
  "confidence_score": 0.0,
  "requires_user_input": false,
  "clarification_question": null
}
```

---

## 3. Semântica dos campos

### goal
Objetivo final do usuário em linguagem simples.

Exemplo: `"Transformar esta imagem em um app navegável"`.

### user_intent
Interpretação operacional atual do pedido.

Exemplo: `"Usuário quer um app web inicial baseado em layout visual com mínima configuração manual"`.

### current_state
Estado resumido do fluxo.

Valores sugeridos:
- `initial_request`
- `dependencies_prepared`
- `visual_parsed`
- `ui_generated`
- `app_generated`
- `preview_opened`
- `errors_detected`
- `patch_proposed`
- `delivery_ready`

### artifacts
Tudo que já foi produzido e pode ser usado pela próxima skill.

Formato sugerido:

```json
[
  {
    "type": "image | code | config | preview | screenshot | report | repo | schema",
    "ref": "path, id ou descrição",
    "description": "o que é esse artefato"
  }
]
```

### decisions_made
Decisões importantes já tomadas e que não devem ser refeitas.

Exemplos:
- stack escolhida
- framework inferido
- caminho de execução selecionado
- trade-offs assumidos

### blocking_issues
Problemas concretos ainda abertos.

Formato sugerido:

```json
[
  {
    "type": "missing_input | dependency | runtime_error | ambiguity | external_limit",
    "severity": "low | medium | high",
    "message": "descrição curta",
    "recoverable": true
  }
]
```

### expected_next_step
A instrução operacional para a skill receptora.

Exemplo: `"Abrir preview do projeto web e capturar sinais de erro"`.

### fallback_if_blocked
O que fazer se a próxima skill não conseguir seguir.

Exemplo: `"Se não detectar framework, devolver blocked com diagnóstico e passar para engineering-mentor"`.

### confidence_score
Confiança da skill emissora sobre o estado atual.
Faixa: `0.0` a `1.0`.

### requested_capabilities
Lista de capacidades que a skill emissora precisa que o sistema obtenha antes de continuar.

Exemplos:
- `"web_search"` (pesquisa e coleta de referencias/pacotes/padroes)
- `"browser_automation"` (login/dashboard/scrape)
- `"email_confirmation"` (capturar codigo/magic link)
- `"workflow_automation"` (n8n como auxiliar)
- `"mcp_discovery"` (descobrir MCPs desconhecidos via registry)

### requires_user_input
Booleano.
`true` apenas quando a próxima skill realmente não puder agir sem intervenção.

### clarification_question
Pergunta única, clara e mínima, se for inevitável.

---

## 4. Regras obrigatórias de handoff

### Regra 1 — Nunca passar contexto cru demais
Não despejar tudo.
Passe apenas o que a próxima skill precisa.

### Regra 2 — Nunca passar contexto pobre demais
A próxima skill não deve reabrir perguntas já resolvidas.

### Regra 3 — Sempre carregar artefatos relevantes
Se houve código, screenshot, logs, preview ou config, isso deve seguir junto.

### Regra 4 — Sempre carregar decisões já tomadas
Evita retrabalho e inconsistência.

### Regra 5 — Toda skill receptora deve respeitar o handoff
Ela pode complementar.
Não deve ignorar sem motivo.

---

## 5. Handoffs padrão do ecossistema

### ConnectPro → app-factory-multiagent / mock-to-react
Usar quando setup, integrações ou dependências já foram resolvidos.

Payload mínimo:
- goal
- resolved services
- blocked integrations
- ready state

### mock-to-react → preview-bridge
Usar quando a UI foi gerada e precisa ser validada visualmente.

Payload mínimo:
- goal
- generated UI artifacts
- framework guess
- expected preview action

### app-factory-multiagent → preview-bridge
Usar quando a build robusta gerou interface ou app web.

Payload mínimo:
- goal
- generated modules
- repo structure
- runtime instructions

### preview-bridge → surge-core
Usar quando aparecer:
- erro de runtime
- erro de console
- inconsistência visual
- build quebrada

Payload mínimo:
- goal
- preview URL
- screenshots
- console findings
- build findings

### surge-core → core-orchestrator
Usar quando o fluxo precisar mudar de rota.

Payload mínimo:
- detected issues
- probable causes
- suggested next step
- recoverability

### surge-core → engineering-mentor
Usar quando o erro exigir interpretação ou decisão mais conceitual.

Payload mínimo:
- root cause hypothesis
- ambiguity
- options to resolve

### engineering-mentor → core-orchestrator
Usar quando a decisão foi consolidada e o fluxo pode continuar.

Payload mínimo:
- recommended path
- decision rationale
- next actionable step

---

## 6. Exemplo completo

### Exemplo: mock-to-react → preview-bridge

```json
{
  "goal": "Transformar esta imagem em um app navegável",
  "user_intent": "Usuário quer uma primeira interface funcional baseada em um layout visual",
  "current_state": "ui_generated",
  "artifacts": [
    {
      "type": "code",
      "ref": "src/components/Home.tsx",
      "description": "Componente principal gerado a partir do mock"
    },
    {
      "type": "config",
      "ref": "package.json",
      "description": "Projeto React/Vite detectado"
    }
  ],
  "decisions_made": [
    "Usar React com Vite",
    "Gerar Tailwind para estilização inicial"
  ],
  "blocking_issues": [],
  "expected_next_step": "Abrir preview do projeto e capturar screenshot e console logs",
  "fallback_if_blocked": "Se o preview não subir, registrar erro e passar para surge-core",
  "confidence_score": 0.86,
  "requires_user_input": false,
  "clarification_question": null
}
```

---

## 7. Regra final

Se uma skill não sabe o que recebeu,
a culpa é do handoff.
Se uma skill repete perguntas já respondidas,
a culpa é do handoff.
Se o sistema parece lento apesar de boas skills,
o problema quase sempre está no handoff.

---

## 8. Output Schemas Canônicos por Skill

Cada skill produz um output estruturado ao final da execução. A skill receptora **deve esperar exatamente este formato** no campo `artifacts` do handoff. Cada schema inclui `namespace` — as chaves que a skill escreve no dummy-memory para acesso cross-skill.

### mock-to-react
```json
{
  "status": "success | partial | failed",
  "mode": "COPY | CREATIVE | SCAN",
  "similarity": 99.7,
  "design_tokens": {
    "colors": [], "typography": [], "spacing": { "base": 8 }
  },
  "generated_code": {
    "jsx": "...", "component_tree": {}, "styling_strategy": "css_variables"
  },
  "resources_used": {
    "npm_packages": [], "icons": {}, "github_references": []
  },
  "aesthetic_audit": {
    "coesao_score": 78, "contraste": {}, "harmonia_esquema": "complementar", "tipografia_escala": "Perfect Fourth"
  },
  "namespace": {
    "mock-to-react/design_tokens": "{colors, typography, spacing}",
    "mock-to-react/harmony_score": "78/100 — 1 aviso WCAG"
  }
}
```

### ConnectPro
```json
{
  "status": "success | partial | failed",
  "services_resolved": ["supabase", "resend"],
  "env_vars_created": ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_KEY"],
  "services_blocked": [],
  "next_action": "app-factory-multiagent | user | engineering-mentor",
  "namespace": {
    "ConnectPro/services_resolved": "[supabase, resend]",
    "ConnectPro/env_vars": "[SUPABASE_URL, SUPABASE_ANON_KEY]"
  }
}
```

### app-factory-multiagent
```json
{
  "status": "success | partial | failed",
  "stack": "Next.js 14 + Supabase + Tailwind",
  "files_created": ["src/app/page.tsx", "src/lib/supabase.ts"],
  "api_contract": {
    "endpoints": [{ "method": "POST", "path": "/notes", "entity": "Note" }],
    "entities": ["Note", "User"]
  },
  "build_status": "passing | failing",
  "namespace": {
    "app-factory/api_contract": "POST/GET/DELETE /notes",
    "app-factory/stack_chosen": "Next.js 14 + Supabase + Tailwind"
  }
}
```

### engineering-mentor
```json
{
  "status": "success | partial | failed",
  "prd_summary": "App de notas com auth email + Supabase",
  "stack_recommended": "Next.js + Supabase",
  "issues": [{ "id": "issue-1", "title": "Autenticação", "priority": "high" }],
  "decision": "descrição da decisão arquitetural tomada",
  "namespace": {
    "engineering-mentor/prd_approved": "App de notas com auth email + Supabase",
    "engineering-mentor/issues": "[issue-1, issue-2]"
  }
}
```

### surge-core
```json
{
  "status": "success | partial | failed | escalated",
  "task_id": "t4",
  "root_cause": "módulo 'pg' não instalado",
  "correction_applied": "npm install pg",
  "blocked_tasks_to_unblock": ["t5", "t6"],
  "retry_ready": true,
  "reusable_pattern": { "symptom": "...", "fix": "...", "when": "..." },
  "namespace": {
    "surge-core/errors_fixed": "[TypeError: Cannot read 'user' of undefined]"
  }
}
```

### preview-bridge
```json
{
  "status": "success | partial | failed",
  "preview_url": "http://localhost:3000",
  "screenshot": "report/screenshot.png",
  "console_errors": [],
  "network_errors": [],
  "visual_match": true,
  "namespace": {
    "preview-bridge/preview_url": "http://localhost:3000"
  }
}
```

### dummy-memory
```json
{
  "status": "success | partial | failed",
  "operation": "LOAD | SAVE | DREAM | SNAPSHOT | PERFIL | CONSULTA",
  "memory_loaded": true,
  "state_summary": "App de notas em Next.js 14, Supabase configurado",
  "env_resolved": ["supabase", "resend"],
  "known_decisions": ["usar App Router", "Tailwind como styling"],
  "snapshot": { "mock-to-react/harmony_score": "78/100", "ConnectPro/services_resolved": "..." }
}
```

---

## 9. Validação de Schema no Handoff

Quando uma skill recebe um handoff, ela **deve verificar** se os campos obrigatórios estão presentes antes de executar:

```
SE handoff.artifacts está vazio E current_state != "initial_request":
  → AVISO: "handoff incompleto — artefatos esperados ausentes"
  → Tentar recuperar do dummy-memory/namespace da skill anterior
  → SE não encontrar: reportar bloqueio ao orchestrator

SE handoff.decisions_made está vazio E current_state IN ["ui_generated", "app_generated"]:
  → AVISO: "decisões de stack não encontradas — risco de inconsistência"
  → Ler engineering-mentor/prd_approved ou app-factory/stack_chosen do namespace

VALIDAÇÃO PASSA → skill executa normalmente
```
