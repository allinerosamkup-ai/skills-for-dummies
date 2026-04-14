const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_SECRET_ENV_BY_SERVICE = {
  figma: 'FIGMA_TOKEN',
  github: 'GITHUB_TOKEN',
  google: 'GOOGLE_CLIENT_SECRET',
  stripe: 'STRIPE_SECRET_KEY',
  supabase: 'SUPABASE_SERVICE_ROLE_KEY',
  vercel: 'VERCEL_TOKEN'
};

function isEnvKey(key) {
  return /^[A-Z][A-Z0-9_]*$/.test(String(key || ''));
}

function normalizeEnvValue(value) {
  if (value == null) return null;
  const normalized = String(value);
  if (!normalized || normalized.includes('\n') || normalized.includes('\r')) return null;
  return normalized;
}

function envFromService(service) {
  const env = {};
  const serviceName = String(service?.service || '').toLowerCase();
  const explicitEnv = service?.env && typeof service.env === 'object' ? service.env : {};

  for (const [key, value] of Object.entries(explicitEnv)) {
    const normalized = normalizeEnvValue(value);
    if (!isEnvKey(key) || normalized == null) continue;
    env[key] = normalized;
  }

  const secretEnv = DEFAULT_SECRET_ENV_BY_SERVICE[serviceName];
  const realKey = normalizeEnvValue(service?.realKey);
  if (secretEnv && realKey && !env[secretEnv]) {
    env[secretEnv] = realKey;
  }

  const publishableKey = normalizeEnvValue(service?.publishableKey);
  if (serviceName === 'stripe' && publishableKey && !env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = publishableKey;
  }

  const supabaseUrl = normalizeEnvValue(service?.projectUrl || service?.url);
  if (serviceName === 'supabase' && supabaseUrl && !env.NEXT_PUBLIC_SUPABASE_URL) {
    env.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;
  }

  const supabaseAnonKey = normalizeEnvValue(service?.anonKey);
  if (serviceName === 'supabase' && supabaseAnonKey && !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY = supabaseAnonKey;
  }

  return env;
}

function collectEnvVars(rawProvision) {
  const services = Array.isArray(rawProvision?.services) ? rawProvision.services : [];
  const collected = {};

  for (const service of services) {
    Object.assign(collected, envFromService(service));
  }

  return collected;
}

function resolveProjectPath(projectPath) {
  return path.resolve(
    projectPath ||
    process.env.CONNECTPRO_PROJECT_PATH ||
    process.env.DUMMYOS_PROJECT_ROOT ||
    process.cwd()
  );
}

function formatEnvLine(key, value) {
  if (/^[^\s#"'\\]+$/.test(value)) {
    return `${key}=${value}`;
  }

  return `${key}=${JSON.stringify(value)}`;
}

function upsertEnvText(existingText, envVars) {
  const lines = String(existingText || '').split(/\r?\n/);
  if (lines.length === 1 && lines[0] === '') {
    lines.pop();
  }

  const keys = Object.keys(envVars).sort();
  const written = new Set();

  for (let index = 0; index < lines.length; index++) {
    const keyMatch = lines[index].match(/^\s*([A-Z][A-Z0-9_]*)\s*=/);
    if (!keyMatch) continue;

    const key = keyMatch[1];
    if (!Object.prototype.hasOwnProperty.call(envVars, key)) continue;

    lines[index] = formatEnvLine(key, envVars[key]);
    written.add(key);
  }

  const missing = keys.filter((key) => !written.has(key));
  if (missing.length > 0 && lines.length > 0 && lines[lines.length - 1] !== '') {
    lines.push('');
  }

  for (const key of missing) {
    lines.push(formatEnvLine(key, envVars[key]));
  }

  return `${lines.join('\n').replace(/\n*$/, '')}\n`;
}

async function writeEnvFile(rawProvision, { projectPath, fileName = '.env.local' } = {}) {
  const envVars = collectEnvVars(rawProvision);
  const variables = Object.keys(envVars).sort();
  const root = resolveProjectPath(projectPath);
  const envPath = path.join(root, fileName);

  if (variables.length === 0) {
    return {
      path: envPath,
      variables,
      written: false
    };
  }

  fs.mkdirSync(root, { recursive: true });
  const existingText = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const nextText = upsertEnvText(existingText, envVars);
  fs.writeFileSync(envPath, nextText, 'utf8');

  return {
    path: envPath,
    variables,
    written: true
  };
}

module.exports = {
  collectEnvVars,
  envFromService,
  resolveProjectPath,
  upsertEnvText,
  writeEnvFile
};
