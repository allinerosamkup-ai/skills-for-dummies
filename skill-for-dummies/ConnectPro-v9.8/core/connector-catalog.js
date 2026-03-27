const CONNECTOR_CATALOG = {
  stripe: {
    service: 'stripe',
    aliases: ['stripe', 'checkout', 'payment'],
    strategies: ['browser_auto', 'api_http'],
    confirmationContext: {
      pageName: 'connectpro-stripe',
      codeInputSelector: 'input[type="text"], input[type="tel"], input[name*="code"]',
      submitSelector: 'button[type="submit"], button:has-text("Verify"), button:has-text("Confirm")'
    },
    apiHttp: {
      url: process.env.CONNECTPRO_STRIPE_API_URL || 'https://api.stripe.com/v1/account',
      method: 'GET',
      tokenEnv: 'STRIPE_SECRET_KEY',
      transformResponse: (data) => ({
        realKey: process.env.STRIPE_SECRET_KEY || null,
        env: {
          STRIPE_ACCOUNT_ID: data.id || null
        }
      })
    },
    emailLoop: {
      queries: ['stripe verification OR confirm OR code']
    },
    browserAutomation: {
      mode: 'connect',
      script: () => `
const page = await browser.getPage("connectpro-stripe");
await page.goto("https://dashboard.stripe.com/test/apikeys");
const publishable = await page.locator('[data-testid="api-key-publishable"] code').textContent();
await page.locator('button:has-text("Reveal test key")').click();
const secret = await page.locator('[data-testid="api-key-secret"] code').textContent();
console.log(JSON.stringify({
  service: "stripe",
  credentials: {
    realKey: secret?.trim(),
    publishableKey: publishable?.trim()
  }
}));
`
    }
  },
  supabase: {
    service: 'supabase',
    aliases: ['supabase', 'postgres', 'database'],
    strategies: ['mcp_direct', 'browser_auto', 'api_http'],
    confirmationContext: {
      pageName: 'connectpro-supabase',
      codeInputSelector: 'input[type="text"], input[type="tel"], input[name*="token"], input[name*="code"]',
      submitSelector: 'button[type="submit"], button:has-text("Verify"), button:has-text("Confirm")'
    },
    mcpDirect: {
      operation: 'provision_supabase',
      input: {
        region: process.env.CONNECTPRO_SUPABASE_REGION || 'sa-east-1'
      }
    },
    emailLoop: {
      queries: ['supabase confirm your email OR magic link OR verification']
    }
  },
  figma: {
    service: 'figma',
    aliases: ['figma'],
    strategies: ['mcp_direct', 'browser_auto'],
    mcpDirect: {
      operation: 'connect_figma',
      input: {}
    }
  },
  google: {
    service: 'google',
    aliases: ['google', 'google oauth', 'google cloud', 'gmail'],
    strategies: ['browser_auto', 'email_loop', 'api_http'],
    confirmationContext: {
      pageName: 'connectpro-google',
      codeInputSelector: 'input[type="text"], input[type="tel"], input[name*="code"]',
      submitSelector: 'button[type="submit"], button:has-text("Next"), button:has-text("Verify"), button:has-text("Confirm")'
    },
    emailLoop: {
      queries: ['google verification code', 'google confirm account']
    },
    browserAutomation: {
      mode: 'connect',
      script: () => `
const page = await browser.getPage("connectpro-google");
await page.goto("https://console.cloud.google.com/apis/credentials");
console.log(JSON.stringify({ service: "google", ready: true }));
`
    }
  },
  github: {
    service: 'github',
    aliases: ['github', 'gh'],
    strategies: ['api_http', 'browser_auto', 'codebase_cli'],
    confirmationContext: {
      pageName: 'connectpro-github',
      codeInputSelector: 'input[type="text"], input[type="tel"], input[name*="code"]',
      submitSelector: 'button[type="submit"], button:has-text("Verify"), button:has-text("Confirm")'
    },
    apiHttp: {
      url: process.env.CONNECTPRO_GITHUB_API_URL || 'https://api.github.com/user',
      method: 'GET',
      tokenEnv: 'GITHUB_TOKEN',
      transformResponse: (data) => ({
        realKey: process.env.GITHUB_TOKEN || null,
        env: {
          GITHUB_USERNAME: data.login || null
        }
      })
    },
    emailLoop: {
      queries: ['github verify email OR confirm sign in']
    }
  },
  vercel: {
    service: 'vercel',
    aliases: ['vercel'],
    strategies: ['cli', 'browser_auto'],
    confirmationContext: {
      pageName: 'connectpro-vercel',
      codeInputSelector: 'input[type="text"], input[type="tel"], input[name*="code"]',
      submitSelector: 'button[type="submit"], button:has-text("Verify"), button:has-text("Join"), button:has-text("Confirm")'
    },
    emailLoop: {
      queries: ['vercel verify OR team invite OR confirmation']
    },
    browserAutomation: {
      mode: 'connect',
      script: () => `
const page = await browser.getPage("connectpro-vercel");
await page.goto("https://vercel.com/account/tokens");
console.log(JSON.stringify({ service: "vercel", ready: true }));
`
    }
  }
};

const STRATEGY_PRIORITY = {
  mcp_direct: 1,
  api_http: 2,
  browser_auto: 3,
  cli: 4,
  codebase_cli: 4,
  tutorial_manual: 5
};

function getConnector(service) {
  if (!service) return null;
  return CONNECTOR_CATALOG[String(service).toLowerCase()] || null;
}

function getOrderedStrategies(serviceOrConnector) {
  const connector = typeof serviceOrConnector === 'string'
    ? getConnector(serviceOrConnector)
    : serviceOrConnector;

  if (!connector) return [];

  return [...(connector.strategies || [])].sort((left, right) => {
    const leftPriority = STRATEGY_PRIORITY[left] ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = STRATEGY_PRIORITY[right] ?? Number.MAX_SAFE_INTEGER;
    return leftPriority - rightPriority;
  });
}

function resolveConnectorStep(step) {
  const value = String(step || '').toLowerCase();

  for (const connector of Object.values(CONNECTOR_CATALOG)) {
    if (connector.aliases.some((alias) => value.includes(alias))) {
      return connector;
    }
  }

  return null;
}

module.exports = {
  CONNECTOR_CATALOG,
  getConnector,
  getOrderedStrategies,
  resolveConnectorStep
};
