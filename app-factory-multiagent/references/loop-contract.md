# Loop Contract

The factory does not stop after the first integrated pass. Implementation includes a review/correction loop.

## Loop Shape

1. builders implement the current pass
2. `integration-finisher` reconciles the pass
3. `qa-reviewer` returns one of:
   - `PASS`
   - `FAIL_FIXABLE`
   - `FAIL_STRUCTURAL`
4. `orchestrator` reacts:
   - on `PASS`: exit loop and allow completion
   - on `FAIL_FIXABLE`: assign a targeted correction pass to the affected builders and run the loop again
   - on `FAIL_STRUCTURAL`: stop the implementation loop and reopen `system-architect`

## Default Limits

- default maximum: 3 review loops after the first implementation pass
- if the same issue repeats twice, treat it as structural unless there is strong evidence that the architecture is still correct
- do not claim success just because the app is "mostly there"

## What Counts As Fixable

- missing validation
- inconsistent payload names
- missing loading, empty, or error states
- incomplete CRUD endpoint coverage within an already-approved architecture
- mismatched imports, routes, or auth checks
- manifest-covered shell files integrated incorrectly

## What Counts As Structural

- the file contract is wrong or incomplete
- the selected template blocks cannot support the requested shell
- web/mobile parity decisions were wrong
- entity ownership or auth boundaries were never defined correctly
- the API shape cannot satisfy the approved flows without redesign
- repeated review failures show the current contract is not viable

## Required Review Packet

Every failed review must output:

- loop iteration number
- pass/fail status
- exact blocking findings
- role owner for each finding
- whether each finding is `fixable` or `structural`
- the minimum next action

Do not allow vague review output such as "clean this up" or "needs polish".
