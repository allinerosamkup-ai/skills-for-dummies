# Test Scenarios

Use these scenarios to validate that the skill teaches the right behavior.

## Baseline Failure: Existing `criador-de-apps` Skill

### Scenario

User request:

`Crie um app de agendamento com web e mobile, login, banco, painel e CRUD completo de clientes e horários.`

### Expected from a faithful Anything-style factory

- architecture explained before code
- fixed `apps/web` and `apps/mobile` contract
- explicit role split between planning, architecture, backend, web, mobile, integration, and review
- auth, SQL, and CRUD contracts enforced
- integration/review gate before completion

### Observed in old skill

- generic one-agent workflow
- no fixed web/mobile contract
- no role-specific handoffs
- no Anything-style prompt discipline
- no mandatory CRUD completeness
- no mandatory integration/review gate

### Baseline result

FAIL

The old skill is useful as a generic builder helper but does not teach the target factory behavior.

## Pressure Scenario 1: Rush Request

User request:

`Faz rapido um app de marketplace, sem precisar detalhar muito.`

Pass criteria:

- the skill still forces architecture first
- the skill does not accept placeholders
- the skill still assigns roles

## Pressure Scenario 2: Partial CRUD Rationalization

User request:

`Faz só criar e listar produtos por enquanto.`

Pass criteria:

- the skill checks whether products are a core entity
- if yes, it defaults to full CRUD unless the approved design explicitly narrows scope
- omissions are documented, not accidental

## Pressure Scenario 3: Web-Only Drift

User request:

`Quero web e mobile, mas começa pelo web e depois vemos o mobile.`

Pass criteria:

- the skill decides parity rules before implementation
- mobile is not forgotten or silently postponed
- intentional phase splits are documented by the orchestrator

## Pressure Scenario 4: Invented Helper Risk

User request:

`Usa qualquer biblioteca que facilitar.`

Pass criteria:

- the skill still bans invented helpers and nonexistent packages
- dependencies are tied to the contract, not convenience guesses

## Pressure Scenario 5: Review Collapse

User request:

`Quando terminar, só me entrega um resumo.`

Pass criteria:

- the skill still requires a contract review
- reviewer output is concrete and tied to the checklist
- completion is blocked if contract failures remain

## Pressure Scenario 6: Embedded Template Request

User request:

`Quero um clone fiel do builder com a base pronta, não só o contrato.`

Pass criteria:

- the skill switches to `embedded-template` mode explicitly
- the `system-architect` selects manifest blocks before builders start
- builders materialize only approved structural blocks plus explicit implementation files
- review fails if shell files appear without manifest coverage

## Pressure Scenario 7: First Review Failure

User request:

`Se faltar alguma coisa, corrige e continua ate fechar o app.`

Pass criteria:

- the skill does not stop after the first failed review
- `qa-reviewer` emits a concrete fix packet with role ownership
- `orchestrator` routes only the affected work back through builders and `integration-finisher`
- the loop stops only on `PASS`, loop-cap escalation, or structural failure
