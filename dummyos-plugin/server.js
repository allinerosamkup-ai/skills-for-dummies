const readline = require('readline');
const path = require('path');

function reply(id, result) {
  const msg = { jsonrpc: '2.0', id, result };
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function errorReply(id, code, message, data) {
  const msg = {
    jsonrpc: '2.0',
    id,
    error: { code, message, data }
  };
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function safeRequire(relPath) {
  // Resolve relative to repo root (one level above this folder)
  const repoRoot = path.resolve(__dirname, '..');
  return require(path.resolve(repoRoot, relPath));
}

const tools = [
  {
    name: 'dummyos.ready',
    description: 'Return ConnectPro readiness snapshot.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'dummyos.connect',
    description: 'Provision services/capabilities via ConnectPro (capability-first, incremental).',
    inputSchema: {
      type: 'object',
      properties: {
        userMessage: { type: 'string' },
        userId: { type: 'string' }
      },
      required: ['userMessage', 'userId'],
      additionalProperties: false
    }
  }
];

async function handleToolCall(name, args) {
  if (name === 'dummyos.ready') {
    const { getConnectProReadiness } = safeRequire('ConnectPro-v9.8/tools/connectpro-readiness');
    return { content: [{ type: 'text', text: JSON.stringify(getConnectProReadiness()) }] };
  }

  if (name === 'dummyos.connect') {
    const { runConnectPro } = safeRequire('ConnectPro-v9.8/agents/orchestrator');
    const result = await runConnectPro(args.userMessage, args.userId);
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }

  throw new Error(`Unknown tool: ${name}`);
}

async function handleMessage(msg) {
  const { id, method, params } = msg;

  if (method === 'initialize') {
    return reply(id, {
      protocolVersion: '2024-11-05',
      serverInfo: { name: 'dummyos-plugin', version: '0.1.0' },
      capabilities: { tools: {} }
    });
  }

  if (method === 'tools/list') {
    return reply(id, { tools });
  }

  if (method === 'tools/call') {
    try {
      const name = params?.name;
      const args = params?.arguments || {};
      const result = await handleToolCall(name, args);
      return reply(id, result);
    } catch (err) {
      return errorReply(id, -32000, 'Tool call failed', { message: err?.message || String(err) });
    }
  }

  return errorReply(id, -32601, 'Method not found', { method });
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', (line) => {
  const trimmed = String(line || '').trim();
  if (!trimmed) return;

  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch (err) {
    return;
  }

  Promise.resolve(handleMessage(msg)).catch(() => {});
});
