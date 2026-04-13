const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..');
const canonicalSkillPath = path.join(repoRoot, 'surge-core', 'SKILL.md');
const distributionSkillPath = path.join(repoRoot, 'skill-for-dummies', 'surge-core', 'SKILL.md');
const canonicalSpecPath = path.join(repoRoot, 'surge-core', 'SURGE_CORE_SPEC.md');
const distributionSpecPath = path.join(repoRoot, 'skill-for-dummies', 'surge-core', 'SURGE_CORE_SPEC.md');

test('surge-core contract requires spec-aware task distribution audit', () => {
  const skill = fs.readFileSync(canonicalSkillPath, 'utf8');
  const spec = fs.readFileSync(canonicalSpecPath, 'utf8');

  assert.match(skill, /Surge Core v4\.2/);
  assert.match(skill, /always_audit_task_distribution_against_spec: true/);
  assert.match(skill, /task_distribution_audit/);
  assert.match(skill, /Regra dura: Surge não deixa um sprint começar com distribuição desalinhada/);
  assert.match(spec, /Auditoria de Distribuição de Tarefas/);
  assert.match(spec, /Todo requisito obrigatório tem tarefa dona/);
  assert.match(spec, /retry_scope: task_distribution/);
});

test('surge-core contract preserves continuous monitoring and path creation', () => {
  const skill = fs.readFileSync(canonicalSkillPath, 'utf8');
  const spec = fs.readFileSync(canonicalSpecPath, 'utf8');

  assert.match(skill, /continuous_app_monitoring: true/);
  assert.match(skill, /preserve_path_creation_role: true/);
  assert.match(skill, /Surge como Criador de Caminhos/);
  assert.match(skill, /Quando não há caminho, crie um/);
  assert.match(spec, /Sinais contínuos do aplicativo/);
  assert.match(spec, /Falta ferramenta, conector, script ou caminho técnico/);
});

test('surge-core contract keeps self-evolution through skills', () => {
  const skill = fs.readFileSync(canonicalSkillPath, 'utf8');
  const spec = fs.readFileSync(canonicalSpecPath, 'utf8');

  assert.match(skill, /self_evolve_when_error_pattern_repeats: true/);
  assert.match(skill, /Autoevolução por Skills/);
  assert.match(skill, /skill_evolution_candidate/);
  assert.match(skill, /Verificar se já existe skill/);
  assert.match(spec, /Autoevolução por Skills/);
  assert.match(spec, /Criar ou propor skill conforme autonomia e risco/);
});

test('surge-core contract requires sprint validation with boundary pressure and notes', () => {
  const skill = fs.readFileSync(canonicalSkillPath, 'utf8');
  const spec = fs.readFileSync(canonicalSpecPath, 'utf8');

  assert.match(skill, /always_validate_after_each_sprint: true/);
  assert.match(skill, /force_boundary_and_stress_tests: true/);
  assert.match(skill, /validation_report/);
  assert.match(skill, /lista de validation com notas/);
  assert.match(skill, /entrada vazia/);
  assert.match(skill, /porta ocupada/);
  assert.match(spec, /Validação de Sprint/);
  assert.match(spec, /nota menor que 8 em requisito obrigatório volta para o orquestrador/);
});

test('surge-core contract requires orchestrator retry loop until complete validation', () => {
  const skill = fs.readFileSync(canonicalSkillPath, 'utf8');
  const spec = fs.readFileSync(canonicalSpecPath, 'utf8');

  assert.match(skill, /return_to_orchestrator_on_validation_failure: true/);
  assert.match(skill, /restart_cycle_until_validation_complete: true/);
  assert.match(skill, /validation_failed_handoff/);
  assert.match(skill, /required_next_action: replan_and_retry/);
  assert.match(skill, /entrega só quando validation_report estiver aprovado/);
  assert.match(spec, /Ciclo de Reorquestração/);
  assert.match(spec, /required_next_action: replan_and_retry/);
});

test('distribution copy stays identical to canonical surge-core files', () => {
  assert.equal(
    fs.readFileSync(distributionSkillPath, 'utf8'),
    fs.readFileSync(canonicalSkillPath, 'utf8')
  );
  assert.equal(
    fs.readFileSync(distributionSpecPath, 'utf8'),
    fs.readFileSync(canonicalSpecPath, 'utf8')
  );
});
