const DEFAULT_DEBUG_URL = process.env.CONNECTPRO_CHROME_DEBUG_URL || 'http://127.0.0.1:9222';

function buildLaunchOptions({ headless = true } = {}) {
  return { headless };
}

function extractJsonFromPageResult(output) {
  const text = String(output || '').trim();

  try {
    return JSON.parse(text);
  } catch {}

  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch) {
    return JSON.parse(fencedMatch[1]);
  }

  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '{' && text[i] !== '[') continue;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let j = i; j < text.length; j++) {
      const ch = text[j];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === '"') {
          inString = false;
        }
        continue;
      }

      if (ch === '"') {
        inString = true;
        continue;
      }

      if (ch === '{' || ch === '[') depth++;
      if (ch === '}' || ch === ']') depth--;

      if (depth === 0) {
        return JSON.parse(text.slice(i, j + 1));
      }
    }
  }

  throw new SyntaxError('No JSON object found in browser result');
}

function loadPlaywright() {
  try {
    return require('playwright');
  } catch (error) {
    error.message = `Playwright is required for connectpro-browser: ${error.message}`;
    throw error;
  }
}

function createNamedPageManager(context) {
  const namedPages = new Map();

  return {
    async getPage(name = 'connectpro') {
      if (namedPages.has(name) && !namedPages.get(name).isClosed()) {
        return namedPages.get(name);
      }
      const page = await context.newPage();
      namedPages.set(name, page);
      return page;
    },
    async listPages() {
      return context.pages().map((page, index) => ({
        id: String(index),
        url: page.url(),
        title: '',
        name: null
      }));
    }
  };
}

async function defaultImplementation({ script, connect = false, headless = false }) {
  const { chromium } = loadPlaywright();
  const browser = connect
    ? await chromium.connectOverCDP(DEFAULT_DEBUG_URL)
    : await chromium.launch(buildLaunchOptions({ headless }));

  let context = null;
  let ownsBrowser = !connect;

  try {
    context = browser.contexts ? browser.contexts()[0] : null;
    if (!context) {
      context = await browser.newContext();
    }

    const pageManager = createNamedPageManager(context);
    const page = await pageManager.getPage('connectpro');
    const logs = [];
    const logger = {
      log: (...args) => logs.push(args.map((arg) => String(arg)).join(' '))
    };

    let result = null;

    if (typeof script === 'function') {
      result = await script({ browser: pageManager, page, console: logger });
    } else if (typeof script === 'string') {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const runner = new AsyncFunction('browser', 'page', 'console', script);
      result = await runner(pageManager, page, logger);
    }

    const data = result ?? extractJsonFromPageResult(logs.join('\n'));
    return { engine: 'connectpro-browser', data };
  } finally {
    if (context && ownsBrowser) {
      await context.close();
    }
    if (browser && ownsBrowser) {
      await browser.close();
    }
  }
}

async function runConnectProBrowser(
  { script, connect = false, headless = false },
  { implementation = defaultImplementation } = {}
) {
  const execution = await implementation({ script, connect, headless });
  return {
    success: true,
    engine: execution.engine || 'connectpro-browser',
    data: execution.data
  };
}

module.exports = {
  buildLaunchOptions,
  extractJsonFromPageResult,
  runConnectProBrowser
};
