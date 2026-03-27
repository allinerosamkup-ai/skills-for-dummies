const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('api http executes configured request and extracts credentials', async (t) => {
  const apiHttp = require(localPath('tools', 'api-http.js'));
  const previousToken = process.env.TEST_API_TOKEN;
  process.env.TEST_API_TOKEN = 'token-123';

  t.after(() => {
    if (previousToken === undefined) delete process.env.TEST_API_TOKEN;
    else process.env.TEST_API_TOKEN = previousToken;
  });

  const result = await apiHttp.runApiHttpForConnector(
    {
      service: 'github',
      apiHttp: {
        url: 'https://api.example.com/me',
        method: 'GET',
        tokenEnv: 'TEST_API_TOKEN',
        transformResponse: (data) => ({
          realKey: data.token,
          env: { GITHUB_USERNAME: data.login }
        })
      }
    },
    {
      httpClient: {
        request: async (config) => ({
          data: {
            login: 'allin',
            token: 'ghp_real'
          },
          config
        })
      }
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.mode, 'api_http');
  assert.equal(result.credentials.realKey, 'ghp_real');
  assert.equal(result.raw.login, 'allin');
});
