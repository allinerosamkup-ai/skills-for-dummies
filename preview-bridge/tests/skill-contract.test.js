const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..');
const canonicalPath = path.join(repoRoot, 'preview-bridge', 'SKILL.md');
const distributionPath = path.join(repoRoot, 'skill-for-dummies', 'preview-bridge', 'SKILL.md');

test('preview-bridge skill defines truly-live runtime as the primary path', () => {
  const skill = fs.readFileSync(canonicalPath, 'utf8');

  assert.match(skill, /PreviewBridge v3\.1/);
  assert.match(skill, /Live Server\+\+/);
  assert.match(skill, /dummyos\.preview\.start/);
  assert.match(skill, /dummyos\.preview\.update/);
  assert.match(skill, /support_static_html_without_package_json: true/);
  assert.match(skill, /support_virtual_no_save_updates: true/);
  assert.match(skill, /support_css_hot_swap: true/);
  assert.match(skill, /support_soft_html_refresh: true/);
  assert.match(skill, /validate_with_http_and_browser: true/);
  assert.match(skill, /Nao declarar "funcionou" com base apenas em terminal/);
});

test('distribution copy stays identical to canonical preview-bridge skill', () => {
  const canonical = fs.readFileSync(canonicalPath, 'utf8');
  const distribution = fs.readFileSync(distributionPath, 'utf8');

  assert.equal(distribution, canonical);
});
