---
name: app-factory-multiagent
description: "Use when a user needs a full application built with a coordinated multi-agent factory that enforces fixed contracts for web, mobile, backend, auth, and database instead of a loose single-agent scaffold."
---

# App Factory Multiagent

## Overview

Reproduce the engineering model of the Anything builder, not just its output style. The core pattern is fixed contracts plus specialized roles: architecture first, then coordinated implementation, then integration review.

This skill is for building real apps with an opinionated factory. It is not for vague brainstorming, tiny one-file tools, or free-form scaffolding.

**Required process:** if the request has not already been designed and approved, use `brainstorming` first. After the design is approved, use `writing-plans` before implementation.

**D.U.M.M.Y. OS EXCEPTION:** When called by `skill4d-core-orchestrator` or when the user's intent is already clear from context, **skip brainstorming and writing-plans** — proceed directly to implementation. The OS already handled intent classification upstream. Minimum friction is the rule.

## Contract Snapshot

```yaml
name: app-factory-multiagent
role: construção robusta
objective: construir app completo, integrado e revisado em loop até PASS com contratos fixos

activation_rules:
  - rule: pedido exige web + backend + auth + banco, com ou sem mobile
    priority: high
  - rule: scaffold genérico de um agente não atende rigor de entrega
    priority: high
  - rule: usuário quer fidelidade ao modelo Anything-style factory
    priority: medium

minimum_inputs:
  - product_brief

optional_inputs:
  - factory_mode
  - integration_context
  - design_contract

execution_policy:
  ask_minimum: true
  preserve_context: true
  prefer_partial_delivery: false
  architecture_before_build: true
  review_loop_until_pass_or_escalation: true
  no_placeholders_or_pseudocode: true

output_schema:
  status: success | partial | blocked | failed
  summary: stack + escopo entregue + status de QA
  artifacts: repo_structure, file_contract, generated_modules, crud_contracts, qa_status
  issues: unresolved_dependencies, architecture_conflicts, quality_gaps, failed_review_pass
  next_step: preview-bridge | surge-core | ConnectPro | engineering-mentor | user
  confidence_score: 0.0-1.0

handoff_targets:
  - skill_name: preview-bridge
    when: build gerado e pronto para validação visual
  - skill_name: surge-core
    when: execução produzir erro observável no build/runtime
  - skill_name: ConnectPro
    when: integração externa bloquear progresso
  - skill_name: engineering-mentor
    when: decisão arquitetural ambígua impedir continuidade
```

## When to Use

- The user wants a complete app, not a loose prototype.
- The app should follow an Anything-style structure with `apps/web` and `apps/mobile`.
- The work needs explicit backend, auth, database, and CRUD discipline.
- The user may want an optional built-in starter shell instead of starting from contracts alone.
- A single-agent "just scaffold it" workflow would be too weak.

Do not use this skill for:
- one-off scripts
- docs-only tasks
- isolated bugfixes inside an existing unrelated app

## Factory Rules

- Explain the architecture before generating code.
- Never output placeholders, pseudo-code, or "rest of code here".
- For each core entity, require complete CRUD unless the design explicitly excludes it.
- Validate inputs and handle errors on every boundary.
- Do not invent packages, helpers, or platform APIs.
- Preserve a predictable file contract so agents integrate cleanly.
- Treat template materialization as explicit architecture, not ad hoc scaffolding.
- Finish with a contract review, not a vibes review.
- Run an explicit implementation-review-correction loop until the reviewer passes the result or the loop escalates.

Contratos internos aplicados antes da implementação:
- **system-prompt:** prompt do orquestrador principal — normalizar brief, plataformas e critérios de sucesso
- **file-contract:** estrutura de pastas do monorepo — `apps/web`, `apps/mobile`, `packages/shared`, `packages/db`
- **crud-contract:** para cada entidade core, gerar Create/Read/Update/Delete completo salvo exclusão explícita no design
- **agent-roles:** papéis fixos (orchestrator, product-planner, system-architect, backend-builder, web-builder, mobile-builder, integration-finisher, qa-reviewer) — ver tabela "Roles At A Glance" abaixo
- **review-checklist:** verificar contratos de arquivo, ausência de placeholders, CRUD completo, validação de inputs, consistência de nomes entre camadas
- **loop-contract:** loop revisão-correção continua até qa-reviewer emitir PASS ou loop escalonar explicitamente
- **template-manifest:** blocos de template disponíveis no modo `embedded-template` — selecionados pelo system-architect na etapa de arquitetura
- **template-runtime-contract:** regras de materialização de blocos em tempo de execução
- **template-starter-contract:** estrutura base do starter shell quando `embedded-template` está ativo
- **materialization-rules:** arquivos estruturais só podem vir de blocos aprovados do manifest ou serem marcados explicitamente como não-template

## Factory Modes

### `contract-only` (default)

Use the factory contracts and role model without materializing any embedded starter blocks.

