const { spawnSync } = require('node:child_process');

const TOKEN_ENV_BY_SERVICE = {
  figma: 'FIGMA_TOKEN',
  github: 'GITHUB_TOKEN',
  google: 'GOOGLE_CLIENT_SECRET',
  stripe: 'STRIPE_SECRET_KEY',
  supabase: 'SUPABASE_SERVICE_ROLE_KEY',
  vercel: 'VERCEL_TOKEN'
};

function runCommand(command, args = [], { runner = spawnSync, cwd, env = process.env, timeoutMs = 15000 } = {}) {
  return runner(command, args, {
    cwd,
    env,
    encoding: 'utf8',
    timeout: timeoutMs,
    windowsHide: true
  });
}

function commandAvailable(command, options = {}) {
  const result = runCommand(command, ['--version'], options);
  return !result.error && result.status === 0;
}

function normalizeService(connector) {
  return String(connector?.service || '').toLowerCase();
}

function credentialsFromEnv(connector, env = process.env) {
  const service = normalizeService(connector);
  const tokenEnv = TOKEN_ENV_BY_SERVICE[service];
  const token = tokenEnv ? env[tokenEnv] : null;

  if (!token) return null;

  return {
    realKey: token,
    env: {
      [tokenEnv]: token
    }
  };
}

async function runCliForConnector(connector, options = {}) {
  const service = normalizeService(connector);
  const envCredentials = credentialsFromEnv(connector, options.env);
  if (envCredentials) {
    return {
      success: true,
      mode: 'cli_env',
      credentials: envCredentials
    };
  }

  if (service === 'vercel') {
    if (!commandAvailable('vercel', options)) {
      return { success: false, reason: 'cli-unavailable' };
    }

    const whoami = runCommand('vercel', ['whoami'], options);
    if (whoami.error || whoami.status !== 0) {
      return { success: false, reason: 'cli-auth-unavailable' };
    }

    return { success: false, reason: 'cli-auth-token-unavailable' };
  }

  return { success: false, reason: 'cli-strategy-unsupported' };
}

async function runCodebaseCliForConnector(connector, options = {}) {
  const service = normalizeService(connector);
  const envCredentials = credentialsFromEnv(connector, options.env);
  if (envCredentials) {
    return {
      success: true,
      mode: 'codebase_cli_env',
      credentials: envCredentials
    };
  }

  if (service === 'github') {
    if (!commandAvailable('gh', options)) {
      return { success: false, reason: 'codebase-cli-unavailable' };
    }

    const tokenResult = runCommand('gh', ['auth', 'token'], options);
    const token = String(tokenResult.stdout || '').trim();
    if (tokenResult.error || tokenResult.status !== 0 || !token) {
      return { success: false, reason: 'github-token-unavailable' };
    }

    const env = { GITHUB_TOKEN: token };
    const userResult = runCommand('gh', ['api', 'user', '--jq', '.login'], options);
    const username = String(userResult.stdout || '').trim();
    if (!userResult.error && userResult.status === 0 && username) {
      env.GITHUB_USERNAME = username;
    }

    return {
      success: true,
      mode: 'codebase_cli',
      credentials: {
        realKey: token,
        env
      }
    };
  }

  return { success: false, reason: 'codebase-cli-strategy-unsupported' };
}

function getCliStrategyStatus(connector, strategy, options = {}) {
  const service = normalizeService(connector);
  const env = options.env || process.env;

  if (credentialsFromEnv(connector, env)) {
    return { name: strategy, available: true, source: 'env' };
  }

  if (strategy === 'cli' && service === 'vercel') {
    return {
      name: strategy,
      available: commandAvailable('vercel', options),
      source: 'vercel-cli'
    };
  }

  if (strategy === 'codebase_cli' && service === 'github') {
    return {
      name: strategy,
      available: commandAvailable('gh', options),
      source: 'gh-cli'
    };
  }

  return {
    name: strategy,
    available: false,
    source: 'unsupported-cli-strategy'
  };
}

module.exports = {
  commandAvailable,
  credentialsFromEnv,
  getCliStrategyStatus,
  runCliForConnector,
  runCodebaseCliForConnector
};
