module.exports = async function runValidator(rawProvision, security) {
  return {
    valid: security.passed && rawProvision.services.length > 0,
    confidence: 0.95
  };
};
