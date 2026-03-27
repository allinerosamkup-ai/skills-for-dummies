function isMockFallbackAllowed() {
  return String(process.env.CONNECTPRO_ALLOW_MOCK_FALLBACK || '').toLowerCase() === 'true';
}

async function provisionStripe() {
  if (process.env.STRIPE_SECRET_KEY) {
    return {
      realKey: process.env.STRIPE_SECRET_KEY,
      env: {
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || null,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || null
      },
      mock: false
    };
  }

  if (!isMockFallbackAllowed()) {
    return null;
  }

  const simulatedKey = `sk_live_simulado_${Date.now()}`;
  return {
    realKey: simulatedKey,
    env: {
      STRIPE_SECRET_KEY: simulatedKey
    },
    mock: true
  };
}

module.exports = {
  provisionStripe
};
