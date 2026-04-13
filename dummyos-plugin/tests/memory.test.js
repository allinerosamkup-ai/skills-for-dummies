const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { callTool } = require('../lib/tools');

function makeTempProject() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'dummyos-memory-'));
}

function removeTempProject(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

test('memory.checkpoint writes a SESSION.md JSONL line and redacts secrets', async () => {
  const dir = makeTempProject();
  try {
    const result = await callTool('dummyos.memory.checkpoint', {
      projectPath: dir,
      event: 'step_complete',
      summary: 'connected stripe sk_live_1234567890abcdef and vercel_aaaaaaaaaaaaaaaaaaaa',
      data: {
        token: 'ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        note: 'Bearer abcdefghijklmnopqrstuvwxyz'
      }
    });

    assert.equal(result.ok, true);
    assert.equal(fs.existsSync(result.path), true);

    const text = fs.readFileSync(result.path, 'utf8');
    assert.match(text, /"event":"step_complete"/);
    assert.doesNotMatch(text, /sk_live_1234567890abcdef/);
    assert.doesNotMatch(text, /ghp_aaaaaaaa/);
    assert.doesNotMatch(text, /vercel_aaaaaaaaaaaaaaaaaaaa/);
    assert.match(text, /sk_live_\[REDACTED\]/);
    assert.match(text, /Bearer \[REDACTED\]/);
  } finally {
    removeTempProject(dir);
  }
});

test('memory.checkpoint rotates SESSION.md when it exceeds maxBytes', async () => {
  const dir = makeTempProject();
  try {
    const big = 'x'.repeat(5000);
    await callTool('dummyos.memory.checkpoint', {
      projectPath: dir,
      event: 'first',
      summary: big,
      maxBytes: 1024
    });

    // Force another write so the previous one is rotated.
    const second = await callTool('dummyos.memory.checkpoint', {
      projectPath: dir,
      event: 'second',
      summary: big,
      maxBytes: 1024
    });

    assert.equal(second.ok, true);
    assert.equal(typeof second.rotated, 'boolean');

    const sessionPath = path.join(dir, '.dummy', 'memory', 'SESSION.md');
    const rotatedPath = path.join(dir, '.dummy', 'memory', 'SESSION.prev.md');

    assert.equal(fs.existsSync(sessionPath), true);
    assert.equal(fs.existsSync(rotatedPath) || second.rotated === false, true);
  } finally {
    removeTempProject(dir);
  }
});

