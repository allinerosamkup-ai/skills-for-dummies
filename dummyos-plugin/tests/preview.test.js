const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { callTool } = require('../lib/tools');

function makeTempProject() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'dummyos-preview-'));
}

function removeTempProject(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function closeServer(server) {
  return new Promise((resolve) => server.close(resolve));
}

test('project detection recognizes static HTML projects without package.json', async () => {
  const dir = makeTempProject();
  try {
    fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><h1>Static</h1>');

    const detected = await callTool('dummyos.project.detect', { projectPath: dir });

    assert.equal(detected.ok, true);
    assert.equal(detected.framework, 'html');
    assert.equal(detected.name, path.basename(dir));
  } finally {
    removeTempProject(dir);
  }
});

test('preview.start serves HTML with live client injection and blocks sensitive files', async () => {
  const dir = makeTempProject();
  let previewId;

  try {
    fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><html><body><h1>Live</h1></body></html>');
    fs.writeFileSync(path.join(dir, '.env'), 'SECRET=value');

    const started = await callTool('dummyos.preview.start', { projectPath: dir, port: 0 });
    previewId = started.previewId;

    assert.equal(started.ok, true);
    assert.equal(started.capabilities.staticServer, true);
    assert.equal(started.capabilities.cssHotSwap, true);
    assert.equal(started.capabilities.softHtmlRefresh, true);
    assert.equal(started.capabilities.virtualNoSaveUpdates, true);

    const status = await callTool('dummyos.preview.status', {});
    assert.equal(status.ok, true);
    assert.equal(status.previews.some((preview) => preview.previewId === previewId), true);

    const htmlResponse = await fetch(started.url);
    const html = await htmlResponse.text();

    assert.equal(htmlResponse.status, 200);
    assert.match(html, /dummyos-preview-client/);
    assert.match(html, /EventSource/);
    assert.match(html, /refreshCss/);
    assert.match(html, /refreshHtml/);

    const envResponse = await fetch(new URL('/.env', started.url));
    assert.equal(envResponse.status, 403);
  } finally {
    if (previewId) await callTool('dummyos.preview.stop', { previewId });
    removeTempProject(dir);
  }
});

test('preview.update supports no-save virtual file updates', async () => {
  const dir = makeTempProject();
  let previewId;

  try {
    fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><h1>Disk fallback</h1>');

    const started = await callTool('dummyos.preview.start', {
      projectPath: dir,
      port: 0,
      html: '<!doctype html><html><body><h1>Virtual v1</h1></body></html>',
      virtualFiles: {
        'style.css': 'body { color: red; }'
      }
    });
    previewId = started.previewId;

    const firstHtml = await (await fetch(started.url)).text();
    assert.match(firstHtml, /Virtual v1/);

    const css = await (await fetch(new URL('/style.css', started.url))).text();
    assert.match(css, /color: red/);

    const updated = await callTool('dummyos.preview.update', {
      previewId,
      html: '<!doctype html><html><body><h1>Virtual v2</h1></body></html>',
      files: {
        'style.css': 'body { color: blue; }'
      }
    });

    assert.deepEqual(updated.changed.sort(), ['index.html', 'style.css']);

    const nextHtml = await (await fetch(started.url)).text();
    const nextCss = await (await fetch(new URL('/style.css', started.url))).text();
    assert.match(nextHtml, /Virtual v2/);
    assert.match(nextCss, /color: blue/);
  } finally {
    if (previewId) await callTool('dummyos.preview.stop', { previewId });
    removeTempProject(dir);
  }
});

test('preview.start falls forward when requested port is busy', async () => {
  const dir = makeTempProject();
  const blocker = net.createServer();
  let previewId;

  try {
    fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><h1>Port fallback</h1>');
    await new Promise((resolve) => blocker.listen(0, '127.0.0.1', resolve));
    const busyPort = blocker.address().port;

    const started = await callTool('dummyos.preview.start', { projectPath: dir, port: busyPort });
    previewId = started.previewId;

    assert.equal(started.ok, true);
    assert.notEqual(started.port, busyPort);
    assert.equal(started.capabilities.autoPortFallback, true);

    const response = await fetch(started.url);
    assert.equal(response.status, 200);
  } finally {
    if (previewId) await callTool('dummyos.preview.stop', { previewId });
    await closeServer(blocker);
    removeTempProject(dir);
  }
});
