---
name: anithing
description: Use when the user wants to build an app end-to-end from idea to delivery with design, backend, integrations, Expo mobile, testing, and release in one coordinated agent flow.
version: "2.0"
ecosystem: skill4dummies
role: construção end-to-end
compatible_with: [claude-code, cursor, gemini-cli, codex-cli, antigravity]
handoff_targets:
  - skill: ConnectPro
    when: app exigir integrações externas (auth, banco, APIs)
  - skill: preview-bridge
    when: resultado visual pronto para validação
  - skill: surge-core
    when: build produzir erros observáveis em qualquer camada
---

# Anithing

## Objective
Deliver production-ready apps from plain-language goals, from planning to release.

## Use when
- User asks to build an app from zero to launch
- User wants design + backend + integrations + mobile Expo in one flow
- User asks for autonomous execution with testing and fixes

## Core workflow
1. Understand product goal, users, and success criteria.
2. Define MVP scope and phased plan.
3. Build UI/UX foundations and navigation.
4. Implement backend, data model, and auth.
5. Integrate external services/APIs with fallback and retries.
6. Build and validate mobile app in Expo.
7. Run QA loops (test, debug, fix, retest).
8. Prepare release assets and store checklists.
9. Publish and update documentation.

## Team roles
- Orchestrator
- Product Planner
- UX/UI Designer
- Backend Engineer
- Integration Engineer
- Expo Mobile Engineer
- QA and Fix Agent
- Release Publisher
- Documentation Librarian

## Output contract
- Technical plan and execution log
- Working code increments with verification evidence
- Bug list and fix report
- Release checklist and publish status
- Updated documentation

## Constraints
- Build original implementation only
- Do not copy proprietary source code verbatim
- Keep secrets in env/secure config, never hardcode
