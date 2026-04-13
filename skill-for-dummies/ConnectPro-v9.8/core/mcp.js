module.exports = {
  async createMCP(raw) {
    const services = Array.isArray(raw?.services) ? raw.services : [];
    const proxyCredentials = services.map((service) => ({
      service: service.service,
      proxyKey: service.proxyKey,
      strategy: service.strategy || null,
      mode: service.mode || null,
      engine: service.engine || null,
      envVars: Object.keys(service.env || {}).sort()
    }));

    return {
      id: 'mcp_' + Date.now(),
      version: "1.0",
      context: "Tresformar SuperApp",
      capabilities: services.map(s => s.service),
      proxyCredential: proxyCredentials[0]?.proxyKey,
      proxyCredentials,
      envFile: raw?.envFile || null,
      status: "active",
      createdAt: new Date()
    };
  }
};
