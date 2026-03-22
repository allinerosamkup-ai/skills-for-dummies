module.exports = {
  async provisionSupabase() {
    return { realKey: "sb_simulado_" + Date.now() };
  }
};
