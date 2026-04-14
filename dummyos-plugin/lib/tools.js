const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const { randomUUID } = require('crypto');

function normalizePath(p) {
  if (!p) return null;
  return path.resolve(String(p));
}

function redactSecretsFromString(text) {
  let value = String(text || '');

  const replacements = [
    // Stripe
    [/\bsk_(live|test)_[0-9a-zA-Z]{8,}\b/g, 'sk_$1_[REDACTED]'],
    // Supabase
    [/\bsb_[0-9a-zA-Z_]{8,}\b/g, 'sb_[REDACTED]'],
    // GitHub
    [/\bghp_[0-9A-Za-z]{20,}\b/g, 'ghp_[REDACTED]'],
    [/\bgithub_pat_[0-9A-Za-z_]{20,}\b/g, 'github_pat_[REDACTED]'],
    // Vercel
    [/\bvercel_[0-9A-Za-z]{20,}\b/g, 'vercel_[REDACTED]'],
    // JWT-like
    [/\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g, '[REDACTED_JWT]'],
    // Bearer tokens
    [/\bBearer\s+[A-Za-z0-9._-]{12,}\b/g, 'Bearer [REDACTED]']
  ];

  for (const [pattern, replacement] of replacements) {
    value = value.replace(pattern, replacement);
  }

  return value;
}

