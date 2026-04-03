#!/usr/bin/env node

const path = require('path');

function usage() {
  process.stdout.write(
    [
      'dummyos-plugin',
      '',
      'Usage:',
      '  dummyos-plugin start [--project <path>]',
      '  dummyos-plugin tools',
      '  dummyos-plugin call <toolName> <jsonArgs>',
      '',
      'Examples:',
      '  dummyos-plugin start --project "C:\\path\\to\\app"',
      '  dummyos-plugin tools',
      '  dummyos-plugin call dummyos.sentry.detect "{\\"projectPath\\":\\".\\"}"',
      ''
    ].join('\n')
  );
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === '--help' || cmd === '-h') {
    usage();
    process.exit(0);
  }

  if (cmd === 'start') {
    const projectIndex = args.indexOf('--project');
    if (projectIndex !== -1) {
      const projectPath = args[projectIndex + 1];
      if (projectPath) {
        process.env.DUMMYOS_PROJECT_ROOT = path.resolve(projectPath);
      }
    }

    const { start } = require('../lib/server-stdio');
    start();
    return;
  }

  if (cmd === 'tools') {
    const { listTools } = require('../lib/tools');
    process.stdout.write(JSON.stringify({ tools: listTools() }, null, 2) + '\n');
    return;
  }

  if (cmd === 'call') {
    const toolName = args[1];
    if (!toolName) {
      usage();
      process.exit(2);
    }

    const fs = require('node:fs');

    const readStdin = () =>
      new Promise((resolve, reject) => {
        let buf = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => {
          buf += chunk;
        });
        process.stdin.on('end', () => resolve(buf));
        process.stdin.on('error', reject);
      });

    const arg = args[2];
    let jsonText = '{}';
    if (arg === '-') {
      jsonText = await readStdin();
    } else if (typeof arg === 'string' && arg.startsWith('@')) {
      jsonText = fs.readFileSync(arg.slice(1), 'utf8');
    } else if (typeof arg === 'string') {
      jsonText = arg;
    }

    jsonText = String(jsonText ?? '').trim();
    if (!jsonText) jsonText = '{}';

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      process.stderr.write(
        `Invalid JSON args for tool "${toolName}". Use inline JSON, "-" for stdin, or "@file".\n`
      );
      throw err;
    }
    const { callTool } = require('../lib/tools');
    const result = await callTool(toolName, parsed);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return;
  }

  usage();
  process.exit(2);
}

main().catch((err) => {
  process.stderr.write(String(err?.stack || err?.message || err));
  process.exit(1);
});

