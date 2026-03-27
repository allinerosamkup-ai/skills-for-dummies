const fs = require('node:fs');
const axios = require('axios');

function readInput() {
  const raw = fs.readFileSync(0, 'utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

function writeOutput(value) {
  process.stdout.write(JSON.stringify(value));
}

function loadFixture() {
  const fixturePath = process.env.CONNECTPRO_MCP_FIXTURE_PATH;
  if (!fixturePath) return null;
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
}

function resolveFixtureOperation(fixture, payload) {
  if (fixture.operations?.[payload.operation]) {
    return fixture.operations[payload.operation];
  }

  if (fixture.services?.[payload.service]) {
    return fixture.services[payload.service];
  }

  return null;
}

async function executeFixture(payload, fixture) {
  const resolved = resolveFixtureOperation(fixture, payload);
  if (!resolved) {
    throw new Error(`MCP fixture operation not found: ${payload.operation || payload.service || 'unknown'}`);
  }

  return {
    service: payload.service,
    operation: payload.operation,
    ...(typeof resolved === 'object' ? resolved : {})
  };
}

async function executeHttp(payload) {
  const headers = process.env.CONNECTPRO_MCP_BRIDGE_TOKEN
    ? { Authorization: `Bearer ${process.env.CONNECTPRO_MCP_BRIDGE_TOKEN}` }
    : {};

  const response = await axios.post(process.env.CONNECTPRO_MCP_BRIDGE_URL, payload, { headers });
  return response.data;
}

async function main() {
  const payload = readInput();
  writeOutput(await handleMcpBridgePayload(payload));
}

async function handleMcpBridgePayload(payload) {
  const fixture = loadFixture();

  if (fixture) {
    return executeFixture(payload, fixture);
  }

  if (process.env.CONNECTPRO_MCP_BRIDGE_URL) {
    return executeHttp(payload);
  }

  throw new Error('MCP bridge is not configured');
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(String(error.message || error));
    process.exit(1);
  });
}

module.exports = {
  handleMcpBridgePayload
};
