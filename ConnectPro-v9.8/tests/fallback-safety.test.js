const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

function withEnv(overrides, fn) {
  const previous = {};
  for (const [key, value] of Object.entries(overrides)) {
    previous[key] = process.env[key];
    if (value == null) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const [key, value] of Object.entries(previous)) {
        if (value == null) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    });
}

test('stripe fallback uses real env credentials when available and does not simulate by default', async () => {
  const { provisionStripe } = require(localPath('tools', 'stripe-tool.js'));

  await withEnv(
    {
      STRIPE_SECRET_KEY: 'sk_live_real',
      CONNECTPRO_ALLOW_MOCK_FALLBACK: null
    },
    async () => {
      const result = await provisionStripe();
      assert.equal(result.realKey, 'sk_live_real');
      assert.equal(result.mock, false);
    }
  );

  await withEnv(
    {
      STRIPE_SECRET_KEY: null,
      CONNECTPRO_ALLOW_MOCK_FALLBACK: null
    },
    async () => {
      const result = await provisionStripe();
      assert.equal(result, null);
    }
  );
});

test('supabase fallback uses real env credentials and only mocks with explicit opt-in', async () => {
  const { provisionSupabase } = require(localPath('tools', 'supabase-tool.js'));

  await withEnv(
    {
      SUPABASE_SERVICE_ROLE_KEY: 'sb_service_role',
      NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_anon',
      CONNECTPRO_ALLOW_MOCK_FALLBACK: null
    },
    async () => {
      const result = await provisionSupabase();
      assert.equal(result.realKey, 'sb_service_role');
      assert.equal(result.env.NEXT_PUBLIC_SUPABASE_URL, 'https://project.supabase.co');
      assert.equal(result.mock, false);
    }
  );

  await withEnv(
    {
      SUPABASE_SERVICE_ROLE_KEY: null,
      NEXT_PUBLIC_SUPABASE_URL: null,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: null,
      CONNECTPRO_ALLOW_MOCK_FALLBACK: 'true'
    },
    async () => {
      const result = await provisionSupabase();
      assert.equal(result.mock, true);
      assert.match(result.realKey, /^sb_simulado_/);
    }
  );
});
