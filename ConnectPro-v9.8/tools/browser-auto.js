const { spawnSync } = require('child_process');
const { getConnector, resolveConnectorStep } = require('../core/connector-catalog');
const { runConnectProBrowser } = require('./connectpro-browser');
const { runEmailLoop } = require('./email-loop');
const { resolveInboxProvider } = require('./inbox-provider');

function createDefaultEmailCompletionHandler({ internalRunner } = {}) {
  return async function defaultEmailCompletionHandler({ artifact, confirmationContext = {} }) {
    const { pageName = 'connectpro-confirmation', codeInputSelector, submitSelector } = confirmationContext;

    const execution = await runConnectProBrowser(
      {
        connect: true,
        script: async ({ browser }) => {
          const page = await browser.getPage(pageName);

          if (artifact.type === 'link') {
            await page.goto(artifact.value);
            return { completed: true, action: 'goto' };
          }

          if (artifact.type === 'code') {
            if (!codeInputSelector) {
              throw new Error('Missing codeInputSelector for code verification completion');
            }
            await page.locator(codeInputSelector).fill(artifact.value);
            if (submitSelector) {
              await page.locator(submitSelector).click();
            }
            return { completed: true, action: 'fill_code' };
          }

          throw new Error(`Unsupported verification artifact type: ${artifact.type}`);
        }
      },
      internalRunner ? { implementation: internalRunner } : undefined
    );

    return { ok: true, engine: execution.engine, result: execution.data };
  };
}

function buildDevBrowserArgs({ connect = false, headless = false } = {}) {
  if (connect) return ['--connect'];
  if (headless) return ['--headless'];
  return [];
}

function extractJsonFromOutput(output) {
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

  throw new SyntaxError('No JSON object found in dev-browser output');
}

function isDevBrowserAvailable({ executable = 'dev-browser', runner = spawnSync } = {}) {
  const result = runner(executable, ['--version'], {
    encoding: 'utf8',
    windowsHide: true
  });

  return !result.error && result.status === 0;
}

async function runDevBrowserScript(
  { script, connect = false, headless = false, executable = 'dev-browser', cwd, timeoutMs = 30000 },
  { runner = spawnSync } = {}
) {
  const result = runner(executable, buildDevBrowserArgs({ connect, headless }), {
    cwd,
    input: script,
    encoding: 'utf8',
    timeout: timeoutMs,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 4
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const stderr = String(result.stderr || '').trim();
    throw new Error(stderr || `dev-browser exited with status ${result.status}`);
  }

  return {
    success: true,
    engine: 'dev-browser',
    stdout: result.stdout,
    data: extractJsonFromOutput(result.stdout)
  };
}

function normalizeCredentials(data) {
  if (!data || typeof data !== 'object') return null;
  if (data.credentials) return data.credentials;

  const env = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => key === key.toUpperCase() && value != null)
  );

  if (Object.keys(env).length === 0) return null;

  return {
    realKey: env.STRIPE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.GITHUB_TOKEN || env.VERCEL_TOKEN || null,
    env
  };
}

async function runBrowserAutomationForStep(
  { step, service, connector, cwd },
  { runner = spawnSync, availabilityRunner = spawnSync, internalRunner, emailProvider, emailCompletionHandler } = {}
) {
  const resolved = connector || getConnector(service) || resolveConnectorStep(step);
  if (!resolved) {
    return { success: false, reason: 'unsupported-service' };
  }
  const resolvedEmailProvider = resolveInboxProvider(emailProvider);
  const resolvedCompletionHandler = emailCompletionHandler || createDefaultEmailCompletionHandler({ internalRunner });

  const browserAutomation = resolved.browserAutomation;
  if (!browserAutomation?.script) {
    return { success: false, reason: 'no-browser-script', service: resolved.service };
  }

  const script = typeof browserAutomation.script === 'function'
    ? browserAutomation.script({ step, service: resolved.service })
    : browserAutomation.script;

  try {
    const internalExecution = await runConnectProBrowser(
      {
        script,
        connect: browserAutomation.mode !== 'headless',
        headless: browserAutomation.mode === 'headless'
      },
      internalRunner ? { implementation: internalRunner } : undefined
    );

    const internalResult = {
      success: true,
      service: resolved.service,
      mode: 'browser_auto',
      engine: internalExecution.engine,
      credentials: normalizeCredentials(internalExecution.data),
      raw: internalExecution.data
    };

    if (internalExecution.data?.confirmationRequired && resolved.emailLoop && resolvedEmailProvider) {
      internalResult.verification = await runEmailLoop(
        {
          connector: resolved,
          service: resolved.service
        },
        {
          provider: resolvedEmailProvider,
          completionHandler: ({ artifact, message }) =>
            resolvedCompletionHandler({
              artifact,
              message,
              confirmationContext: {
                ...(resolved.confirmationContext || {}),
                ...(internalExecution.data?.confirmationContext || {})
              }
            })
        }
      );
    }

    return internalResult;
  } catch {}

  if (!isDevBrowserAvailable({ runner: availabilityRunner })) {
    return { success: false, reason: 'browser-automation-unavailable', service: resolved.service };
  }

  const execution = await runDevBrowserScript(
    {
      script,
      connect: browserAutomation.mode !== 'headless',
      headless: browserAutomation.mode === 'headless',
      cwd
    },
    { runner }
  );

  const fallbackResult = {
    success: true,
    service: resolved.service,
    mode: 'browser_auto',
    engine: execution.engine,
    credentials: normalizeCredentials(execution.data),
    raw: execution.data
  };

  if (execution.data?.confirmationRequired && resolved.emailLoop && resolvedEmailProvider) {
    fallbackResult.verification = await runEmailLoop(
      {
        connector: resolved,
        service: resolved.service
      },
      {
        provider: resolvedEmailProvider,
        completionHandler: ({ artifact, message }) =>
          resolvedCompletionHandler({
            artifact,
            message,
            confirmationContext: {
              ...(resolved.confirmationContext || {}),
              ...(execution.data?.confirmationContext || {})
            }
          })
      }
    );
  }

  return fallbackResult;
}

module.exports = {
  createDefaultEmailCompletionHandler,
  buildDevBrowserArgs,
  extractJsonFromOutput,
  isDevBrowserAvailable,
  runDevBrowserScript,
  runBrowserAutomationForStep
};
