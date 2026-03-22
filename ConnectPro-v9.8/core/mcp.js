module.exports = {
  async createMCP(raw) {
    return {
      id: 'mcp_' + Date.now(),
      version: "1.0",
      context: "Tresformar SuperApp",
      capabilities: raw.services.map(s => s.service),
      proxyCredential: raw.services[0]?.proxyKey,
      status: "active",
      createdAt: new Date()
    };
  }
};
