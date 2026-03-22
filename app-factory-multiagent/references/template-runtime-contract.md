# Template Runtime Contract

These are the embedded shell blocks that approximate the original builder's runtime/template split.

## Runtime Blocks

- `web-core-shell`
- `api-core-shell`
- `web-auth-shell`
- `mobile-core-shell`
- `mobile-auth-shell`

## Runtime Intent

Runtime blocks own the stable shell:

- route and layout boundaries
- auth/session boundaries
- API folder shape
- utility/helper placement
- provider and navigation ownership

Runtime blocks are not feature-complete products. They are the operational shell that feature builders extend.

## Runtime Rules

- runtime files should be chosen before feature implementation starts
- runtime files define where later feature files belong
- runtime files should stay generic enough to support multiple app domains
- if a runtime decision changes the data or auth contract, it must be resolved centrally by the `system-architect`

## Runtime/Feature Separation

- runtime block: shell, boundary, provider, auth, route skeleton
- feature implementation: entity-specific pages, screens, forms, queries, mutations, policies

Do not hide feature logic inside runtime files just because they exist early.
