const crypto = require('crypto');

function buildCredentialEnv(service, real) {
  const serviceName = String(service || '').toLowerCase();
  const env = {
    ...(real?.env || {})
  };

  if (serviceName === 'stripe') {
    if (real?.realKey && !env.STRIPE_SECRET_KEY) {
      env.STRIPE_SECRET_KEY = real.realKey;
    }
    if (real?.publishableKey && !env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = real.publishableKey;
    }
  }

  if (serviceName === 'supabase') {
    if (real?.realKey && !env.SUPABASE_SERVICE_ROLE_KEY) {
      env.SUPABASE_SERVICE_ROLE_KEY = real.realKey;
    }
    if (real?.projectUrl && !env.NEXT_PUBLIC_SUPABASE_URL) {
      env.NEXT_PUBLIC_SUPABASE_URL = real.projectUrl;
    }
    if (real?.anonKey && !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY = real.anonKey;
    }
  }

  if (serviceName === 'github' && real?.realKey && !env.GITHUB_TOKEN) {
    env.GITHUB_TOKEN = real.realKey;
  }

  if (serviceName === 'vercel' && real?.realKey && !env.VERCEL_TOKEN) {
    env.VERCEL_TOKEN = real.realKey;
  }

  if (serviceName === 'google' && real?.realKey && !env.GOOGLE_CLIENT_SECRET) {
    env.GOOGLE_CLIENT_SECRET = real.realKey;
  }

  return Object.keys(env).length > 0 ? env : null;
}

module.exports = {
  async createProxyCredential(service, real, userId, metadata = {}) {
    const proxyKey = 'proxy_' + crypto.randomBytes(16).toString('hex');
    // Salva real criptografado (em produção usa vault)
    return {
      service,
      proxyKey,
      realKey: real.realKey,
      env: buildCredentialEnv(service, real),
      publishableKey: real.publishableKey || null,
      projectUrl: real.projectUrl || null,
      anonKey: real.anonKey || null,
      ...metadata
    };
  },
  buildCredentialEnv
};
