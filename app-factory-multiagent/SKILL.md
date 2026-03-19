---
name: app-factory-multiagent
description: Use when a user wants to build a full application with a coordinated multi-agent factory that preserves a fixed web, mobile, backend, auth, and database contract instead of a generic one-agent scaffold.
---

# App Factory Multiagent

## Overview

Reproduce the engineering model of the Anything builder, not just its output style. The core pattern is fixed contracts plus specialized roles: architecture first, then coordinated implementation, then integration review.

This skill is for building real apps with an opinionated factory. It is not for vague brainstorming, tiny one-file tools, or free-form scaffolding.

**Required process:** if the request has not already been designed and approved, use `brainstorming` first. After the design is approved, write an explicit implementation plan before implementation.

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

## CLAUDE.md Hierárquico (Padrão Obrigatório de Monorepo)

O `system-architect` **deve** criar CLAUDE.md hierárquicos como parte do file contract. Sem isso, agentes paralelos tomam decisões inconsistentes entre si.

### Estrutura obrigatória
```
project/
  CLAUDE.md              ← regras universais (stack, como rodar, decisões travadas)
  apps/
    web/
      CLAUDE.md          ← frontend: telas, stores, design tokens, padrão de componente
    backend/
      CLAUDE.md          ← endpoints, auth middleware, validação (Zod), SSE format
    mobile/
      CLAUDE.md          ← screens, navigation, parity decisions vs web
  packages/
    database/
      CLAUDE.md          ← schema, migration workflow, RLS obrigatório, soft-delete
```

### Responsabilidade por papel
| Papel | CLAUDE.md |
|-------|---------|
| `system-architect` | **Cria todos os CLAUDE.md antes dos builders iniciarem** |
| `backend-builder` | Lê `apps/backend/CLAUDE.md`; atualiza se adicionar novo padrão |
| `web-builder` | Lê `apps/web/CLAUDE.md`; atualiza lista de telas ao criar novas |
| `mobile-builder` | Lê `apps/mobile/CLAUDE.md`; registra parity decisions |
| `qa-reviewer` | Verifica que todos os CLAUDE.md estão atualizados e consistentes com o código |

Para paralelismo real use `superpowers:using-git-worktrees` — `system-architect` cria os CLAUDE.md antes, builders trabalham em worktrees isolados, `integration-finisher` faz merge ao fim.

---

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

---

## Agent Coordination Protocol

This factory runs multiple builder roles in parallel. Use this protocol to prevent file conflicts between builders and to enable awareness of external tools (Cursor, Codex) that may be active on the same project.

### Coordination Files

All state lives at `~/.claude/agent-state/`. Create this directory if it does not exist.

```
~/.claude/agent-state/
  agents.json   ← active agent registry
  locks.json    ← file/module locks
  inbox.json    ← messages between agents
```

### orchestrator — Session Init

At the start of every factory run:

1. Create `~/.claude/agent-state/` if missing.
2. Register the orchestrator in `agents.json` with `"tool": "claude-code"`, `"role": "orchestrator"`, project path, and timestamp.
3. Read `locks.json` — warn the user if any file in the project's scope is locked by an external tool (Cursor, Codex).
4. Read `inbox.json` — surface any unread messages from agents on the same project.
5. After builder roles are assigned, register each one in `agents.json` with their role name.

### backend-builder / web-builder / mobile-builder — Per-File Protocol

Before writing any file:
1. Check `locks.json` — if locked by another builder, wait for the lock to be released or warn the orchestrator.
2. Acquire lock: add entry with your role as owner, 15-minute expiry:
   ```json
   { "path": "<relative file path>", "owner": "<role>", "since": "<ISO timestamp>", "expires": "<ISO timestamp + 15min>" }
   ```
3. Send inbox message: `"subject": "lock-acquired"`, naming the file and role.

After writing each file:
- Release lock: remove your entry from `locks.json`.
- Send inbox message: `"subject": "file-done"`, naming the file.

### integration-finisher — Pre-Merge Check

Before merging builder outputs:
1. Read `locks.json` — check for orphaned locks (expired or from builders that have finished). Remove stale entries.
2. Read `inbox.json` — confirm all builders sent `"file-done"` messages for their assigned files.
3. If any lock is still active and unexpired from an active builder, wait before merging that file.

### qa-reviewer — Coordination Audit

Add to the review checklist:
- [ ] `agents.json` has been cleaned up (no stale entries from this session)
- [ ] `locks.json` has no orphaned locks from this session
- [ ] `inbox.json` contains a complete message trail for the session

### orchestrator — Session End

1. Remove all role entries from `agents.json`.
2. Release any remaining locks in `locks.json`.
3. Write final inbox message: `"subject": "factory-done"`, `"body": "All builders complete for <project>"`.

### Lock Expiry Rule

Any lock with `"expires"` in the past is stale. Remove stale locks before acquiring new ones for the same file.

### For Cursor / Codex Users

To make Cursor or Codex participate in this coordination, add the following to their system prompt or rules file:

> Before editing any file in this project, read `~/.claude/agent-state/locks.json`. If the file is locked, warn the user. When starting to edit, add an entry to `locks.json` with your tool name and a 15-minute expiry. When done, remove your entry. Register yourself in `agents.json` at session start and remove yourself at session end. Check `inbox.json` for messages from other agents on the same project.