function redactSecrets(input, { maxStringLength = 4000, maxDepth = 4 } = {}) {
  if (input == null) return input;
  if (maxDepth <= 0) return '[TRUNCATED]';

  if (typeof input === 'string') {
    const clipped = input.length > maxStringLength ? `${input.slice(0, maxStringLength)}…` : input;
    return redactSecretsFromString(clipped);
  }

  if (typeof input === 'number' || typeof input === 'boolean') return input;

  if (Array.isArray(input)) {
    return input.slice(0, 50).map((entry) => redactSecrets(entry, { maxStringLength, maxDepth: maxDepth - 1 }));
  }

  if (typeof input === 'object') {
    const out = {};
    const entries = Object.entries(input).slice(0, 50);
    for (const [key, value] of entries) {
      if (String(key).toLowerCase().includes('token') || String(key).toLowerCase().includes('secret')) {
        out[key] = '[REDACTED]';
        continue;
      }
      out[key] = redactSecrets(value, { maxStringLength, maxDepth: maxDepth - 1 });
    }
    return out;
  }

  return redactSecretsFromString(String(input));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function rotateFileIfNeeded(filePath, maxBytes) {
  try {
    if (!fs.existsSync(filePath)) return { rotated: false };
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return { rotated: false };
    if (stat.size <= maxBytes) return { rotated: false };

    const dir = path.dirname(filePath);
    const base = path.basename(filePath);
    const rotatedPath = path.join(dir, base.replace(/\.md$/i, '.prev.md'));
    try {
      fs.rmSync(rotatedPath, { force: true });
    } catch {}
    fs.renameSync(filePath, rotatedPath);
    return { rotated: true, rotatedPath, previousSize: stat.size };
  } catch (error) {
    return { rotated: false, error: String(error.message || error) };
  }
}

function appendCheckpoint(projectPath, record, { maxBytes = 256 * 1024 } = {}) {
  const root = normalizePath(projectPath || process.env.DUMMYOS_PROJECT_ROOT || process.cwd());
  const memoryDir = path.join(root, '.dummy', 'memory');
  ensureDir(memoryDir);
  const filePath = path.join(memoryDir, 'SESSION.md');

  const rotation = rotateFileIfNeeded(filePath, maxBytes);
  const line = `${JSON.stringify(record)}\n`;
  fs.appendFileSync(filePath, line, 'utf8');

  return {
    path: filePath,
    bytesAppended: Buffer.byteLength(line, 'utf8'),
    rotated: Boolean(rotation.rotated),
    rotatedPath: rotation.rotatedPath || null
  };
}

const PREVIEW_REGISTRY = new Map();
const PREVIEW_EVENT_PATH = '/_dummyos_preview/events';
const PREVIEW_CLIENT_MARKER = 'dummyos-preview-client';

function normalizeWebPath(rawPath) {
  const clean = String(rawPath || '')
    .split('?')[0]
    .split('#')[0]
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');

  const normalized = path.posix.normalize(clean || '.');
  if (normalized === '.' || normalized === '/') return '';
  if (normalized.startsWith('../') || normalized === '..') return null;
  return normalized;
}

function isPathInside(parent, child) {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function isBlockedPreviewPath(relativePath) {
  const parts = normalizeWebPath(relativePath)?.split('/') || [];
  if (parts.some((part) => ['.git', '.dummy', 'node_modules'].includes(part))) return true;
  const base = parts[parts.length - 1] || '';
  return base === '.env' || base.startsWith('.env.');
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8'
  };
  return types[ext] || 'application/octet-stream';
}

function getReloadKind(relativePath) {
  const ext = path.extname(relativePath || '').toLowerCase();
  if (ext === '.css') return 'css';
  if (ext === '.html' || ext === '.htm') return 'html';
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'].includes(ext)) return 'asset';
  return 'reload';
}

function injectPreviewClient(html) {
  const source = String(html || '');
  if (source.includes(PREVIEW_CLIENT_MARKER)) return source;

  const script = `<script id="${PREVIEW_CLIENT_MARKER}">
(() => {
  if (window.__DUMMYOS_PREVIEW_CONNECTED__) return;
  window.__DUMMYOS_PREVIEW_CONNECTED__ = true;

  const stamp = () => String(Date.now());
  const bust = (input) => {
    const url = new URL(input, window.location.href);
    url.searchParams.set('__dummyos_t', stamp());
    return url.toString();
  };

  const refreshCss = () => {
    document.querySelectorAll('link[rel~="stylesheet"]').forEach((link) => {
      link.href = bust(link.href);
    });
  };

  const refreshAssets = () => {
    document.querySelectorAll('img, source').forEach((node) => {
      const attr = node.getAttribute('src') ? 'src' : 'srcset';
      const value = node.getAttribute(attr);
      if (value) node.setAttribute(attr, bust(value));
    });
  };

  const refreshHtml = async () => {
    const response = await fetch(bust(window.location.href), { cache: 'reload' });
    const text = await response.text();
    document.open();
    document.write(text);
    document.close();
  };

  const source = new EventSource('${PREVIEW_EVENT_PATH}');
  source.addEventListener('change', async (event) => {
    let payload = {};
    try { payload = JSON.parse(event.data || '{}'); } catch {}

    if (payload.kind === 'css') {
      refreshCss();
      return;
    }

    if (payload.kind === 'asset') {
      refreshAssets();
      refreshCss();
      return;
    }

    if (payload.kind === 'html') {
      await refreshHtml();
      return;
    }

    window.location.reload();
  });
})();
</script>`;

  if (/<\/body>/i.test(source)) {
    return source.replace(/<\/body>/i, `${script}\n</body>`);
  }
  return `${source}\n${script}`;
}

function sendPreviewEvent(preview, payload) {
  const message = `event: change\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of preview.clients) {
    client.write(message);
  }
}

function serveBuffer(res, body, contentType, shouldInject) {
  const textBody = shouldInject ? injectPreviewClient(body.toString('utf8')) : body;
  res.writeHead(200, {
    'content-type': contentType,
    'cache-control': 'no-store'
  });
  res.end(textBody);
}

function createPreviewHttpServer(preview) {
  return http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === PREVIEW_EVENT_PATH) {
      res.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-store',
        connection: 'keep-alive'
      });
      res.write('\n');
      preview.clients.add(res);
      req.on('close', () => preview.clients.delete(res));
      return;
    }

    const requested = normalizeWebPath(decodeURIComponent(url.pathname));
    if (requested === null || isBlockedPreviewPath(requested)) {
      res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    const relativePath = requested || preview.indexFile;
    const lookupPath = relativePath.endsWith('/') ? `${relativePath}${preview.indexFile}` : relativePath;
    const virtualBody = preview.virtualFiles.get(lookupPath);

    if (virtualBody !== undefined) {
      const contentType = getContentType(lookupPath);
      serveBuffer(res, Buffer.from(String(virtualBody)), contentType, contentType.startsWith('text/html'));
      return;
    }

    let filePath = path.resolve(preview.rootPath, lookupPath);
    if (!isPathInside(preview.rootPath, filePath)) {
      res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, preview.indexFile);
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const contentType = getContentType(filePath);
    serveBuffer(res, fs.readFileSync(filePath), contentType, contentType.startsWith('text/html'));
  });
}

function listen(server, port, host) {
  return new Promise((resolve, reject) => {
    const onError = (err) => {
      server.off('listening', onListening);
      reject(err);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve(server.address());
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, host);
  });
}

async function listenOnAvailablePort(preview, requestedPort, host) {
  const requested = Number(requestedPort ?? 5555);
  const firstPort = Number.isFinite(requested) ? Math.max(0, Math.min(65535, requested)) : 5555;
  const maxAttempts = firstPort === 0 ? 1 : 25;
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const port = firstPort === 0 ? 0 : firstPort + attempt;
    const server = createPreviewHttpServer(preview);
    try {
      const address = await listen(server, port, host);
      return { server, port: address.port, requestedPort: firstPort };
    } catch (err) {
      lastError = err;
      if (err?.code !== 'EADDRINUSE') throw err;
    }
  }

  throw lastError || new Error('No available preview port found');
}

function createPreviewWatcher(preview) {
  if (preview.watch === false) return null;

  const emit = (filename) => {
    if (!filename) return;
    const relativePath = normalizeWebPath(String(filename));
    if (!relativePath || isBlockedPreviewPath(relativePath)) return;
    clearTimeout(preview.changeTimer);
    preview.changeTimer = setTimeout(() => {
      sendPreviewEvent(preview, {
        path: relativePath,
        kind: getReloadKind(relativePath),
        source: 'disk'
      });
    }, preview.reloadDelayMs);
  };

  try {
    return fs.watch(preview.rootPath, { recursive: true }, (_event, filename) => emit(filename));
  } catch {
    return fs.watch(preview.rootPath, (_event, filename) => emit(filename));
  }
}

function safeRequireFromRepo(relPath) {
  const repoRoot = path.resolve(__dirname, '..', '..');
  return require(path.resolve(repoRoot, relPath));
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function detectFrameworkFromPackage(pkg) {
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  if (deps.next) return 'nextjs';
  if (deps['react-scripts']) return 'cra';
  if (deps.vite) return 'vite';
  if (deps.express) return 'express';
  if (deps.fastify) return 'fastify';
  return 'node';
}

function detectSentryFromPackage(pkg) {
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const keys = Object.keys(deps);
  const has = (name) => keys.includes(name);

  return {
    hasSentryNextjs: has('@sentry/nextjs'),
    hasSentryNode: has('@sentry/node'),
    hasSentryReact: has('@sentry/react'),
    hasSentryVite: has('@sentry/vite-plugin')
  };
}

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDdgUrl(href) {
  try {
    const url = new URL(href, 'https://duckduckgo.com');
    if (url.hostname === 'duckduckgo.com' && url.pathname === '/l/' && url.searchParams.has('uddg')) {
      return url.searchParams.get('uddg');
    }
    return url.toString();
  } catch {
    return href;
  }
}

async function fetchTextLimited(url, opts) {
  const timeoutMs = Number(opts?.timeoutMs || 20000);
  const maxBytes = Number(opts?.maxBytes || 250_000);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: opts?.method || 'GET',
      headers: opts?.headers || { 'user-agent': 'dummyos-plugin' },
      body: opts?.body,
      signal: controller.signal
    });

    const reader = res.body?.getReader?.();
    if (!reader) {
      const text = await res.text();
      return { ok: res.ok, status: res.status, url: res.url, headers: Object.fromEntries(res.headers), text };
    }

    const chunks = [];
    let total = 0;
    let truncated = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      const nextTotal = total + value.length;
      if (nextTotal > maxBytes) {
        chunks.push(value.slice(0, Math.max(0, maxBytes - total)));
        total = maxBytes;
        truncated = true;
        break;
      }

      chunks.push(value);
      total = nextTotal;
    }

    const buf = Buffer.concat(chunks, total);
    const text = buf.toString('utf8');
    return {
      ok: res.ok,
      status: res.status,
      url: res.url,
      headers: Object.fromEntries(res.headers),
      text,
      truncated
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function toolReady() {
  const { getConnectProReadiness } = safeRequireFromRepo('ConnectPro-v9.8/tools/connectpro-readiness');
  return { readiness: getConnectProReadiness() };
}

async function toolConnect(args) {
  const { runConnectPro } = safeRequireFromRepo('ConnectPro-v9.8/agents/orchestrator');
  const result = await runConnectPro(args.userMessage, args.userId);
  return result;
}

async function toolProjectDetect(args) {
  const projectPath = normalizePath(args.projectPath || process.env.DUMMYOS_PROJECT_ROOT || process.cwd());
  const pkgPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    const indexPath = path.join(projectPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return {
        ok: true,
        projectPath,
        name: path.basename(projectPath),
        framework: 'html',
        sentry: detectSentryFromPackage({})
      };
    }

    return {
      ok: false,
      reason: 'package.json not found',
      projectPath
    };
  }

  const pkg = readJson(pkgPath);
  return {
    ok: true,
    projectPath,
    name: pkg.name || null,
    framework: detectFrameworkFromPackage(pkg),
    sentry: detectSentryFromPackage(pkg)
  };
}

async function toolMemoryCheckpoint(args) {
  const projectPath = normalizePath(args.projectPath || process.env.DUMMYOS_PROJECT_ROOT || process.cwd());
  const event = String(args.event || '').trim();
  if (!event) {
    return { ok: false, reason: 'missing event' };
  }

  const record = {
    ts: new Date().toISOString(),
    projectPath,
    event,
    phase: args.phase ? String(args.phase) : null,
    summary: args.summary ? redactSecrets(args.summary) : null,
    tags: Array.isArray(args.tags) ? args.tags.slice(0, 20).map((tag) => String(tag)) : null,
    data: args.data ? redactSecrets(args.data) : null
  };

  const maxBytes = Number.isFinite(Number(args.maxBytes)) ? Math.max(1024, Number(args.maxBytes)) : undefined;
  const result = appendCheckpoint(projectPath, record, maxBytes ? { maxBytes } : undefined);

  return {
    ok: true,
    ...result,
    record: {
      ts: record.ts,
      event: record.event,
      phase: record.phase
    }
  };
}

async function toolPreviewStart(args) {
  const projectPath = normalizePath(args.projectPath || process.env.DUMMYOS_PROJECT_ROOT || process.cwd());
  const rootInput = args.root || '.';
  const rootPath = path.resolve(projectPath, String(rootInput));
  const indexFile = normalizeWebPath(args.indexFile || 'index.html') || 'index.html';

  if (!fs.existsSync(rootPath) || !fs.statSync(rootPath).isDirectory()) {
    return {
      ok: false,
      reason: 'preview root not found',
      projectPath,
      rootPath
    };
  }

  const virtualFiles = new Map();
  if (args.html !== undefined) {
    virtualFiles.set(indexFile, String(args.html));
  }
  if (args.virtualFiles && typeof args.virtualFiles === 'object') {
    for (const [filePath, content] of Object.entries(args.virtualFiles)) {
      const normalized = normalizeWebPath(filePath);
      if (normalized && !isBlockedPreviewPath(normalized)) {
        virtualFiles.set(normalized, String(content));
      }
    }
  }

  const preview = {
    id: randomUUID(),
    projectPath,
    rootPath,
    indexFile,
    requestedRoot: String(rootInput),
    clients: new Set(),
    virtualFiles,
    watch: args.watch !== false,
    reloadDelayMs: Number.isFinite(Number(args.reloadDelayMs))
      ? Math.max(0, Math.min(5000, Number(args.reloadDelayMs)))
      : 300,
    createdAt: new Date().toISOString(),
    server: null,
    watcher: null,
    changeTimer: null
  };

  const host = String(args.host || '127.0.0.1');
  const requestedPort = Number(args.port ?? args.preferredPort ?? 5555);
  const started = await listenOnAvailablePort(preview, requestedPort, host);
  preview.server = started.server;
  preview.port = started.port;
  preview.requestedPort = started.requestedPort;
  preview.host = host;
  preview.url = `http://${host}:${started.port}/`;
  preview.watcher = createPreviewWatcher(preview);
  PREVIEW_REGISTRY.set(preview.id, preview);

  return {
    ok: true,
    previewId: preview.id,
    projectPath,
    rootPath,
    url: preview.url,
    port: preview.port,
    requestedPort: preview.requestedPort,
    indexFile,
    capabilities: {
      staticServer: true,
      liveEvents: true,
      softHtmlRefresh: true,
      cssHotSwap: true,
      assetRefresh: true,
      virtualNoSaveUpdates: true,
      autoPortFallback: preview.port !== preview.requestedPort
    }
  };
}

async function toolPreviewUpdate(args) {
  const previewId = String(args.previewId || '');
  const preview = PREVIEW_REGISTRY.get(previewId);
  if (!preview) {
    return { ok: false, reason: 'preview not found', previewId };
  }

  const changed = [];
  if (args.html !== undefined) {
    preview.virtualFiles.set(preview.indexFile, String(args.html));
    changed.push(preview.indexFile);
  }
  if (args.files && typeof args.files === 'object') {
    for (const [filePath, content] of Object.entries(args.files)) {
      const normalized = normalizeWebPath(filePath);
      if (!normalized || isBlockedPreviewPath(normalized)) continue;
      preview.virtualFiles.set(normalized, String(content));
      changed.push(normalized);
    }
  }

  for (const filePath of changed) {
    sendPreviewEvent(preview, {
      path: filePath,
      kind: getReloadKind(filePath),
      source: 'virtual'
    });
  }

  return {
    ok: true,
    previewId,
    changed,
    url: preview.url
  };
}

async function toolPreviewStop(args) {
  const previewId = String(args.previewId || '');
  const preview = PREVIEW_REGISTRY.get(previewId);
  if (!preview) {
    return { ok: false, reason: 'preview not found', previewId };
  }

  clearTimeout(preview.changeTimer);
  preview.watcher?.close?.();
  for (const client of preview.clients) {
    client.end();
  }
  await new Promise((resolve) => preview.server.close(resolve));
  PREVIEW_REGISTRY.delete(previewId);

  return { ok: true, previewId };
}

async function toolPreviewStatus() {
  return {
    ok: true,
    previews: Array.from(PREVIEW_REGISTRY.values()).map((preview) => ({
      previewId: preview.id,
      projectPath: preview.projectPath,
      rootPath: preview.rootPath,
      url: preview.url,
      port: preview.port,
      indexFile: preview.indexFile,
      createdAt: preview.createdAt
    }))
  };
}

async function toolSentryDetect(args) {
  const projectPath = normalizePath(args.projectPath || process.env.DUMMYOS_PROJECT_ROOT || process.cwd());
  const pkgPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    return { ok: false, reason: 'package.json not found', projectPath };
  }

  const pkg = readJson(pkgPath);
  const framework = detectFrameworkFromPackage(pkg);
  const sentry = detectSentryFromPackage(pkg);

  return {
    ok: true,
    projectPath,
    framework,
    sentry,
    env: {
      hasSentryDsn: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)
    }
  };
}

