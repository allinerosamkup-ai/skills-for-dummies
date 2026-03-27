const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

function localPath(...parts) {
  return path.resolve(__dirname, '..', ...parts);
}

test('connector catalog exposes service-specific confirmation context', async () => {
  const catalog = require(localPath('core', 'connector-catalog.js'));

  const google = catalog.getConnector('google');
  const stripe = catalog.getConnector('stripe');

  assert.equal(google.confirmationContext.pageName, 'connectpro-google');
  assert.equal(google.confirmationContext.codeInputSelector, 'input[type="text"], input[type="tel"], input[name*="code"]');
  assert.equal(stripe.confirmationContext.pageName, 'connectpro-stripe');
  assert.equal(stripe.confirmationContext.submitSelector, 'button[type="submit"], button:has-text("Verify"), button:has-text("Confirm")');
});
