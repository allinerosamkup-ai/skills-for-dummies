function isMockFallbackAllowed() {
  return String(process.env.CONNECTPRO_ALLOW_MOCK_FALLBACK || '').toLowerCase() === 'true';
}

async function provisionSupabase() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      realKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || null
      },
      mock: false
    };
  }

  if (!isMockFallbackAllowed()) {
    return null;
  }

  const simulatedKey = `sb_simulado_${Date.now()}`;
  return {
    realKey: simulatedKey,
    env: {
      SUPABASE_SERVICE_ROLE_KEY: simulatedKey
    },
    mock: true
  };
}

module.exports = {
  provisionSupabase
};
