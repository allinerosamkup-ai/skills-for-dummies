# D.U.M.M.Y. OS

**Dynamic. Unified. Multi-agent. Memory-driven. Yield.**

> The operating system that lives inside your AI. — v2.2

---

## What is D.U.M.M.Y. OS?

D.U.M.M.Y. OS is an **AI Operating System** — not an app, not a plugin, not a chatbot.

It's an operating-system layer for AI tools. The CLI installs it directly into Claude Code, Cursor, and Windsurf; other tools can load [`SYSTEM.md`](./SYSTEM.md) manually and use the same orchestration model.

You speak your intent. D.U.M.M.Y. figures out the rest.

```
"I want a task manager app with Google login and a database"
         ↓
D.U.M.M.Y. OS
  → ConnectPro sets up Supabase automatically
  → app-factory-multiagent builds the full app
  → preview-bridge opens it running in your browser
  → surge-core fixes any error before you notice it
         ↓
Working app. One prompt.
```

---

## Why it's different

| Every other AI tool | D.U.M.M.Y. OS |
|---------------------|--------------|
| You configure it | It configures itself |
| One capability at a time | 8 coordinated processes |
| Forgets between sessions | Persistent memory |
| You debug the errors | It fixes errors automatically |
| Runs outside the AI | Lives *inside* the AI |
| Needs infrastructure | Zero setup — pure Markdown |

---

## The 8 Processes

```
┌─────────────────────────────────────────────────────┐
│  D.U.M.M.Y. KERNEL — skill4d-core-orchestrator     │
│  Routes any intent to the right process             │
└──┬──────────┬──────────┬──────────┬─────────────────┘
   │          │          │          │
┌──▼──┐  ┌───▼───┐  ┌───▼───┐  ┌──▼──────────┐
│CONN │  │MOCK   │  │APP    │  │ENGINEERING  │
│PRO  │  │TO     │  │FACTORY│  │MENTOR       │
│     │  │REACT  │  │       │  │             │
└──┬──┘  └───┬───┘  └───┬───┘  └─────────────┘
   │          │          │
┌──▼──────────▼──────────▼────────────────────┐
│            PREVIEW-BRIDGE                   │
└────────────────────────┬────────────────────┘
                         │
┌────────────────────────▼────────────────────┐
│   SURGE-CORE — always on, never sleeps      │
│   self-corrects · creates paths · monitors  │
└─────────────────────────────────────────────┘
```

| Process | Trigger | What it does |
|---------|---------|-------------|
| **dummy-memory** | always — boot LOAD + after every action SAVE | Persists project state, credentials, decisions and fixed errors across sessions. |
| **ConnectPro** | OAuth, API keys, database, Supabase, Stripe | Provisions credentials automatically via MCP → API → browser automation → CLI. Email loop captures verification emails automatically. |
| **mock-to-react** | image, wireframe, screenshot | 6-agent system that converts any visual into pixel-perfect React components |
| **app-factory-multiagent** | "build an app", full-stack, auth + database | Builds complete applications — Next.js web, Expo mobile, Node/Python backend |
| **preview-bridge** | after any build | Auto-detects framework, resolves port conflicts, opens live preview |
| **surge-core** | always active | Monitors everything. Auto-corrects errors within defined autonomy limits. |
| **engineering-mentor** | architectural decisions, undefined projects | Senior architect judgment. Generates PRD + SPEC before building. Non-blocking. |
| **orchestrator** | hi dummy, multi-skill flow | Kernel. Interprets intent, routes to right process, preserves context. |

---

## Install

```bash
npx dummy-os install
```

Detects Claude Code, Cursor, or Windsurf and installs all 8 processes automatically.

For Gemini CLI, Codex CLI, and other tools with a system prompt, load [`SYSTEM.md`](./SYSTEM.md) manually.

Boot the OS in any session:

```
hi dummy
```

The OS loads your project memory and waits for your next intent.

---

## Diagnose your installation

```bash
npx dummy-os doctor
```

Checks Node version, detected AI tools, installed skills, CLAUDE.md boot trigger, dev-browser (optional), and project memory — with exact fix instructions for any issue found.

---

## Repository Layout

This repository currently contains both the authoring source and distribution-oriented copies.

- Root skill folders are the current source of truth used by the installer.
- [`skill-for-dummies/`](./skill-for-dummies) is a packaged snapshot tree and should be treated as distribution content, not the canonical authoring location.
- [`sistea/`](./sistea) contains archived or extracted material kept for reference, not for primary loading by agents.
- [`cli/`](./cli) contains the installer and local diagnostics for supported tools.

---

## Platform Installation

D.U.M.M.Y. OS runs on every major AI tool. Install once, works everywhere.

