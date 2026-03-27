const fs = require('node:fs');
const axios = require('axios');

function readInput() {
  const raw = fs.readFileSync(0, 'utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

function writeOutput(value) {
  process.stdout.write(JSON.stringify(value));
}

function findFixtureSearchResults(searchResults, query) {
  if (!searchResults || typeof searchResults !== 'object') return [];

  if (Array.isArray(searchResults[query])) {
    return searchResults[query];
  }

  const normalizedQuery = String(query || '').toLowerCase();
  const matchedKey = Object.keys(searchResults).find((key) => {
    const normalizedKey = String(key).toLowerCase();
    return normalizedKey.includes(normalizedQuery) || normalizedQuery.includes(normalizedKey);
  });

  return matchedKey ? searchResults[matchedKey] : [];
}

function loadFixture() {
  const fixturePath = process.env.CONNECTPRO_INBOX_FIXTURE_PATH;
  if (!fixturePath) return null;
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
}

async function executeFixture(payload, fixture) {
  if (payload.action === 'search') {
    return {
      messages: findFixtureSearchResults(fixture.searchResults, payload.query).slice(0, payload.maxResults || 3)
    };
  }

  if (payload.action === 'read') {
    return {
      message: fixture.messages?.[payload.messageId] || null
    };
  }

  throw new Error(`Unsupported inbox action: ${payload.action}`);
}

async function executeHttp(payload) {
  const headers = process.env.CONNECTPRO_INBOX_BRIDGE_TOKEN
    ? { Authorization: `Bearer ${process.env.CONNECTPRO_INBOX_BRIDGE_TOKEN}` }
    : {};

  if (payload.action === 'search') {
    const response = await axios.post(
      process.env.CONNECTPRO_INBOX_BRIDGE_SEARCH_URL,
      { query: payload.query, maxResults: payload.maxResults || 3 },
      { headers }
    );
    return { messages: response.data.messages || response.data.results || [] };
  }

  if (payload.action === 'read') {
    const response = await axios.post(
      process.env.CONNECTPRO_INBOX_BRIDGE_READ_URL,
      { messageId: payload.messageId },
      { headers }
    );
    return { message: response.data.message || response.data };
  }

  throw new Error(`Unsupported inbox action: ${payload.action}`);
}

async function main() {
  const payload = readInput();
  writeOutput(await handleInboxBridgePayload(payload));
}

async function handleInboxBridgePayload(payload) {
  const fixture = loadFixture();

  if (fixture) {
    return executeFixture(payload, fixture);
  }

  if (process.env.CONNECTPRO_INBOX_BRIDGE_SEARCH_URL && process.env.CONNECTPRO_INBOX_BRIDGE_READ_URL) {
    return executeHttp(payload);
  }

  throw new Error('Inbox bridge is not configured');
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(String(error.message || error));
    process.exit(1);
  });
}

module.exports = {
  handleInboxBridgePayload
};
