# Review Checklist

The review is complete only when every applicable item passes.

## Architecture

- Architecture was explained before code.
- The solution follows the fixed `apps/web` and `apps/mobile` contract.
- File placement is predictable and traceable.

## Backend

- Core entities have complete CRUD coverage unless the approved design explicitly narrowed scope.
- Inputs are validated.
- Error paths are handled explicitly.
- Auth and ownership checks are present where needed.
- SQL access is parameterized or safely tagged.

## Web

- File-based pages/routes are coherent.
- UI matches API contracts.
- Loading, empty, and error states exist where needed.

## Mobile

- Expo screen/layout structure is coherent.
- Core flows intentionally match or intentionally diverge from web.
- Mobile-specific constraints are handled without breaking the shared model.

## Integration

- Entity names are consistent across database, API, web, and mobile.
- Route names and payload shapes are consistent.
- Auth semantics are consistent.
- Shared assumptions are documented instead of implied.
- In `embedded-template` mode, structural files map to approved manifest blocks or explicit non-template implementation.
- Runtime blocks and starter blocks are not mixed accidentally.

## Loop Control

- The current review packet identifies the loop iteration.
- Every blocking finding is assigned to a role owner.
- Every blocking finding is marked `fixable` or `structural`.
- A failed review routes back into the correction loop instead of jumping to completion.
- Repeated unresolved findings escalate to architecture instead of looping forever.

## Quality Gates

- No placeholders.
- No invented packages or helpers.
- No silent TODOs in place of implementation.
- No unsupported leaps in architecture.
- No completion claim without verification.
- No invented shell files outside the approved manifest path in `embedded-template` mode.
- No completion after a failed review packet.

## Fail Conditions

Reject the work if any of these are true:

- a core entity is missing endpoints without explicit justification
- mobile was deferred accidentally instead of intentionally
- web and backend disagree on payload shape
- auth is implied but not implemented
- the selected template blocks do not explain the generated shell files
- review comments are subjective instead of contract-based
- the work exits after one failed review instead of entering the correction loop