| Platform | How to install |
|----------|---------------|
| **Claude Code** | `npx dummy-os install` — automatic |
| **Cursor** | `npx dummy-os install --tool cursor` |
| **Windsurf** | `npx dummy-os install --tool windsurf` |
| **claude.ai (Anthropic web)** | Create a **Project** → paste `SYSTEM.md` content into Project Instructions |
| **Codex CLI** | Add `SYSTEM.md` content to `AGENTS.md` in project root |
| **OpenCode** | Add `SYSTEM.md` content to `AGENTS.md` |
| **Antigravity** | Add `SYSTEM.md` content to system instructions |
| **ChatGPT / Gemini / other** | Paste `SYSTEM.md` as system prompt |

After installing, boot the OS in any session:
```
hi dummy
```

The OS loads your project memory and waits for your intent — no configuration needed.

---

## What's new in v2.4

### Visual feedback protocol — all skills
Every skill now reports execution with visible borders:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 D.U.M.M.Y. OS  ▸  mock-to-react
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ▶ Step 1/9  Visual analysis...
 ✓ Step 1/9  Header + 3 cards + nav detected
 ✓ DONE  98% similarity ▸ passing to preview-bridge
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Multiplataform — SYSTEM.md standalone
SYSTEM.md now contains all OS laws (status line, feedback, one-shot) and platform-specific installation instructions. Works as a drop-in system prompt for any AI — not just Claude Code.

### mock-to-react — MODO SCAN (autonomous project analysis)
Point mock-to-react at a whole project and it autonomously:
1. Scans all pages/screens
2. Identifies UI type per screen
3. Matches each to awesome-design-md references
4. Presents a pre-defined suggestions menu
5. Executes approved clones

### GSD patterns absorbed
- `modo yolo` — zero confirmations, max one-shot
- `/next` — auto-detect current workflow phase and advance
- XML plan format in `/plan` — with verification criteria
- `profile-user` in dummy-memory — personalized responses

### Agent SDK — Tier 2 skeleton
`dummy-os-saas` now exposes `POST /api/agent/run` — a programmatic agent endpoint that runs the D.U.M.M.Y. OS orchestration loop via Anthropic SDK. Platform-agnostic, works in any Node.js environment.

---

## What's new in v2.3

### Fase 0 — Prompt Optimizer (universal)
Every input you send — no trigger word, no exception — is automatically refined into a structured prompt before reaching any skill. Natural language, typos, fragments: all converted to `[Objective + Context + Constraints + Expected Output]` internally. You see only the result. Every skill downstream gets a better input.

### Anti-Vibe Coding — Structured Development Methodology
engineering-mentor now enforces a 4-phase methodology that prevents improvised, duplicated, or context-losing code:

| Command | What it does |
|---------|-------------|
| `/spec` | Generates `spec.md` — pages, components inventory, behavior dictionary. Waits for approval. |
| `/break` | Decomposes spec into atomic issues (1 page = 1 issue, 1 behavior = 1 issue). Saves to `.dummy/issues/`. Phase 1 = visual prototype, Phase 2 = logic. |
| `/plan` | Per-issue plan: greps existing codebase for reuse, lists exact files to touch. Files not on the list are off-limits during execute. |
| `/execute` | Implements: thin client/fat server + modularization by behavior. Consults `/references/architecture.md` when available. |

### Global Observability — Feedback Protocol
Every skill now reports its execution in real time:
```
[skill-name] starting — {mission}
[skill-name] step N/total: {what it's doing} ⚙️
[skill-name] step N/total: ✓ {result}
[skill-name] ✓ done — {delivery}
```
You always see what's running, what passed, and what escalated.

### dummy-memory — MODO DREAM
Automatic memory consolidation that runs in the background. Prevents memory rot: detects contradictory entries, outdated decisions, and duplicate notes. Trims each memory file to a readable maximum. Triggered automatically after 5+ sessions or manually with `dummy dream`.

---

## What's new in v2.2

### Session persistence — hook system
The OS now uses a `UserPromptSubmit` hook that injects a kernel signal into **every message**. The OS can no longer drift or fall back to default AI behavior mid-session. Once active, it stays active.

### ConnectPro — 3-file architecture
ConnectPro is now split into:
- `SKILL.md` — pure policy and decision tree
- `CONNECTORS.md` — per-service playbooks (Supabase, Stripe, Google, Vercel, GitHub, n8n)
- `BROWSER_AUTO.md` — Playwright scripts per service + Email Loop

### Email Loop
When a service sends a verification email (Stripe, Supabase, Google, GitHub), ConnectPro automatically reads it via Gmail MCP, extracts the code or link, and completes the verification — without asking you to open your inbox.

### AUTONOMY_POLICY
ConnectPro now has 3 explicit autonomy levels:
- **Silent**: read data, detect services, extract keys from logged-in dashboards
- **Confirm first**: create projects that generate cost, issue permanent tokens
- **Never**: delete existing resources, revoke credentials

