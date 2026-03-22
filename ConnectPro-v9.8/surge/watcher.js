class SurgeWatcher {
  constructor(userId) {
    this.userId = userId;
  }
  monitor(mcp) {
    console.log(`SURGE ativado para ${this.userId} — monitorando ${mcp.id} 24/7`);
    // Em produção: setInterval checando expiração
  }
}

module.exports = SurgeWatcher;
