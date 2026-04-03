import { existsSync } from 'fs'
import { join } from 'path'
import os from 'os'

const HOME = os.homedir()
const CWD = process.cwd()

export const AI_TOOLS = {
  'claude-code': {
    name: 'Claude Code',
    skillsDir: join(HOME, '.claude', 'skills'),
    rulesDir: null,
    systemPromptDir: null,
    detected: () => existsSync(join(HOME, '.claude'))
  },
  'cursor': {
    name: 'Cursor',
    skillsDir: null,
    rulesDir: join(HOME, '.cursor', 'rules'),
    systemPromptDir: join(HOME, '.cursor', 'prompts'),
    detected: () => existsSync(join(HOME, '.cursor'))
  },
  'windsurf': {
    name: 'Windsurf',
    skillsDir: null,
    rulesDir: join(HOME, '.windsurf', 'rules'),
    systemPromptDir: null,
    detected: () => existsSync(join(HOME, '.windsurf'))
  },
  'antigravity': {
    name: 'Gemini Antigravity',
    skillsDir: join(HOME, '.gemini', 'antigravity', 'skills'),
    rulesDir: null,
    systemPromptDir: null,
    detected: () => existsSync(join(HOME, '.gemini', 'antigravity'))
  },
  'gemini-cli': {
    name: 'Gemini CLI',
    // Gemini CLI reads GEMINI.md or AGENTS.md in the project directory
    skillsDir: null,
    rulesDir: null,
    systemPromptDir: CWD,
    agentsFile: join(CWD, 'GEMINI.md'),
    detected: () => existsSync(join(HOME, '.gemini')) && !existsSync(join(HOME, '.gemini', 'antigravity'))
  },
  'codex-cli': {
    name: 'Codex CLI',
    // Codex CLI reads AGENTS.md in the project directory
    skillsDir: null,
    rulesDir: null,
    systemPromptDir: CWD,
    agentsFile: join(CWD, 'AGENTS.md'),
    detected: () => false // never auto-detected — always explicit --tool codex-cli
  },
  'opencode': {
    name: 'OpenCode',
    // OpenCode reads AGENTS.md in the project directory
    skillsDir: null,
    rulesDir: null,
    systemPromptDir: CWD,
    agentsFile: join(CWD, 'AGENTS.md'),
    detected: () => false // always explicit
  }
}

export function detectInstalledTools() {
  return Object.entries(AI_TOOLS)
    .filter(([, tool]) => tool.detected())
    .map(([id, tool]) => ({ id, ...tool }))
}

export function getSkillsDir(toolId) {
  const tool = AI_TOOLS[toolId]
  if (!tool) return null
  return tool.skillsDir || tool.rulesDir || tool.systemPromptDir
}
