# SKILL_CONTRACT.md
# Skill4Dummies — Contrato Unificado das Skills

## Objetivo

Este documento define o contrato mínimo que toda skill do ecossistema Skill4Dummies deve seguir.

A meta não é padronizar por burocracia.
A meta é permitir:

- orquestração confiável
- handoff limpo
- autocorreção
- observabilidade
- avaliação sistemática
- evolução sem caos

Sem contrato, o sistema vira coleção de prompts.
Com contrato, o sistema vira arquitetura.

---

## 1. Estrutura mínima obrigatória de toda skill

Toda skill deve declarar explicitamente:

1. `name`
2. `role`
3. `objective`
4. `activation_rules`
5. `minimum_inputs`
6. `optional_inputs`
7. `execution_policy`
8. `output_schema`
9. `failure_policy`
10. `handoff_targets`
11. `success_criteria`
12. `observability_signals`

---

## 2. Template canônico

```yaml
name: string
role: string
objective: string

activation_rules:
  - rule: string
    priority: high | medium | low

minimum_inputs:
  - name: string
    type: string | object | array | boolean | number | file
    required: true
    description: string

optional_inputs:
  - name: string
    type: string | object | array | boolean | number | file
    required: false
    description: string

execution_policy:
  ask_minimum: true
  preserve_context: true
  prefer_partial_delivery: true
  auto_observe_if_possible: true
  call_preview_if_visual: true
  call_surge_if_execution_occurs: true

output_schema:
  status: success | partial | blocked | failed
  summary: string
  artifacts: array
  issues: array
  next_step: string
  confidence_score: number

failure_policy:
  recoverable: true | false
  ask_user_only_if_blocked: true
  must_explain_blocker: true
  must_propose_next_action: true

handoff_targets:
  - skill_name: string
    when: string
    payload: string

success_criteria:
  - string

observability_signals:
  - signal: string
    description: string
```

---

## 3. Semântica dos campos

### name
Nome estável da skill. Não deve mudar com frequência.

### role
Função sistêmica da skill.
Deve responder: "qual papel essa skill exerce no conjunto?"

### objective
Resultado esperado da skill em uma frase.
Não descrever processo; descrever efeito.

### activation_rules
Define quando a skill deve ser chamada.
Toda regra deve ser objetiva e preferencialmente detectável pelo orquestrador.

### minimum_inputs
O mínimo absoluto para agir com utilidade.
Se a skill exigir demais, ela aumenta atrito e enfraquece o sistema.

### optional_inputs
Contexto extra que melhora qualidade, mas não deve ser obrigatório para começar.

### execution_policy
Define o comportamento operacional da skill.
Toda skill do Skill4Dummies deve:
- perguntar pouco
- preservar contexto
- evitar bloqueio total
- entregar algo útil quando possível

### output_schema
Toda skill deve devolver uma resposta padronizada.

Campos obrigatórios:
- `status`
- `summary`
- `artifacts`
- `issues`
- `next_step`
- `confidence_score`

### failure_policy
Toda falha deve ser útil.
Falhar sem propor próxima ação é falha dupla.

### handoff_targets
Define para quais skills essa skill costuma passar o trabalho adiante.

### success_criteria
Critérios objetivos de sucesso.
Devem poder ser avaliados depois.

### observability_signals
Define quais sinais essa skill emite para o sistema observar:
- logs
- preview
- erro
- artefato gerado
- intervenção manual necessária
- clarificações extras

---

## 4. Status padrão

Toda skill deve terminar em um destes status:

- `success` → entregou valor suficiente
- `partial` → entregou algo útil, mas incompleto
- `blocked` → não conseguiu seguir sem contexto ou recurso crítico
- `failed` → erro real, sem entrega útil

Regra:
- prefira `partial` a `failed` quando houver algum valor entregue
- use `blocked` quando houver impedimento concreto
- use `failed` somente quando a execução realmente colapsar

---

## 5. Envelope de resposta obrigatório

Toda skill deve responder neste formato lógico:

```json
{
  "status": "success | partial | blocked | failed",
  "summary": "o que foi feito e em que estado ficou",
  "artifacts": [
    {
      "type": "code | preview | config | report | screenshot | repo | patch | explanation",
      "path": "string opcional",
      "content_ref": "string opcional",
      "description": "string"
    }
  ],
  "issues": [
    {
      "type": "missing_input | runtime_error | dependency | quality_gap | ambiguity",
      "severity": "low | medium | high",
      "message": "string",
      "recoverable": true
    }
  ],
  "next_step": "qual a melhor próxima ação",
  "confidence_score": 0.0
}
```

---

## 6. Regras globais do ecossistema

### Regra 1 — Não perguntar cedo demais
A skill só deve pedir informação extra se isso impedir ação útil.

### Regra 2 — Não perder contexto
Toda skill deve herdar e respeitar o estado atual do fluxo.

### Regra 3 — Não monopolizar
A skill não deve tentar resolver o que pertence claramente a outra.

