# Template Manifest

Use this manifest only in `embedded-template` mode.

The `system-architect` selects blocks. Builders materialize only the approved blocks plus any explicitly non-template implementation files.

## Block: web-core-shell

- id: `web-core-shell`
- mode: `runtime`
- when-to-use: use when the project needs a routed web shell with predictable `app`, `components`, and `utils` boundaries
- depends-on: none
- materializes:
  - `apps/web/src/app/page.jsx`
  - `apps/web/src/app/layout.jsx`
  - `apps/web/src/components/`
  - `apps/web/src/utils/`
- required-contracts:
  - `web-route-shell`
  - `web-layout-boundary`
- notes:
  - keep file-routed pages predictable

## Block: api-core-shell

- id: `api-core-shell`
- mode: `runtime`
- when-to-use: use when the project needs file-routed APIs and backend utility helpers
- depends-on:
  - `web-core-shell`
- materializes:
  - `apps/web/src/app/api/<entity>/route.js`
  - `apps/web/src/app/api/<entity>/[id]/route.js`
  - `apps/web/src/app/api/utils/`
- required-contracts:
  - `crud-contract`
  - `safe-sql-boundary`
- notes:
  - preserve exact route and payload discipline

## Block: web-auth-shell

- id: `web-auth-shell`
- mode: `runtime`
- when-to-use: use when the project needs sign in, sign up, session-aware UI, or protected routes
- depends-on:
  - `web-core-shell`
  - `api-core-shell`
- materializes:
  - `apps/web/src/auth.js`
  - `apps/web/src/utils/useUser.js`
  - `apps/web/src/utils/useAuth.js`
  - `apps/web/src/app/account/signin/page.jsx`
  - `apps/web/src/app/account/signup/page.jsx`
- required-contracts:
  - `auth-boundary`
  - `session-user-shape`
- notes:
  - avoid fake auth helpers or inconsistent session semantics

## Block: mobile-core-shell

- id: `mobile-core-shell`
- mode: `runtime`
- when-to-use: use when the project needs an Expo root shell with stable providers and navigation ownership
- depends-on: none
- materializes:
  - `apps/mobile/src/app/_layout.jsx`
  - `apps/mobile/src/app/index.jsx`
  - `apps/mobile/src/components/`
  - `apps/mobile/src/utils/`
- required-contracts:
  - `mobile-root-shell`
  - `platform-parity-boundary`
- notes:
  - root layout owns providers and navigation shell

## Block: mobile-auth-shell

- id: `mobile-auth-shell`
- mode: `runtime`
- when-to-use: use when the app needs mobile auth flows or session-aware protected screens
- depends-on:
  - `mobile-core-shell`
  - `web-auth-shell`
- materializes:
  - `apps/mobile/src/utils/auth/`
  - `apps/mobile/src/app/(auth)/`
- required-contracts:
  - `auth-boundary`
  - `session-user-shape`
- notes:
  - keep auth semantics aligned with web

## Block: admin-dashboard-starter

- id: `admin-dashboard-starter`
- mode: `starter`
- when-to-use: use when the user wants a ready-made admin shell, dashboard home, or CRUD workspace
- depends-on:
  - `web-core-shell`
  - `api-core-shell`
- materializes:
  - `apps/web/src/app/dashboard/page.jsx`
  - `apps/web/src/components/DashboardShell.jsx`
  - `apps/web/src/components/CrudTable.jsx`
  - `apps/web/src/components/CrudForm.jsx`
- required-contracts:
  - `crud-contract`
  - `web-layout-boundary`
- notes:
  - this is a starter shell, not a replacement for entity-specific implementation

## Block: mobile-crud-starter

- id: `mobile-crud-starter`
- mode: `starter`
- when-to-use: use when the mobile app needs a ready-made list/detail/edit navigation shell for CRUD entities
- depends-on:
  - `mobile-core-shell`
  - `api-core-shell`
- materializes:
  - `apps/mobile/src/app/<feature>/index.jsx`
  - `apps/mobile/src/app/<feature>/[id].jsx`
  - `apps/mobile/src/components/EntityList.jsx`
  - `apps/mobile/src/components/EntityForm.jsx`
- required-contracts:
  - `crud-contract`
  - `platform-parity-boundary`
- notes:
  - entity names and payloads must match backend contracts exactly

## Selection Rules

- Select the minimum set of blocks needed.
- Prefer runtime blocks before starter blocks.
- Do not select a starter block without the runtime dependencies it assumes.
- If a required structural file is missing from the manifest, stop and add a new block or mark the file as explicit non-template implementation.
