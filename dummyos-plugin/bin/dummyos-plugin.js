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
    const jsonArgs = args[2] || '{}';
    if (!toolName) {
      usage();
      process.exit(2);
    }

    const parsed = JSON.parse(jsonArgs);
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