### Regra 4 — Não ocultar incerteza
Se a confiança for baixa, isso deve aparecer em `confidence_score` e/ou `issues`.

### Regra 5 — Não falhar em silêncio
Toda falha precisa registrar:
- o que tentou
- o que faltou
- o que sugere fazer agora

---

## 7. Contrato por skill

### 7.1 ConnectPro

```yaml
name: ConnectPro
role: preparação invisível
objective: resolver integrações, credenciais, setup e dependências antes da execução principal

minimum_inputs:
  - goal
  - required_services

output_schema:
  status
  summary
  artifacts:
    - resolved_connections
    - setup_notes
  issues:
    - missing_permissions
    - blocked_integrations
  next_step
  confidence_score

handoff_targets:
  - skill_name: criador-de-apps
    when: ambiente básico resolvido
  - skill_name: app-factory-multiagent
    when: projeto robusto depende de serviços externos
  - skill_name: mock-to-react
    when: fluxo visual já pode seguir
```

### 7.2 mock-to-react

```yaml
name: mock-to-react
role: transformação visual
objective: converter imagem, mock ou layout em código de interface utilizável

minimum_inputs:
  - visual_input

output_schema:
  status
  summary
  artifacts:
    - ui_code
    - design_tokens
    - assets_needed
  issues:
    - missing_visual_context
    - mismatch_risk
  next_step
  confidence_score

handoff_targets:
  - skill_name: preview-bridge
    when: interface gerada
  - skill_name: app-factory-multiagent
    when: interface precisa virar app completo
```

### 7.3 criador-de-apps

```yaml
name: criador-de-apps
role: geração rápida de MVP
objective: criar um MVP funcional com baixo overhead

minimum_inputs:
  - product_goal

output_schema:
  status
  summary
  artifacts:
    - mvp_structure
    - generated_files
    - run_instructions
  issues:
    - missing_feature_details
    - weak_scope_definition
  next_step
  confidence_score

handoff_targets:
  - skill_name: preview-bridge
    when: houver app web
  - skill_name: surge-core
    when: build precisar de observação
```

### 7.4 app-factory-multiagent

```yaml
name: app-factory-multiagent
role: construção robusta
objective: construir app mais completo e coordenado com maior rigor

minimum_inputs:
  - product_brief

output_schema:
  status
  summary
  artifacts:
    - repo_structure
    - contracts
    - generated_modules
    - qa_status
  issues:
    - unresolved_dependencies
    - architecture_conflicts
    - quality_gaps
  next_step
  confidence_score

handoff_targets:
  - skill_name: preview-bridge
    when: resultado web gerado
  - skill_name: surge-core
    when: execução produzir sinais observáveis
  - skill_name: engineering-mentor
    when: houver decisão arquitetural ambígua
```

### 7.5 preview-bridge

```yaml
name: preview-bridge
role: validação visual
objective: detectar framework, abrir preview e mostrar o resultado ao vivo

minimum_inputs:
  - project_path_or_web_artifact

output_schema:
  status
  summary
  artifacts:
    - preview_url
    - launch_config
    - screenshots
    - console_findings
  issues:
    - framework_not_detected
    - build_failure
    - runtime_console_error
  next_step
  confidence_score

handoff_targets:
  - skill_name: surge-core
    when: houver erro visual, de runtime ou de console
```

### 7.6 surge-core

```yaml
name: surge-core
role: observação e autocorreção
objective: detectar falhas, diagnosticar causas e propor ou aplicar correções

minimum_inputs:
  - execution_result
  - observable_signals

output_schema:
  status
  summary
  artifacts:
    - issue_report
    - patch_suggestions
    - auto_fix_log
    - learning_signals
  issues:
    - unresolved_root_cause
    - repeated_failure_pattern
  next_step
  confidence_score

handoff_targets:
  - skill_name: engineering-mentor
    when: a falha precisar de explicação ou decisão humana
  - skill_name: core-orchestrator
    when: a rota do fluxo precisar ser refeita
```

### 7.7 engineering-mentor

```yaml
name: engineering-mentor
role: inteligência guiadora
objective: explicar, orientar decisões e recuperar entendimento quando a execução fica ambígua

minimum_inputs:
  - current_context

output_schema:
  status
  summary
  artifacts:
    - explanation
    - decision_options
    - recommended_path
  issues:
    - ambiguity_not_resolved
  next_step
  confidence_score

handoff_targets:
  - skill_name: core-orchestrator
    when: decisão tomada
  - skill_name: app-factory-multiagent
    when: houver direção arquitetural clara
  - skill_name: criador-de-apps
    when: solução rápida for suficiente
```

---

## 8. Regra final

Se uma skill não consegue responder:
- o que faz
- quando ativa
- o que recebe
- o que devolve
- como falha
- para quem passa adiante

então ela ainda não é uma skill confiável.
Ela ainda é só uma instrução solta.
