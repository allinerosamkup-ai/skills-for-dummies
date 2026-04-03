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
  'engineering-mentor',\n  'sentry-core'\n]

// Tools that use a single AGENTS.md / GEMINI.md file instead of a skills directory
const AGENTS_FILE_TOOLS = ['gemini-cli', 'codex-cli', 'opencode']

function getRequestedTools(toolId) {
  if (!toolId) return detectInstalledTools()

  if (!AI_TOOLS[toolId]) {
    return { error: `Unknown tool "${toolId}". Supported: ${Object.keys(AI_TOOLS).join(', ')}` }
  }

  return [{ id: toolId, ...AI_TOOLS[toolId] }]
}

/**
 * Install for tools that use an AGENTS.md / GEMINI.md file (Gemini CLI, Codex CLI, OpenCode).
 * Appends SYSTEM.md content + each SKILL.md to the agents file.
 */
async function installAgentsFile(tool, skillsSource, force) {
  const agentsFile = tool.agentsFile
  const systemSrc = join(skillsSource, 'SYSTEM.md')

  const systemContent = await fs.pathExists(systemSrc)
    ? await fs.readFile(systemSrc, 'utf8')
    : ''

  let agentsContent = `# D.U.M.M.Y. OS — Auto-injected by \`npx dummy-os install --tool ${tool.id}\`\n\n`
  agentsContent += systemContent + '\n\n---\n\n'

  for (const skill of SKILLS) {
    const skillFile = join(skillsSource, skill, 'SKILL.md')
    if (await fs.pathExists(skillFile)) {
      const content = await fs.readFile(skillFile, 'utf8')
      agentsContent += `\n<!-- skill: ${skill} -->\n${content}\n`
    }
  }

  const alreadyExists = await fs.pathExists(agentsFile)
  if (alreadyExists && !force) {
    const existing = await fs.readFile(agentsFile, 'utf8')
    if (existing.includes('D.U.M.M.Y. OS — Auto-injected')) {
      return { tool: tool.id, agentsFile, installed: [{ skill: 'all', status: 'skipped (already installed — use --force to update)' }] }
    }
    // Append to existing file
    await fs.appendFile(agentsFile, '\n\n' + agentsContent)
  } else {
    await fs.writeFile(agentsFile, agentsContent, 'utf8')
  }

  return {
    tool: tool.id,
    targetDir: agentsFile,
    installed: SKILLS.map(s => ({ skill: s, status: force ? 'updated' : 'installed' }))
  }
}

export async function install(toolId, { force = false } = {}) {
  const tools = getRequestedTools(toolId)
  if (tools.error) return { success: false, error: tools.error }

  if (tools.length === 0) {
    return { success: false, error: 'No supported AI tools detected (Claude Code, Cursor, Windsurf, Gemini CLI)' }
  }

  const results = []

  for (const tool of tools) {
    // Handle agents-file-based tools (Gemini CLI, Codex CLI, OpenCode)
    if (AGENTS_FILE_TOOLS.includes(tool.id)) {
      const result = await installAgentsFile(tool, SKILLS_SOURCE, force)
      results.push(result)
      continue
    }

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

