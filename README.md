# D.U.M.M.Y. OS

**Dynamic. Unified. Multi-agent. Memory-driven. Yield.**

> The operating system that lives inside your AI. — v2.1

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
| **dummy-memory** | *always — boot LOAD + after every action SAVE* | Persists project state, credentials, decisions and fixed errors across sessions. The system never forgets. |
| **ConnectPro** | OAuth, API keys, database, Supabase, Firebase, Stripe | Provisions credentials automatically. MCP → API → dev-browser automation → CLI. Never asks what it can do itself. |
| **mock-to-react** | image, wireframe, screenshot, "turn this into React" | 6-agent system that converts any visual into pixel-perfect React components |
| **app-factory** | "build an app", full-stack, auth + database + mobile | Builds complete applications — Next.js web, Expo mobile, Node/Python backend |
| **preview-bridge** | after any build, "show me running" | Auto-detects framework, resolves port conflicts, opens live preview |
| **surge-core** | *always active* | Monitors everything. Auto-corrects errors. Creates solutions where none exist. |
| **engineering-mentor** | architectural decisions, ambiguity | Senior architect judgment. Non-blocking — runs in parallel. |
| **orchestrator** | hi dummy, multi-skill flow | Kernel. Interprets intent, defines the minimum process sequence, preserves context. |

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

## Browser Automation — dev-browser (new in v2.1)

ConnectPro uses **[dev-browser](https://github.com/SawyerHood/dev-browser)** — a sandboxed Playwright CLI — as its browser automation engine when no MCP is available. It can navigate to Supabase, Stripe, Vercel, Google Cloud and extract API keys automatically, without asking you to copy-paste anything.

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
    env.md        — which credentials were resolved and how
    decisions.md  — architectural decisions and why
    errors.md     — errors fixed (never repeated)
  user/
    preferences.md — language, frameworks, coding style
```

The kernel loads relevant memory at the start of every session automatically.

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
| Claude Code | ✅ Native (skills system + CLAUDE.md) |
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
**M** — Memory-driven *(persistent context — dummy-memory saves everything, forgets nothing)*
**Y** — Yield *(always delivers — never blocks, never gives up)*

---

## Built on

- Claude Code Skills System
- Supabase MCP
- Figma MCP
- [dev-browser](https://github.com/SawyerHood/dev-browser) (browser automation)
- Preview Bridge MCP
- Next.js · Expo · Node.js · Python

---

## License

MIT — free to use, modify, and distribute.

---

## Creator

Built by [@allinerosamkup-ai](https://github.com/allinerosamkup-ai)

---

*D.U.M.M.Y. OS — The operating system that lives inside your AI.*
