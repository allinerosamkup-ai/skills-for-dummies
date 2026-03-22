# File Contract

This contract keeps all builder agents aligned.

## Required Top Level

```text
apps/
  web/
  mobile/
```

## Web Contract

```text
apps/web/
  src/
    app/
      page.jsx or root route entry
      layout.jsx or root wrapper
      api/
        <entity>/route.js
        <entity>/[id]/route.js
        utils/
    components/
    utils/
```

### Web Rules

- UI routes are file-based.
- API routes are file-based.
- Shared web utilities live in `src/utils`.
- API helpers live in `src/app/api/utils`.
- Auth entrypoints must be easy to find.

## Mobile Contract

```text
apps/mobile/
  src/
    app/
      _layout.jsx
      index.jsx
      <feature>/
    components/
    utils/
```

### Mobile Rules

- Use Expo-style route/screen organization.
- Root layout owns providers and navigation shell.
- Shared mobile hooks live in `src/utils`.
- Feature screens should mirror the domain model used by the backend and web app.

## Cross-Platform Contract

- Use the same core entity names across web, mobile, backend, and database.
- Keep auth semantics consistent across platforms.
- Keep route and payload naming stable.
- If a feature is web-only or mobile-only, document the reason early.

## Runtime-Aware Notes

The source builder uses:

- a web runtime layer for auth, request tracing, body limits, integrations, and route loading
- a mobile runtime layer for Expo, aliases, and polyfills

The skill does not need to copy every internal runtime file verbatim, but it must preserve the same separation of concerns:

- runtime shell
- generated feature files
- shared contracts

## Embedded Template Mode

When `embedded-template` mode is active:

- runtime shell files should come from approved blocks in `template-manifest.md`
- starter files should come from approved starter blocks
- entity-specific implementation can extend the shell, but should not silently replace it

When `contract-only` mode is active:

- this file contract still applies
- no embedded blocks are materialized
