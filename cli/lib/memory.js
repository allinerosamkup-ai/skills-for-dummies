import fs from 'fs-extra'
import { join } from 'path'
import { execFileSync } from 'child_process'

function getProjectName(projectPath) {
  try {
    const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: projectPath, stdio: 'pipe' })
      .toString().trim()
    return remote.split('/').pop().replace('.git', '')
  } catch {
    return projectPath.split('/').pop().split('\\').pop()
  }
}

function getMemoryDir(projectPath) {
  return join(projectPath, '.dummy', 'memory')
}

export async function save({ projectPath, type, data }) {
  const project = getProjectName(projectPath)
  const memDir = getMemoryDir(projectPath)
  const projectDir = join(memDir, 'projects', project)
  await fs.ensureDir(projectDir)
  await fs.ensureDir(join(memDir, 'user'))
  await fs.ensureDir(join(memDir, 'global'))

  const date = new Date().toISOString().split('T')[0]
  const files = {
    state:       join(projectDir, 'state.md'),
    env:         join(projectDir, 'env.md'),
    decisions:   join(projectDir, 'decisions.md'),
    errors:      join(memDir, 'global', 'errors.md'),
    preferences: join(memDir, 'user', 'preferences.md')
  }

  const file = files[type]
  if (!file) throw new Error(`Unknown memory type: ${type}`)

  const entry = formatEntry(date, type, data)
  const existing = await fs.pathExists(file) ? await fs.readFile(file, 'utf8') : ''
  await fs.writeFile(file, existing + '\n' + entry)

  return { saved: true, file, project }
}

export async function load(projectPath) {
  const project = getProjectName(projectPath)
  const memDir = getMemoryDir(projectPath)
  const projectDir = join(memDir, 'projects', project)

  const result = { project, found: false, state: null, env: null, decisions: null, preferences: null, globalErrors: null }
  if (!await fs.pathExists(projectDir)) return result

  result.found = true
  const readSafe = async (f) => await fs.pathExists(f) ? fs.readFile(f, 'utf8') : null

  result.state        = await readSafe(join(projectDir, 'state.md'))
  result.env          = await readSafe(join(projectDir, 'env.md'))
  result.decisions    = await readSafe(join(projectDir, 'decisions.md'))
  result.preferences  = await readSafe(join(memDir, 'user', 'preferences.md'))
  result.globalErrors = await readSafe(join(memDir, 'global', 'errors.md'))

  return result
}

export async function status(projectPath) {
  const project = getProjectName(projectPath)
  const memDir = getMemoryDir(projectPath)
  const projectDir = join(memDir, 'projects', project)

  if (!await fs.pathExists(projectDir)) return { project, hasMemory: false }

  const files = ['state.md', 'env.md', 'decisions.md'].map(f => join(projectDir, f))
  const stats = await Promise.all(files.map(async f => ({
    name: f.split(/[\\/]/).pop(),
    exists: await fs.pathExists(f),
    size: await fs.pathExists(f) ? (await fs.stat(f)).size : 0
  })))

  return { project, hasMemory: true, files: stats }
}

function formatEntry(date, type, data) {
  if (type === 'state') {
    return `## ${date} — Estado do Projeto\n${Object.entries(data).map(([k, v]) => `- ${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n')}\n`
  }
  if (type === 'env') {
    return `## ${date} — ${data.service} configurado via ${data.mode}\n${data.vars.map(v => `- ${v}: resolvida`).join('\n')}\nnota: "${data.note || ''}"\n`
  }
  if (type === 'decisions') {
    return `## ${date} — ${data.title}\ndecisão: ${data.decision}\nmotivo: ${data.reason}\nalternativas: [${(data.alternatives || []).join(', ')}]\nválido_enquanto: ${data.validWhile || 'sempre'}\n`
  }
  if (type === 'errors') {
    return `## ${date} — ${data.title}\nsintoma: ${data.symptom}\ncausa: ${data.cause}\ncorreção: ${data.fix}\nreutilizável_quando: ${data.reusableWhen || ''}\n`
  }
  if (type === 'preferences') {
    return `## ${date} — Preferências\n${Object.entries(data).map(([k, v]) => `- ${k}: ${v}`).join('\n')}\n`
  }
  return `## ${date}\n${JSON.stringify(data, null, 2)}\n`
}
