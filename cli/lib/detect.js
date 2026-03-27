import { existsSync } from 'fs'
import { join } from 'path'
import os from 'os'

const HOME = os.homedir()

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
