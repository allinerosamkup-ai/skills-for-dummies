async function runValidator(rawProvision, security) {
  const hasServices = Array.isArray(rawProvision?.services) && rawProvision.services.length > 0;
  const passedSecurity = Boolean(security?.passed);

  return {
    valid: passedSecurity && hasServices,
    confidence: 0.95,
    error: passedSecurity ? 'Nenhum serviço provisionado.' : 'Falha na verificação de segurança.'
  };
}

module.exports = runValidator;
module.exports.runValidator = runValidator;
