# dummyos-plugin

Plugin server for D.U.M.M.Y. OS (kept off `master`).

## Install global (Windows)

```powershell
npm install -g C:\Users\allin\Downloads\skills-for-dummies-wt-commit\dummyos-plugin
```

## Run (stdio)

```powershell
dummyos-plugin start --project "C:\\path\\to\\your-app"
```

## List tools

```powershell
dummyos-plugin tools
```

## Call tool directly

```powershell
dummyos-plugin call dummyos.sentry.detect "{\"projectPath\":\".\"}"
```

Tools currently provided:
- `dummyos.ready`
- `dummyos.connect`
- `dummyos.project.detect`
- `dummyos.memory.checkpoint`
- `dummyos.preview.start`
- `dummyos.preview.update`
- `dummyos.preview.stop`
- `dummyos.preview.status`
- `dummyos.sentry.detect`
- `dummyos.sentry.plan`
- `dummyos.web.fetch`
- `dummyos.web.search`
- `dummyos.otp.extract`
- `dummyos.mcp.discover`
- `dummyos.browser.run`

## PreviewBridge live preview

`dummyos.preview.start` starts an in-process live static preview server for the MCP session. It serves
plain HTML/CSS/JS projects even without `package.json`, injects the live client into HTML, swaps CSS
without a full browser reload, soft-refreshes HTML, supports virtual in-memory files, and falls forward
to the next free port when the requested port is busy.

Use `dummyos.preview.update` to update virtual files without writing them to disk, then use
`dummyos.preview.stop` when the preview is no longer needed.

## Fast memory checkpoint (anti token cutoff)

`dummyos.memory.checkpoint` appends a small redacted JSONL record to `.dummy/memory/SESSION.md` so the OS
doesn't lose state when an agent session expires mid-flight. It auto-redacts common token shapes and rotates
the file when it grows past a size limit.
