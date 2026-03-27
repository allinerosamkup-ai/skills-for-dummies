const axios = require('axios');

function buildHeaders(config) {
  const headers = { ...(config.headers || {}) };
  if (config.tokenEnv && process.env[config.tokenEnv]) {
    const scheme = config.authScheme || 'Bearer';
    const headerName = config.authHeader || 'Authorization';
    headers[headerName] = `${scheme} ${process.env[config.tokenEnv]}`;
  }
  return headers;
}

async function runApiHttpForConnector(connector, { httpClient = axios } = {}) {
  if (!connector?.apiHttp?.url) {
    return { success: false, reason: 'api-config-missing', service: connector?.service || null };
  }

  const config = connector.apiHttp;
  if (config.tokenEnv && !process.env[config.tokenEnv]) {
    return { success: false, reason: 'api-token-missing', service: connector.service };
  }

  const requestConfig = {
    url: config.url,
    method: config.method || 'GET',
    headers: buildHeaders(config),
    data: typeof config.buildRequest === 'function'
      ? config.buildRequest({ service: connector.service })
      : config.body || undefined
  };

  const response = await httpClient.request(requestConfig);
  const responseData = response.data;
  const credentials = typeof config.transformResponse === 'function'
    ? config.transformResponse(responseData)
    : responseData.credentials || null;

  return {
    success: true,
    service: connector.service,
    mode: 'api_http',
    credentials,
    raw: responseData
  };
}

module.exports = {
  runApiHttpForConnector
};