### Workflow Engine (Tipo G)
The orchestrator now routes automation requests:
- Internal automations → `scheduled-tasks` MCP (cron jobs)
- External workflows (between services) → `n8n` MCP
- "Every time X, do Y" → handled without creating new skills

### Formal specs
- `surge-core/SURGE_CORE_SPEC.md` — explicit autonomy limits, code auditor, decision tree
- `dummy-memory/SPEC.md` — formal read/write contract, TTL, conflict policy, secret protection

### Security
- `.dummy/memory/` is now in `.gitignore` — credentials referenced in `env.md` can never accidentally reach a git repository.

### Token optimization
Skill files cut by ~50%: orchestrator 321→161 lines, dummy-memory 272→139 lines. Fewer tokens consumed per session without losing any functionality.

---

## Ecosystem

D.U.M.M.Y. OS integrates with two companion repositories:

| Repo | Role | Used by |
|------|------|---------|
| **[awesome-design-md](https://github.com/allinerosamkup-ai/awesome-design-md)** | 55 DESIGN.md files from real companies (Vercel, Stripe, Notion, Apple, etc.) with full color palettes, typography, and component patterns | mock-to-react CREATIVE MODE — referenced automatically when a design style is named |
| **[oh-my-codex](https://github.com/allinerosamkup-ai/oh-my-codex)** | Workflow layer for Codex CLI — source of `$deep-interview` (Socratic spec questioning) and `$tdd` patterns adopted by engineering-mentor | engineering-mentor `/spec` + test-driven mode |

---

## Browser Automation — dev-browser

ConnectPro now uses an internal browser engine first (`connectpro-browser`) and keeps **[dev-browser](https://github.com/SawyerHood/dev-browser)** as optional fallback when needed.

```bash
# Optional but recommended for full ConnectPro capability
npm install -g dev-browser && dev-browser install
```

---

## Memory System

D.U.M.M.Y. OS remembers between sessions:

```
.dummy/memory/
  projects/{name}/
    state.md      — what was built, which routes/components exist
    env.md        — which credentials were resolved (never the values)
    decisions.md  — architectural decisions and autonomy actions
    errors.md     — errors fixed (never repeated)
  user/
    preferences.md — language, frameworks, coding style
  global/
    errors.md     — reusable error patterns across projects
    patterns.md   — reusable successful execution patterns
    execution-log.md — recent skill observability log
    dream-log.md  — memory consolidation history
```

The kernel loads relevant memory at the start of every session automatically.
`.dummy/memory/` is protected by `.gitignore` — credentials never reach git.

```bash
dummy init         # initialize memory for current project
dummy status       # show installed skills + project memory
dummy memory load  # display what the OS knows about your project
dummy memory clear # reset project memory
```

---

## CLI Reference

```bash
npx dummy-os install              # auto-detect and install
npx dummy-os install --force      # force update all skills
npx dummy-os update               # update to latest version
npx dummy-os status               # show installed skills + memory
npx dummy-os doctor               # diagnose installation health
npx dummy-os init                 # init memory for current project
npx dummy-os memory load          # display project memory
npx dummy-os memory clear         # clear project memory
npx dummy-os uninstall            # remove all skills
```

---

## Compatibility

| AI Tool | Status |
|---------|--------|
| Claude Code | ✅ CLI install + native skills/hook flow |
| Cursor | ✅ CLI install via rules system |
| Windsurf | ✅ CLI install via rules system |
| Gemini CLI | ✅ Manual via [`SYSTEM.md`](./SYSTEM.md) |
| Codex CLI | ✅ Manual via [`SYSTEM.md`](./SYSTEM.md) |
| Any AI with system prompt | ✅ Manual via [`SYSTEM.md`](./SYSTEM.md) |

Current auto-detection in the CLI targets Claude Code, Cursor, and Windsurf only.

---

## Core Principle

```
Every extra prompt the user has to give
is a bug in the system, not an expected limitation.
```

D.U.M.M.Y. OS is designed for **one-shot delivery**.
One intent → working result.

---

## The Name

**D** — Dynamic *(adapts to any intent, context, or tool)*
**U** — Unified *(single entry point for everything)*
**M** — Multi-agent *(8 coordinated processes)*
**M** — Memory-driven *(persistent context — forgets nothing)*
**Y** — Yield *(always delivers — never blocks, never gives up)*

---

## Built on

- Claude Code Skills System + Hook System
- Supabase MCP · Gmail MCP · n8n MCP · Figma MCP
- ConnectPro internal browser engine (`connectpro-browser`) + optional [dev-browser](https://github.com/SawyerHood/dev-browser) fallback
- Preview Bridge MCP · scheduled-tasks MCP
- Next.js · Expo · Node.js · Python

---

## License

MIT — free to use, modify, and distribute.

---

## Creator

Built by [@allinerosamkup-ai](https://github.com/allinerosamkup-ai)

---

*D.U.M.M.Y. OS — The operating system that lives inside your AI.*
