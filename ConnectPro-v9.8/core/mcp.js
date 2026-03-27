module.exports = {
  async createMCP(raw) {
    const services = Array.isArray(raw?.services) ? raw.services : [];
    const proxyCredentials = services.map((service) => ({
      service: service.service,
      proxyKey: service.proxyKey
    }));

    return {
      id: 'mcp_' + Date.now(),
      version: "1.0",
      context: "Tresformar SuperApp",
      capabilities: services.map(s => s.service),
      proxyCredential: proxyCredentials[0]?.proxyKey,
      proxyCredentials,
      status: "active",
      createdAt: new Date()
    };
  }
};
