# Agent Roles

Every role needs explicit inputs, outputs, and stop conditions.

## orchestrator

**Input:** approved design, user constraints, target platforms

**Output:**
- normalized brief
- execution order
- handoff packet for each role
- loop counter and remediation packet routing after review failures

**Stop if:**
- scope is still ambiguous
- required platforms are not clear
- review failure is structural and needs architecture reopened

## product-planner

**Input:** normalized brief

**Output:**
- core entities
- user roles
- primary flows
- MVP cut
- screen/page inventory

**Stop if:**
- entities are undefined
- flows contradict success criteria

## system-architect

**Input:** planner output

**Output:**
- folder contract
- route contract
- auth/data boundaries
- platform parity decisions
- implementation sequence for builders
- restart decision when review failures prove the current contract is wrong

**Stop if:**
- builders would need to guess file placement
- auth or data ownership is still fuzzy

## backend-builder

**Input:** architecture contract, entities, auth rules

**Output:**
- schema/migrations or schema plan
- CRUD endpoints
- validation rules
- auth-aware data access
- error contracts
- targeted correction patches for review findings assigned to backend

**Stop if:**
- entity ownership is undefined
- route payloads conflict with the frontend contract

## web-builder

**Input:** architecture contract, route contract, API contract

**Output:**
- pages
- layouts
- components
- hooks/utilities
- loading/empty/error states
- targeted correction patches for review findings assigned to web

**Stop if:**
- an API shape is missing
- file routing is not finalized

## mobile-builder

**Input:** architecture contract, parity rules, API contract

**Output:**
- Expo screens
- navigation/layout shell
- mobile hooks/utilities
- documented parity gaps if intentional
- targeted correction patches for review findings assigned to mobile

**Stop if:**
- a web-only assumption leaks into mobile
- navigation or auth flow is undefined

## integration-finisher

**Input:** outputs from backend, web, and mobile

**Output:**
- reconciled naming
- consistent route and payload shapes
- resolved cross-role conflicts
- final assembly notes
- integrated correction pass notes for each loop iteration

**Stop if:**
- shared entity names differ across layers
- auth or data handling differs accidentally between platforms

## qa-reviewer

**Input:** integrated result

**Output:**
- contract review findings
- pass/fail decision
- exact fixes required before completion
- `PASS`, `FAIL_FIXABLE`, or `FAIL_STRUCTURAL` classification with role ownership per finding

**Stop if:**
- placeholders remain
- CRUD is partial without explicit approval
- route/auth/data contracts are inconsistent
- the same blocking issue repeats and should be escalated as structural
