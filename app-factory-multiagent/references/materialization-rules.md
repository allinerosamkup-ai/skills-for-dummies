# Materialization Rules

These rules govern how embedded template blocks become files.

## Ownership

- `orchestrator` confirms whether the project is `contract-only` or `embedded-template`
- `system-architect` selects the approved blocks
- `backend-builder`, `web-builder`, and `mobile-builder` materialize only approved blocks
- `integration-finisher` resolves overlaps and conflicts
- `qa-reviewer` fails the work if the output drifts from the selected blocks without justification

## Allowed Outputs

In `embedded-template` mode, a file can be:

1. from an approved manifest block
2. an explicit non-template implementation file required by the approved design

Nothing else should appear silently.

## Stop Conditions

Stop and resolve the issue if:

- a required shell file is not covered by an approved block
- two blocks imply conflicting ownership of the same file
- a builder wants to invent a structural file outside the manifest
- the project mixes `contract-only` and `embedded-template` behavior accidentally

## Reconciliation Rules

- block-selected shell files define the base structure
- explicit implementation files extend that structure
- if a builder needs a structural adjustment, change the block selection or add a new block first
- do not quietly mutate the shell contract mid-implementation

## Review Rules

The `qa-reviewer` must check:

- all structural files belong to approved blocks or explicit non-template implementation
- block dependencies were respected
- runtime and starter blocks were not confused
- builders did not invent hidden shell files
