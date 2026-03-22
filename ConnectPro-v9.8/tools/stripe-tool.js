module.exports = {
  async provisionStripe() {
    // Em produção: chama Stripe API real (aqui mock seguro)
    return { realKey: "sk_live_simulado_" + Date.now() };
  }
};
