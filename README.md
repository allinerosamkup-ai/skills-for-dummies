# D.U.M.M.Y.

**Dynamic. Unified. Multi-agent. Memory-driven. Yield.**

> The operating system that lives inside your AI.

---

## What is D.U.M.M.Y.?

D.U.M.M.Y. is an **AI Operating System** — not an app, not a plugin, not a chatbot.

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

| Every other AI tool | D.U.M.M.Y. |
|---------------------|------------|
| You configure it | It configures itself |
| One capability at a time | 7 coordinated processes |
| Forgets between sessions | Persistent memory |
| You debug the errors | It fixes errors automatically |
| Runs outside the AI | Lives *inside* the AI |
| Needs infrastructure | Zero setup — pure Markdown |

---

## The 7 Processes

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
| **dummy-memory** | *always — boot LOAD + after every action SAVE* | Persists project state, resolved credentials, architectural decisions, and fixed errors across sessions. The system never forgets. |
| **ConnectPro** | OAuth, API keys, database, Supabase, Firebase | Provisions credentials automatically. MCP-first. Never asks what it can do itself. |
| **mock-to-react** | image, wireframe, screenshot, "turn this into React" | 6-agent system that converts any visual into pixel-perfect React components |
| **app-factory** | "build an app", full-stack, auth + database + mobile | Builds complete applications — Next.js web, Expo mobile, Node/Python backend |
| **preview-bridge** | after any build, "show me running" | Auto-detects framework, resolves port conflicts, opens live preview |
| **surge-core** | *always active* | Monitors everything. Auto-corrects errors. Creates solutions where none exist. |
| **engineering-mentor** | architectural decisions, ambiguity | Senior architect judgment. Non-blocking — runs in parallel. |
| **criador-de-apps** | "fast", "quick MVP", prototype | Delivers the minimum viable result in minimum time |

---

## Install in 2 minutes

### Claude Code
```bash
# 1. Clone the repo
git clone https://github.com/allinerosamkup-ai/skills-for-dummies
cd skills-for-dummies

# 2. Copy skills to your Claude Code skills folder
# Windows:
xcopy /E /I . "%USERPROFILE%\.claude\skills\dummy-os"
# macOS/Linux:
cp -r . ~/.claude/skills/dummy-os

# 3. Done. Start a new Claude Code session and say:
# "Load DUMMY OS"
```

### Cursor / Any AI with system prompt
```
1. Open SYSTEM.md from this repository
2. Copy its contents
3. Paste into your AI's system prompt
4. Done
```

### Test it immediately
```
"Create a notes app with email authentication and a Supabase database"
```
Watch D.U.M.M.Y. handle everything — credentials, code, preview, error correction.

---

## Core Principle

```
Every extra prompt the user has to give
is a bug in the system, not an expected limitation.
```

D.U.M.M.Y. is designed for **one-shot delivery**.
One intent → working result.

---

## Compatibility

| AI Tool | Status |
|---------|--------|
| Claude Code | ✅ Native (skills system) |
| Cursor | ✅ Via system prompt / rules |
| Gemini CLI | ✅ Via system prompt |
| Codex CLI | ✅ Via system prompt |
| Any AI with system prompt | ✅ Load SYSTEM.md |

---

## Memory System

D.U.M.M.Y. remembers between sessions:

```
.claude/memory/
  user_*.md      — your preferences and profile
  project_*.md   — ongoing project context
  feedback_*.md  — what worked and what didn't
  reference_*.md — where to find external resources
```

The kernel loads relevant memory at the start of every session automatically.

---

## The Name

**D** — Dynamic *(adapts to any intent, context, or tool)*
**U** — Unified *(single entry point for everything)*
**M** — Multi-agent *(8 coordinated processes)*
**M** — Memory-driven *(persistent context across sessions — dummy-memory saves everything, forgets nothing)*
**Y** — Yield *(always delivers — never blocks, never gives up)*

---

## Built on

- Claude Code Skills System
- Supabase MCP
- Figma MCP
- Claude in Chrome (browser automation)
- Preview Bridge MCP
- Next.js · Expo · Node.js · Python

---

## License

MIT — free to use, modify, and distribute.

---

## Creator

Built by [@allinerosamkup-ai](https://github.com/allinerosamkup-ai)

---

*D.U.M.M.Y. — The operating system that lives inside your AI.*
