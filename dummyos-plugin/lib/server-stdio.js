const readline = require('readline');
const { listTools, callTool } = require('./tools');

function reply(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

function errorReply(id, code, message, data) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message, data } }) + '\n');
}

async function handleMessage(msg) {
  const { id, method, params } = msg;

  if (method === 'initialize') {
    return reply(id, {
      protocolVersion: '2024-11-05',
      serverInfo: { name: 'dummyos-plugin', version: '0.2.0' },
      capabilities: { tools: {} }
    });
  }

  if (method === 'tools/list') {
    return reply(id, { tools: listTools() });
  }

  if (method === 'tools/call') {
    try {
      const name = params?.name;
      const args = params?.arguments || {};
      const data = await callTool(name, args);
      return reply(id, { content: [{ type: 'text', text: JSON.stringify(data) }] });
    } catch (err) {
      return errorReply(id, -32000, 'Tool call failed', { message: err?.message || String(err) });
    }
  }

  return errorReply(id, -32601, 'Method not found', { method });
}

function start() {
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  rl.on('line', (line) => {
    const trimmed = String(line || '').trim();
    if (!trimmed) return;

    let msg;
    try {
      msg = JSON.parse(trimmed);
    } catch {
      return;
    }

    Promise.resolve(handleMessage(msg)).catch(() => {});
  });
}

module.exports = { start };

if (require.main === module) {
  start();
}
