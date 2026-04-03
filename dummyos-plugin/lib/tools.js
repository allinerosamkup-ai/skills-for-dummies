const fs = require('fs');
const path = require('path');
const os = require('os');

function normalizePath(p) {
  if (!p) return null;
  return path.resolve(String(p));
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

  let browser;
  try {
    browser = await playwright.chromium.launch({ headless, slowMo });
  } catch (err) {
    const msg = String(err?.message || err);
    const hint =
      msg.includes("Executable doesn't exist") || msg.includes('run the following command to download new browsers')
        ? 'Playwright browsers not installed. Run: `npx playwright install chromium` (requires disk space).'
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
    description: 'Detect project framework and whether Sentry deps are present.',
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