Use this when:
- the user wants flexibility over bootstrap speed
- the project already has a codebase
- the shell should be designed from scratch

### `embedded-template` (optional)

Use the factory contracts plus embedded template blocks selected from the internal manifest.

Use this when the user asks for:
- a base pronta
- bootstrap completo
- clone fiel do builder
- estrutura inicial toda montada

In this mode, the `system-architect` must choose template blocks before builders write files.

## Workflow

1. `orchestrator` normalizes the brief, success criteria, and required platforms.
2. `product-planner` defines entities, flows, pages, screens, and integrations.
3. `system-architect` fixes the monorepo/file contract, shared technical decisions, and factory mode.
4. If using `embedded-template`, `system-architect` selects approved blocks from the template manifest (ver contratos internos acima).
5. `backend-builder`, `web-builder`, and `mobile-builder` implement the first pass in parallel only after the contract is fixed.
6. In `embedded-template` mode, builders may materialize only files covered by the approved blocks plus explicit non-template implementation files.
7. `integration-finisher` resolves naming, route, data, auth, and block-integration mismatches for the current pass.
8. `qa-reviewer` checks the result against the review-checklist (ver contratos internos acima) and emits a pass/fail packet with exact fixes.
9. If the review fails but the architecture still stands, `orchestrator` starts another loop by routing the fix packet back to the relevant builders and then through `integration-finisher` and `qa-reviewer` again.
10. If the review fails because the architecture, manifest choice, or shared contracts are wrong, stop the implementation loop and reopen `system-architect` before more code is written.
11. Completion is allowed only when `qa-reviewer` returns PASS or the loop exits with an explicit blocked/escalated status.

If a role cannot satisfy its contract, stop and resolve the contract issue before writing more code.
If a required shell file is needed in `embedded-template` mode but no manifest block covers it, stop and add a block or downgrade that file to explicit non-template implementation.
Do not allow "first pass is good enough" rationalization. The review loop is part of implementation, not an optional polish step.

## Roles At A Glance

| Role | Owns | Must Not Do |
|---|---|---|
| `orchestrator` | sequence, handoffs, scope control | invent implementation details alone |
| `product-planner` | user flows, entities, feature cuts | choose ad hoc file structure |
| `system-architect` | folder contract, shared rules, boundaries, mode and block selection | skip concrete file decisions |
| `backend-builder` | schema, auth, SQL, APIs, validation | design UI |
| `web-builder` | pages, layouts, components, hooks | change backend contracts silently |
| `mobile-builder` | screens, navigation, parity decisions | diverge from shared domain model silently |
| `integration-finisher` | consistency and assembly | add unrelated features |
| `qa-reviewer` | contract compliance | approve based on aesthetics alone |

## Common Mistakes

| Mistake | Correction |
|---|---|
| "One agent can just do everything" | Split planning, architecture, implementation, and review by role. |
| "We can improvise the folder structure later" | Fix the file contract before builders start. |
| "Only create the endpoints the user mentioned" | Use the CRUD contract for each core entity unless the design explicitly narrows scope. |
| "The mobile app can be handled after web is done" | Decide parity and intentional differences up front. |
| "We can copy a starter shell whenever convenient" | Template block selection happens at architecture time, not later. |
| "Builders can invent missing shell files as they go" | In `embedded-template` mode, structural files must come from approved manifest blocks or be explicitly marked non-template. |
| "Review means quick polish" | Review means contract verification. |
| "One review pass is enough" | Loop through fix packets until PASS or explicit escalation. |

## Formato de Reporte

```
[app-factory] iniciando — {stack + escopo recebido}
[app-factory] passo {N}/11: {papel ativo} — {o que está fazendo} ⚙️
[app-factory] passo {N}/11: ✓ {resultado}
[app-factory] review loop {N}: {pass/fail — razão}
[app-factory] ✓ concluído — build passou QA | entregando para preview-bridge
[app-factory] ✗ bloqueado em passo {N} — {motivo} → escalando para {skill}
```

---

## Baseline Reminder

Use this skill when fidelity to the Anything builder model matters — opinionated factory, fixed contracts, multi-agent specialization, and review loop until PASS.

---

## Interface CLI Esperada (opcional para conectores)

Se o ambiente expuser um wrapper CLI para esta skill, o contrato recomendado pode ser:

```bash
app-factory --brief path/to/brief.json --stack "nextjs+expo+supabase" --complexity medium --json
```

Essa interface é opcional e não deve ser tratada como pré-requisito da skill.

---

## Nota de Alinhamento com o Skill Contract

O bloco `Contract Snapshot` acima é a fonte principal desta skill. O ecossistema deve manter:

- arquitetura e contrato de arquivos definidos antes do build
- implementação paralela por builders especializados
- loop de revisão-correção até PASS ou escalonamento explícito
- handoffs claros para `preview-bridge`, `surge-core`, `ConnectPro` e `engineering-mentor`
