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
- `dummyos.sentry.detect`
- `dummyos.sentry.plan`
