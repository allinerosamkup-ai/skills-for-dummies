# D.U.M.M.Y. OS

**Dynamic. Unified. Multi-agent. Memory-driven. Yield.**

> The operating system that lives inside your AI. — v2.2

---

## What is D.U.M.M.Y. OS?

D.U.M.M.Y. OS is an **AI Operating System** — not an app, not a plugin, not a chatbot.

It's a layer that installs inside any AI tool (Claude Code, Cursor, Gemini CLI) and transforms it into a fully orchestrated, self-correcting, memory-persistent system.

You speak your intent. D.U.M.M.Y. figures out the rest.

```
"I want a task manager app with Google login and a database"
         ↓
D.U.M.M.Y. OS
  → ConnectPro sets up Supabase automatically
  → app-factory builds the full app
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
| **app-factory** | "build an app", full-stack, auth + database | Builds complete applications — Next.js web, Expo mobile, Node/Python backend |
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

## Browser Automation — dev-browser

ConnectPro uses **[dev-browser](https://github.com/SawyerHood/dev-browser)** — a sandboxed Playwright CLI — as its browser automation engine when no MCP is available.

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
| Claude Code | ✅ Native (skills system + CLAUDE.md + hooks) |
| Cursor | ✅ Via rules system |
| Windsurf | ✅ Via rules system |
| Gemini CLI | ✅ Via SYSTEM.md |
| Codex CLI | ✅ Via SYSTEM.md |
| Any AI with system prompt | ✅ Load SYSTEM.md |

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
- [dev-browser](https://github.com/SawyerHood/dev-browser) (browser automation)
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
