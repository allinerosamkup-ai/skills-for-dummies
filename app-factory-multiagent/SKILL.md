---
name: app-factory-multiagent
description: Use when a user wants to build a full application with a coordinated multi-agent factory that preserves a fixed web, mobile, backend, auth, and database contract instead of a generic one-agent scaffold.
version: "2.0"
ecosystem: skill4dummies
role: construção robusta
compatible_with: [claude-code, cursor, gemini-cli, codex-cli, antigravity]
handoff_targets:
  - skill: ConnectPro
    when: app exige integração externa (OAuth, banco, API key)
  - skill: preview-bridge
    when: build gerado e pronto para visualização
  - skill: surge-core
    when: build produzir erros observáveis
---

# App Factory Multiagent

## Overview

Reproduce the engineering model of the Anything builder, not just its output style. The core pattern is fixed contracts plus specialized roles: architecture first, then coordinated implementation, then integration review.

This skill is for building real apps with an opinionated factory. It is not for vague brainstorming, tiny one-file tools, or free-form scaffolding.

**Required process:** if the request has not already been designed and approved, use `brainstorming` first. After the design is approved, use `writing-plans` before implementation.

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

The old `criador-de-apps` skill is not enough for this use case. It is generic, single-agent, and does not preserve the runtime, template, prompt, or review discipline of the Anything builder. Use this skill when fidelity to that model matters.
