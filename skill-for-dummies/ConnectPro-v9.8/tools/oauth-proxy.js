const crypto = require('crypto');

module.exports = {
  async createProxyCredential(service, real, userId, metadata = {}) {
    const proxyKey = 'proxy_' + crypto.randomBytes(16).toString('hex');
    // Salva real criptografado (em produção usa vault)
    return {
      service,
      proxyKey,
      realKey: real.realKey,
      env: real.env || null,
      ...metadata
    };
  }
};
