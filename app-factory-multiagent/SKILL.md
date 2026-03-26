---
name: app-factory-multiagent
description: "Builds complete, production-ready apps using a coordinated multi-agent factory: product-planner, system-architect, backend-builder, web-builder, mobile-builder, integration-finisher, and qa-reviewer in a review loop until PASS. Fixed contracts for web (Next.js), mobile (Expo), backend, auth, and database. No placeholders, no pseudo-code. Triggers: build full app, complete application, auth + database + mobile, robust app, full-stack, monorepo."
---
---

# App Factory Multiagent

## Overview

Reproduce the engineering model of the Anything builder, not just its output style. The core pattern is fixed contracts plus specialized roles: architecture first, then coordinated implementation, then integration review.

This skill is for building real apps with an opinionated factory. It is not for vague brainstorming, tiny one-file tools, or free-form scaffolding.

**Required process:** if the request has not already been designed and approved, use `brainstorming` first. After the design is approved, use `writing-plans` before implementation.

**D.U.M.M.Y. OS EXCEPTION:** When called by `skill4d-core-orchestrator` or when the user's intent is already clear from context, **skip brainstorming and writing-plans** — proceed directly to implementation. The OS already handled intent classification upstream. Minimum friction is the rule.

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

Read these references before implementation:
- `references/system-prompt.md`
- `references/file-contract.md`
- `references/crud-contract.md`
- `references/agent-roles.md`
- `references/review-checklist.md`
- `references/loop-contract.md`
- `references/template-manifest.md`
- `references/template-runtime-contract.md`
- `references/template-starter-contract.md`
- `references/materialization-rules.md`

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
4. If using `embedded-template`, `system-architect` selects approved blocks from `references/template-manifest.md`.
5. `backend-builder`, `web-builder`, and `mobile-builder` implement the first pass in parallel only after the contract is fixed.
6. In `embedded-template` mode, builders may materialize only files covered by the approved blocks plus explicit non-template implementation files.
7. `integration-finisher` resolves naming, route, data, auth, and block-integration mismatches for the current pass.
8. `qa-reviewer` checks the result against `references/review-checklist.md` and emits a pass/fail packet with exact fixes.
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

## Baseline Reminder

Use this skill when fidelity to the Anything builder model matters — opinionated factory, fixed contracts, multi-agent specialization, and review loop until PASS.

---

## Interface CLI (para invocação pelo ConnectPro e core-orchestrator)

App-Factory expõe uma interface JSON padronizada consumível como conector:

```bash
# Interface canônica
app-factory --brief path/to/brief.json --stack "nextjs+expo+supabase" --complexity medium --json

# Saída esperada
{
  "status": "success | partial | failed",
  "repo_path": "/caminho/do/projeto/gerado",
  "structure": ["apps/web", "apps/mobile", "packages/database"],
  "entities": ["users", "task_lists", "tasks"],
  "qa_status": "PASS | FAIL",
  "issues": [],
  "next_step": "preview-bridge",
  "meta": {
    "agents_used": ["product-planner", "system-architect", "backend-builder", "web-builder", "mobile-builder", "integration-finisher", "qa-reviewer"],
    "factory_mode": "contract-only | embedded-template",
    "loop_count": 1
  }
}
```

**Como usar este contrato:**
- O `orchestrator` interno monta o `brief.json` a partir do input do usuário
- O fluxo multi-agente existente executa normalmente
- Ao final, o output é serializado neste formato JSON
- Qualquer skill pode consumir este output sem conhecer os internos da factory

**brief.json mínimo:**
```json
{
  "product_name": "string",
  "description": "string",
  "platforms": ["web", "mobile"],
  "auth": "supabase | none",
  "database": "postgres | sqlite | none",
  "entities": ["entidade1", "entidade2"],
  "complexity": "low | medium | high"
}
```

---

## Contrato (Skill4Dummies SKILL_CONTRACT.md §7.4)

```yaml
name: app-factory-multiagent
role: construção robusta
objective: construir app completo e coordenado com maior rigor usando sistema multi-agente especializado

activation_rules:
  - rule: usuário quer app completo com web, mobile, backend, auth e banco
    priority: high
  - rule: app exige CRUD completo, validação e tratamento de erros em todas as fronteiras
    priority: high
  - rule: fidelidade ao modelo Anything builder é necessária (sem scaffold genérico)
    priority: high
  - rule: uma skill single-agent seria insuficiente para a robustez exigida
    priority: medium

minimum_inputs:
  - name: product_brief
    type: string
    required: true
    description: descrição do produto com plataformas, entidades e fluxos principais

optional_inputs:
  - name: factory_mode
    type: string
    required: false
    description: "contract-only (padrão) ou embedded-template"
  - name: integration_context
    type: object
    required: false
    description: contexto de integrações já resolvidas pelo ConnectPro (env_vars, services)
  - name: design_contract
    type: object
    required: false
    description: contrato de API gerado pelo mock-to-react para cabear o frontend

execution_policy:
  ask_minimum: true
  preserve_context: true
  prefer_partial_delivery: false
  auto_observe_if_possible: true
  call_preview_if_visual: true
  call_surge_if_execution_occurs: true

output_schema:
  status: success | partial | blocked | failed
  summary: string
  artifacts:
    - repo_structure
    - file_contract
    - generated_modules
    - crud_contracts
    - qa_status
  issues:
    - unresolved_dependencies
    - architecture_conflicts
    - quality_gaps
    - failed_review_pass
  next_step: string
  confidence_score: number

failure_policy:
  recoverable: true
  ask_user_only_if_blocked: true
  must_explain_blocker: true
  must_propose_next_action: true

handoff_targets:
  - skill_name: dummy-memory
    when: após completar qualquer módulo ou feature (QA PASS)
    payload: project_name, stack, routes_created, components, auth_type, database_tables, status
  - skill_name: ConnectPro
    when: app exige integração externa ainda não resolvida
    payload: required_services, integration_gaps
  - skill_name: preview-bridge
    when: build gerado e pronto para visualização
    payload: project_path, run_command
  - skill_name: surge-core
    when: execução produzir erros observáveis durante build ou runtime
    payload: build_log, error_signals
  - skill_name: engineering-mentor
    when: decisão arquitetural ambígua bloquear o avanço do fluxo
    payload: architecture_question, current_context

success_criteria:
  - qa-reviewer retornou PASS após loop de revisão
  - todos os módulos (backend, web, mobile) implementados e integrados sem conflitos
  - CRUD completo para cada entidade core definida no product_brief
  - auth e banco configurados e funcionais
  - zero placeholders, pseudo-código ou "rest of code here" no output

observability_signals:
  - signal: contract_fixed
    description: contrato de arquivo e arquitetura definido antes do início do build
  - signal: parallel_build_complete
    description: todos os builders concluíram sua parte da primeira passagem
  - signal: qa_pass
    description: qa-reviewer retornou PASS — entrega liberada
  - signal: qa_fail_loop
    description: qa-reviewer retornou FAIL — iniciando loop de correção
  - signal: architecture_escalated
    description: falha arquitetural detectada — retornando ao system-architect antes de mais código
```