async function toolSentryPlan(args) {
  const detected = await toolSentryDetect(args);
  if (!detected.ok) return detected;

  const steps = [];
  if (!detected.env.hasSentryDsn) {
    steps.push({
      type: 'connect',
      tool: 'dummyos.connect',
      arguments: {
        userId: args.userId || 'local-user',
        userMessage: 'Conectar Sentry e obter DSN (capability-first: web_search + browser_automation se necessario)'
      },
      note: 'Se nao houver conector direto, use ConnectPro para discovery via registry + browser automation.'
    });
  }

  steps.push({
    type: 'manual',
    note: `Instalar SDK Sentry para stack ${detected.framework}. (Este plugin so planeja; setup automatico vem na proxima iteracao.)`
  });

  steps.push({
    type: 'verify',
    note: 'Disparar um erro controlado em dev e confirmar evento no Sentry.'
  });

  return {
    ok: true,
    projectPath: detected.projectPath,
    framework: detected.framework,
    detected: detected.sentry,
    steps
  };
}

async function toolWebFetch(args) {
  const raw = String(args?.url || '').trim();
  if (!raw) return { ok: false, reason: 'url is required' };

  let url;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: 'invalid url' };
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return { ok: false, reason: 'only http/https supported' };
  }

  const result = await fetchTextLimited(url.toString(), {
    method: args?.method,
    headers: args?.headers,
    body: args?.body,
    timeoutMs: args?.timeoutMs,
    maxBytes: args?.maxBytes
  });

  return {
    ok: true,
    fetch: result
  };
}

