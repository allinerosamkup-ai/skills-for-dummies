---
name: sentry-core
description: "Use when the user wants production-grade error monitoring and incident visibility (Sentry): SDK install, DSN wiring, release/source maps, and validation. Routes credential/MCP needs to ConnectPro."
---

# Sentry Core — Observabilidade Real (Erro, Performance, Releases)

Objetivo: habilitar Sentry de ponta a ponta (SDK + config + releases) com minimo atrito.

Regra: se faltar credencial/DSN/token, nao pedir lista de passos. Escalar para ConnectPro com `requested_capabilities` e `required_services`.

## Contract Snapshot

```yaml
name: sentry-core
role: observabilidade e monitoramento
objective: instalar/configurar Sentry no projeto alvo e validar que eventos chegam

activation_rules:
  - rule: usuario menciona sentry, monitoring, error tracking, "ver erros em producao", alertas
    priority: high
  - rule: surge-core detectou erro recorrente e recomendou monitoramento
    priority: medium
  - rule: preview-bridge abriu app mas faltam sinais de runtime/erros persistentes
    priority: medium

minimum_inputs:
  - project_path_or_repo_context

optional_inputs:
  - stack_hint
  - environment (dev|staging|prod)
  - org_project_slug

execution_policy:
  ask_minimum: true
  preserve_context: true
  prefer_partial_delivery: true
  never_leak_secrets: true
  call_preview_if_visual: true
  call_surge_if_execution_occurs: true

output_schema:
  status: success | partial | blocked | failed
  summary: o que foi configurado + como validar
  artifacts:
    - config_changes
    - env_requirements
    - verification_steps
  issues:
    - missing_credentials
    - unsupported_stack
    - build_failure
  next_step: preview-bridge | surge-core | ConnectPro | user
  confidence_score: 0.0-1.0

handoff_targets:
  - skill_name: ConnectPro
    when: faltam DSN/auth token, precisa criar projeto Sentry, ou precisa browser_automation/login
    payload: required_services, requested_capabilities, blocking_issues
  - skill_name: preview-bridge
    when: Sentry configurado e precisa validar no runtime
    payload: project_path, verification_action
  - skill_name: surge-core
    when: build/runtime quebra apos instalar Sentry
    payload: logs, error_symptom

success_criteria:
  - SDK instalado e inicializacao presente no ponto correto do stack
  - DSN/keys injetados via env sem vazamento
  - evento de teste confirmado (captured exception) ou instrucao de validacao objetiva

observability_signals:
  - signal: sentry_installed
    description: dependencia instalada e import/init adicionados
  - signal: sentry_dsn_wired
    description: DSN presente via env/config
  - signal: sentry_event_verified
    description: evidencia de envio/recebimento do evento
```

## Fluxo Obrigatorio

1. Detectar stack (Next.js/React/Node/Express/Python/etc) e ponto de entrada.
2. Garantir credenciais:
   - se nao houver `SENTRY_DSN`/token: handoff para ConnectPro (`required_services: ["sentry"]`, `requested_capabilities: ["browser_automation", "web_search"]`).
3. Instalar SDK apropriado e adicionar init.
4. Configurar `environment`, `release` e (quando aplicavel) source maps.
5. Validar:
   - abrir preview e disparar um erro controlado (somente em dev) OU registrar passo de verificacao no proprio app.

## Notas de Autonomia

- Nunca salvar DSN/tokens em memoria.
- Se o usuario nao tiver conta/projeto Sentry, ConnectPro pode criar (com confirmacao se houver custo).

