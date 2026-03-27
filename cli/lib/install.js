import fs from 'fs-extra'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { AI_TOOLS, detectInstalledTools, getSkillsDir } from './detect.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SKILLS_SOURCE = join(__dirname, '..', '..') // repo root

const SKILLS = [
  'dummy-memory',
  'skill4d-core-orchestrator',
  'ConnectPro-v9.8',
  'mock-to-react',
  'app-factory-multiagent',
  'preview-bridge',
  'surge-core',
  'engineering-mentor'
]

function getRequestedTools(toolId) {
  if (!toolId) return detectInstalledTools()

  if (!AI_TOOLS[toolId]) {
    return { error: `Unknown tool "${toolId}". Supported: ${Object.keys(AI_TOOLS).join(', ')}` }
  }

  return [{ id: toolId, ...AI_TOOLS[toolId] }]
}

export async function install(toolId, { force = false } = {}) {
  const tools = getRequestedTools(toolId)
  if (tools.error) return { success: false, error: tools.error }

  if (tools.length === 0) {
    return { success: false, error: 'No supported AI tools detected (Claude Code, Cursor, Windsurf)' }
  }

  const results = []

  for (const tool of tools) {
    const targetDir = getSkillsDir(tool.id)
    if (!targetDir) {
      results.push({ tool: tool.id, skipped: true, reason: 'No skills directory for this tool' })
      continue
    }

    await fs.ensureDir(targetDir)

    const installed = []
    for (const skill of SKILLS) {
      const src = join(SKILLS_SOURCE, skill)
      const dest = join(targetDir, skill)

      if (!await fs.pathExists(src)) continue
      if (!force && await fs.pathExists(dest)) {
        installed.push({ skill, status: 'skipped (already installed — use --force to update)' })
        continue
      }

      await fs.copy(src, dest, { overwrite: true })
      installed.push({ skill, status: force ? 'updated' : 'installed' })
    }

    // Also copy SYSTEM.md to target dir parent
    const systemSrc = join(SKILLS_SOURCE, 'SYSTEM.md')
    if (await fs.pathExists(systemSrc)) {
      await fs.copy(systemSrc, join(dirname(targetDir), 'DUMMY_SYSTEM.md'), { overwrite: true })
    }

    results.push({ tool: tool.id, targetDir, installed })
  }

  return { success: true, results }
}

export async function uninstall(toolId) {
  const tools = getRequestedTools(toolId)
  if (tools.error) return { success: false, error: tools.error }
  const results = []

  for (const tool of tools) {
    const targetDir = getSkillsDir(tool.id)
    if (!targetDir) continue

    const removed = []
    for (const skill of SKILLS) {
      const dest = join(targetDir, skill)
      if (await fs.pathExists(dest)) {
        await fs.remove(dest)
        removed.push(skill)
      }
    }
    results.push({ tool: tool.id, removed })
  }

  return { success: true, results }
}

export async function listInstalled(toolId) {
  const tools = getRequestedTools(toolId)
  if (tools.error) throw new Error(tools.error)
  const results = []

  for (const tool of tools) {
    const targetDir = getSkillsDir(tool.id)
    if (!targetDir || !await fs.pathExists(targetDir)) continue

    const found = []
    for (const skill of SKILLS) {
      const dest = join(targetDir, skill)
      if (await fs.pathExists(dest)) {
        const skillFile = join(dest, 'SKILL.md')
        let version = 'unknown'
        if (await fs.pathExists(skillFile)) {
          const content = await fs.readFile(skillFile, 'utf8')
          const match = content.match(/^version:\s*["']?([^"'\n]+)/m)
          if (match) version = match[1].trim()
        }
        found.push({ skill, version })
      }
    }
    results.push({ tool: tool.id, targetDir, skills: found })
  }

  return results
}