async function toolWebSearch(args) {
  const query = String(args?.query || '').trim();
  if (!query) return { ok: false, reason: 'query is required' };

  const limit = Math.max(1, Math.min(20, Number(args?.limit || 5)));
  const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  const fetched = await fetchTextLimited(searchUrl, {
    timeoutMs: args?.timeoutMs || 20000,
    maxBytes: args?.maxBytes || 400_000,
    headers: {
      'user-agent': 'dummyos-plugin',
      accept: 'text/html'
    }
  });

  if (!fetched.ok) {
    return { ok: false, reason: `search http ${fetched.status}`, url: searchUrl };
  }

  const html = fetched.text || '';
  const results = [];
  const linkRe = /<a[^>]*class=\"result__a\"[^>]*href=\"([^\"]+)\"[^>]*>([\s\S]*?)<\/a>/g;

  let match;
  while ((match = linkRe.exec(html)) && results.length < limit) {
    const href = normalizeDdgUrl(match[1]);
    const title = stripHtml(match[2]);

    const windowHtml = html.slice(match.index, Math.min(html.length, match.index + 2500));
    const snipMatch =
      /result__snippet[^>]*>([\s\S]*?)<\/a>/.exec(windowHtml) ||
      /result__snippet[^>]*>([\s\S]*?)<\/span>/.exec(windowHtml);
    const snippet = snipMatch ? stripHtml(snipMatch[1]) : null;

    results.push({ title, url: href, snippet });
  }

  return { ok: true, query, url: searchUrl, results };
}

async function toolOtpExtract(args) {
  const text = String(args?.text || '');
  const digits = Number(args?.digits || 6);
  const min = Math.max(4, Math.min(10, Number.isFinite(digits) ? digits : 6));
  const max = min;

  const re = new RegExp(`\\b(\\d{${min},${max}})\\b`, 'g');
  const found = new Set();
  let m;
  while ((m = re.exec(text))) {
    found.add(m[1]);
  }
  return { ok: true, digits: min, codes: Array.from(found) };
}

async function toolMcpDiscover(args) {
  const service = String(args?.service || '').trim();
  const query = String(args?.query || '').trim();
  if (!service && !query) return { ok: false, reason: 'service or query is required' };

  const q = query || `${service} mcp server github`;
  const search = await toolWebSearch({ query: q, limit: Math.max(3, Math.min(10, Number(args?.limit || 5))) });
  if (!search.ok) return search;

  const repos = (search.results || [])
    .map((r) => r.url)
    .filter(Boolean)
    .filter((u) => String(u).includes('github.com/'));

  return {
    ok: true,
    service: service || null,
    query: q,
    candidates: search.results,
    githubCandidates: Array.from(new Set(repos))
  };
}

async function toolBrowserRun(args) {
  let playwright;
  try {
    playwright = require('playwright');
  } catch (err) {
    return {
      ok: false,
      reason: 'playwright not installed',
      hint: 'Reinstall dummyos-plugin globally (it bundles playwright) and ensure browsers are installed.',
      error: err?.message || String(err)
    };
  }

  const steps = Array.isArray(args?.steps) ? args.steps : [];
  const headless = args?.headless !== false;
  const slowMo = Number(args?.slowMo || 0) || 0;
  const defaultTimeoutMs = Math.max(1000, Math.min(120000, Number(args?.timeoutMs || 30000)));

  const launchAttempts = [];
  if (args?.channel) launchAttempts.push({ channel: String(args.channel) });
  // Try system browsers first to avoid large Playwright downloads.
  launchAttempts.push({ channel: 'msedge' }, { channel: 'chrome' }, {});

  let browser;
  let lastErr;
  for (const attempt of launchAttempts) {
    try {
      const opts = { headless, slowMo, ...attempt };
      browser = await playwright.chromium.launch(opts);
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
    }
  }

  if (!browser) {
    const err = lastErr;
    const msg = String(err?.message || err);
    const hint =
      msg.includes("Executable doesn't exist") || msg.includes('run the following command to download new browsers')
        ? 'Playwright managed browsers not installed and no system browser channel worked. Try: `npx playwright install chromium` (requires disk space) or install Chrome/Edge.'
        : msg.includes('ENOSPC') || msg.includes('no space left on device')
          ? 'No disk space available to install/run Playwright browsers. Free space and retry.'
          : 'Failed to launch browser.';

    return { ok: false, reason: 'browser_launch_failed', hint, error: msg };
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(defaultTimeoutMs);

  const outputs = {};
  const screenshots = [];

  const ensureOutDir = () => {
    const dir = path.join(os.tmpdir(), 'dummyos-plugin');
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  };

  try {
    for (const step of steps) {
      const action = String(step?.action || '').trim();
      if (!action) continue;

      if (action === 'goto') {
        await page.goto(String(step.url), { waitUntil: step.waitUntil || 'domcontentloaded' });
        continue;
      }

      if (action === 'click') {
        await page.click(String(step.selector));
        continue;
      }

      if (action === 'fill') {
        await page.fill(String(step.selector), String(step.value ?? ''));
        continue;
      }

      if (action === 'type') {
        await page.type(String(step.selector), String(step.text ?? ''), { delay: step.delay });
        continue;
      }

      if (action === 'press') {
        await page.press(String(step.selector), String(step.key));
        continue;
      }

      if (action === 'waitForSelector') {
        await page.waitForSelector(String(step.selector), { timeout: step.timeoutMs || defaultTimeoutMs });
        continue;
      }

      if (action === 'waitForTimeout') {
        await page.waitForTimeout(Number(step.ms || 0));
        continue;
      }

      if (action === 'extractText') {
        const name = String(step.name || step.selector || `text_${Object.keys(outputs).length + 1}`);
        const text = await page.textContent(String(step.selector));
        outputs[name] = text;
        continue;
      }

      if (action === 'screenshot') {
        const outDir = ensureOutDir();
        const filePath = step.path
          ? path.resolve(String(step.path))
          : path.join(outDir, `shot_${Date.now()}_${Math.random().toString(16).slice(2)}.png`);
        await page.screenshot({ path: filePath, fullPage: step.fullPage !== false });
        screenshots.push(filePath);
        continue;
      }

      throw new Error(`Unknown browser action: ${action}`);
    }

    const finalUrl = page.url();
    const title = await page.title().catch(() => null);
    return { ok: true, finalUrl, title, outputs, screenshots };
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

const TOOLS = [
  {
    name: 'dummyos.ready',
    description: 'Return ConnectPro readiness snapshot.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: toolReady
  },
  {
    name: 'dummyos.connect',
    description: 'Provision services/capabilities via ConnectPro (capability-first, incremental).',
    inputSchema: {
      type: 'object',
      properties: {
        userMessage: { type: 'string' },
        userId: { type: 'string' }
      },
      required: ['userMessage', 'userId'],
      additionalProperties: false
    },
    handler: toolConnect
  },
  {
    name: 'dummyos.project.detect',
    description: 'Detect project framework, including static HTML projects, and whether Sentry deps are present.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string' }
      },
      additionalProperties: false
    },
    handler: toolProjectDetect
  },
  {
    name: 'dummyos.memory.checkpoint',
    description: 'Append a fast redacted checkpoint to .dummy/memory/SESSION.md to avoid losing work when sessions expire.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string' },
        event: { type: 'string' },
        phase: { type: 'string' },
        summary: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        data: { type: 'object' },
        maxBytes: { type: 'number' }
      },
      required: ['event'],
      additionalProperties: false
    },
    handler: toolMemoryCheckpoint
  },
  {
    name: 'dummyos.preview.start',
    description: 'Start the PreviewBridge live static preview server with soft HTML refresh, CSS hot swap, virtual no-save updates, and automatic port fallback.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string' },
        root: { type: 'string' },
        port: { type: 'number' },
        preferredPort: { type: 'number' },
        host: { type: 'string' },
        indexFile: { type: 'string' },
        reloadDelayMs: { type: 'number' },
        watch: { type: 'boolean' },
        html: { type: 'string' },
        virtualFiles: { type: 'object' }
      },
      additionalProperties: false
    },
    handler: toolPreviewStart
  },
  {
    name: 'dummyos.preview.update',
    description: 'Update a running PreviewBridge preview with in-memory files so the browser reflects changes without saving to disk.',
    inputSchema: {
      type: 'object',
      properties: {
        previewId: { type: 'string' },
        html: { type: 'string' },
        files: { type: 'object' }
      },
      required: ['previewId'],
      additionalProperties: false
    },
    handler: toolPreviewUpdate
  },
  {
    name: 'dummyos.preview.stop',
    description: 'Stop a running PreviewBridge live preview server.',
    inputSchema: {
      type: 'object',
      properties: {
        previewId: { type: 'string' }
      },
      required: ['previewId'],
      additionalProperties: false
    },
    handler: toolPreviewStop
  },
  {
    name: 'dummyos.preview.status',
    description: 'List running PreviewBridge live preview servers.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: toolPreviewStatus
  },
  {
    name: 'dummyos.sentry.detect',
    description: 'Detect Sentry SDK presence and DSN env hints.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string' }
      },
      additionalProperties: false
    },
    handler: toolSentryDetect
  },
  {
    name: 'dummyos.sentry.plan',
    description: 'Plan Sentry setup steps (uses ConnectPro for DSN if missing).',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string' },
        userId: { type: 'string' }
      },
      additionalProperties: false
    },
    handler: toolSentryPlan
  },
  {
    name: 'dummyos.web.fetch',
    description: 'Fetch an HTTP(S) URL (limited size) and return the response text.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        method: { type: 'string' },
        headers: { type: 'object' },
        body: {},
        timeoutMs: { type: 'number' },
        maxBytes: { type: 'number' }
      },
      required: ['url'],
      additionalProperties: false
    },
    handler: toolWebFetch
  },
  {
    name: 'dummyos.web.search',
    description: 'Web search (DuckDuckGo HTML) returning a small list of results.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        limit: { type: 'number' },
        timeoutMs: { type: 'number' },
        maxBytes: { type: 'number' }
      },
      required: ['query'],
      additionalProperties: false
    },
    handler: toolWebSearch
  },
  {
    name: 'dummyos.otp.extract',
    description: 'Extract numeric OTP codes from an email/text body.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        digits: { type: 'number' }
      },
      required: ['text'],
      additionalProperties: false
    },
    handler: toolOtpExtract
  },
  {
    name: 'dummyos.mcp.discover',
    description: 'Discover MCP/tooling candidates for a service via web search.',
    inputSchema: {
      type: 'object',
      properties: {
        service: { type: 'string' },
        query: { type: 'string' },
        limit: { type: 'number' }
      },
      additionalProperties: false
    },
    handler: toolMcpDiscover
  },
  {
    name: 'dummyos.browser.run',
    description: 'Run a small Playwright browser script (goto/click/fill/extract/screenshot).',
    inputSchema: {
      type: 'object',
      properties: {
        steps: { type: 'array', items: { type: 'object' } },
        headless: { type: 'boolean' },
        channel: { type: 'string' },
        slowMo: { type: 'number' },
        timeoutMs: { type: 'number' }
      },
      required: ['steps'],
      additionalProperties: false
    },
    handler: toolBrowserRun
  }
];

function listTools() {
  return TOOLS.map(({ handler, ...tool }) => tool);
}

async function callTool(name, args) {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  return tool.handler(args || {});
}

module.exports = {
  listTools,
  callTool
};
