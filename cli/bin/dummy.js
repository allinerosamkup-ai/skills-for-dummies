#!/usr/bin/env node
import { program } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { install, uninstall, listInstalled } from '../lib/install.js'
import { save, load, status as memStatus } from '../lib/memory.js'
import { detectInstalledTools } from '../lib/detect.js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'))

const LOGO = `
${chalk.bold.white('D')}${chalk.gray('.')}${chalk.bold.white('U')}${chalk.gray('.')}${chalk.bold.white('M')}${chalk.gray('.')}${chalk.bold.white('M')}${chalk.gray('.')}${chalk.bold.white('Y')}${chalk.gray('.')}  ${chalk.dim('v' + pkg.version)}
${chalk.dim('Dynamic · Unified · Multi-agent · Memory-driven · Yield')}
${chalk.dim('The AI Operating System')}
`

program
  .name('dummy')
  .description('D.U.M.M.Y. OS — The AI Operating System')
  .version(pkg.version)

// ─── INSTALL ──────────────────────────────────────────────────────────────────
program
  .command('install')
  .description('Install D.U.M.M.Y. OS skills into your AI tool')
  .option('--tool <tool>', 'Target tool: claude-code | cursor | windsurf | antigravity')
  .option('--force', 'Overwrite existing skills')
  .action(async (opts) => {
    console.log(LOGO)
    const spinner = ora('Detecting AI tools...').start()
    try {
      const result = await install(opts.tool, { force: opts.force })
      if (!result.success) {
        spinner.fail(chalk.red(result.error))
        process.exit(1)
      }
      spinner.succeed(chalk.green('D.U.M.M.Y. OS installed!'))
      for (const r of result.results) {
        if (r.skipped) {
          console.log(chalk.yellow(`  ⚠ ${r.tool}: ${r.reason}`))
          continue
        }
        console.log(chalk.cyan(`\n  → ${r.tool}`) + chalk.dim(` (${r.targetDir})`))
        for (const s of r.installed) {
          const icon = s.status.includes('skip') ? chalk.yellow('  ○') : chalk.green('  ✓')
          console.log(`${icon} ${s.skill} ${chalk.dim(s.status)}`)
        }
      }
      console.log(`\n${chalk.bold('Next step:')} Open your AI tool and say:`)
      console.log(chalk.cyan('  "Load DUMMY OS and help me build a notes app with Supabase"'))
    } catch (e) {
      spinner.fail(chalk.red(e.message))
      process.exit(1)
    }
  })

// ─── UPDATE ───────────────────────────────────────────────────────────────────
program
  .command('update')
  .description('Update all installed D.U.M.M.Y. OS skills to latest')
  .option('--tool <tool>', 'Target tool')
  .action(async (opts) => {
    console.log(LOGO)
    const spinner = ora('Updating skills...').start()
    try {
      const result = await install(opts.tool, { force: true })
      spinner.succeed(chalk.green('All skills updated!'))
      for (const r of result.results) {
        if (r.skipped) continue
        console.log(chalk.cyan(`  → ${r.tool}: ${r.installed.length} skills updated`))
      }
    } catch (e) {
      spinner.fail(chalk.red(e.message))
    }
  })

// ─── UNINSTALL ────────────────────────────────────────────────────────────────
program
  .command('uninstall')
  .description('Remove D.U.M.M.Y. OS skills')
  .option('--tool <tool>', 'Target tool')
  .action(async (opts) => {
    const spinner = ora('Removing skills...').start()
    try {
      const result = await uninstall(opts.tool)
      spinner.succeed('D.U.M.M.Y. OS uninstalled')
      for (const r of result.results) {
        console.log(chalk.dim(`  ${r.tool}: removed ${r.removed.join(', ')}`))
      }
    } catch (e) {
      spinner.fail(chalk.red(e.message))
    }
  })

// ─── STATUS ───────────────────────────────────────────────────────────────────
program
  .command('status')
  .description('Show installed skills and detected AI tools')
  .action(async () => {
    console.log(LOGO)
    const tools = detectInstalledTools()

    if (tools.length === 0) {
      console.log(chalk.yellow('No supported AI tools detected.'))
      console.log(chalk.dim('Supported: Claude Code, Cursor, Windsurf, Gemini Antigravity'))
      return
    }

    console.log(chalk.bold('Detected AI tools:'))
    for (const t of tools) {
      console.log(`  ${chalk.green('✓')} ${t.name}`)
    }

    const installed = await listInstalled()
    if (installed.length === 0) {
      console.log(chalk.yellow('\nD.U.M.M.Y. OS not installed. Run: dummy install'))
      return
    }

    console.log(chalk.bold('\nInstalled skills:'))
    for (const r of installed) {
      console.log(chalk.cyan(`\n  ${r.tool}`) + chalk.dim(` → ${r.targetDir}`))
      for (const s of r.skills) {
        console.log(`    ${chalk.green('✓')} ${s.skill} ${chalk.dim('v' + s.version)}`)
      }
    }

    // Memory status for current project
    const cwd = process.cwd()
    const mem = await memStatus(cwd)
    console.log(chalk.bold('\nProject memory:'))
    if (!mem.hasMemory) {
      console.log(chalk.dim(`  No memory for "${mem.project}". Run: dummy init`))
    } else {
      console.log(`  ${chalk.cyan(mem.project)}`)
      for (const f of mem.files) {
        const icon = f.exists ? chalk.green('✓') : chalk.dim('○')
        const size = f.exists ? chalk.dim(` (${(f.size / 1024).toFixed(1)}kb)`) : ''
        console.log(`    ${icon} ${f.name}${size}`)
      }
    }
  })

// ─── INIT ─────────────────────────────────────────────────────────────────────
program
  .command('init')
  .description('Initialize D.U.M.M.Y. memory for current project')
  .action(async () => {
    const cwd = process.cwd()
    const spinner = ora(`Initializing memory for ${cwd.split(/[\\/]/).pop()}...`).start()
    try {
      const { default: fs } = await import('fs-extra')
      const { join } = await import('path')
      await fs.ensureDir(join(cwd, '.dummy', 'memory', 'projects'))
      await fs.ensureDir(join(cwd, '.dummy', 'memory', 'user'))
      await fs.ensureDir(join(cwd, '.dummy', 'memory', 'global'))

      // Add .dummy to .gitignore if not already there
      const gitignore = join(cwd, '.gitignore')
      if (await fs.pathExists(gitignore)) {
        const content = await fs.readFile(gitignore, 'utf8')
        if (!content.includes('.dummy')) {
          await fs.appendFile(gitignore, '\n# D.U.M.M.Y. OS memory\n.dummy/\n')
        }
      }

      spinner.succeed(chalk.green(`Memory initialized for project: ${cwd.split(/[\\/]/).pop()}`))
      console.log(chalk.dim('  .dummy/ added to .gitignore'))
      console.log(chalk.dim('  Context will be saved automatically between sessions'))
    } catch (e) {
      spinner.fail(chalk.red(e.message))
    }
  })

// ─── MEMORY ───────────────────────────────────────────────────────────────────
const memory = program
  .command('memory')
  .description('Manage project memory')

memory
  .command('save <type>')
  .description('Save memory entry (state|env|decisions|errors|preferences)')
  .option('--data <json>', 'JSON data to save')
  .action(async (type, opts) => {
    try {
      const data = JSON.parse(opts.data || '{}')
      const result = await save({ projectPath: process.cwd(), type, data })
      console.log(chalk.green(`✓ Saved ${type} memory`) + chalk.dim(` → ${result.file}`))
    } catch (e) {
      console.log(chalk.red(`Error: ${e.message}`))
    }
  })

memory
  .command('load')
  .description('Load and display project memory')
  .action(async () => {
    const result = await load(process.cwd())
    if (!result.found) {
      console.log(chalk.yellow(`No memory found for project: ${result.project}`))
      console.log(chalk.dim('Run: dummy init'))
      return
    }
    console.log(chalk.bold(`Memory for: ${result.project}\n`))
    if (result.state)      console.log(chalk.cyan('── STATE ──\n') + result.state)
    if (result.env)        console.log(chalk.cyan('── ENV ──\n') + result.env)
    if (result.decisions)  console.log(chalk.cyan('── DECISIONS ──\n') + result.decisions)
  })

memory
  .command('clear')
  .description('Clear memory for current project')
  .action(async () => {
    const { default: fs } = await import('fs-extra')
    const { join } = await import('path')
    const memDir = join(process.cwd(), '.dummy')
    if (await fs.pathExists(memDir)) {
      await fs.remove(memDir)
      console.log(chalk.green('✓ Memory cleared'))
    } else {
      console.log(chalk.dim('No memory to clear'))
    }
  })

// ─── DOCTOR ───────────────────────────────────────────────────────────────────
program
  .command('doctor')
  .description('Diagnose D.U.M.M.Y. OS installation health')
  .action(async () => {
    console.log(LOGO)
    console.log(chalk.bold('Running diagnostics...\n'))

    const { default: fs } = await import('fs-extra')
    const { join } = await import('path')
    const { homedir } = await import('os')
    const { execFileSync } = await import('child_process')
    const home = homedir()

    const checks = []

    // 1. Node version
    const nodeVersion = process.version
    const nodeMajor = parseInt(nodeVersion.slice(1))
    checks.push({
      label: `Node.js version (${nodeVersion})`,
      ok: nodeMajor >= 18,
      fix: 'Upgrade Node.js to v18 or higher: https://nodejs.org'
    })

    // 2. AI tools detected
    const tools = detectInstalledTools()
    checks.push({
      label: `AI tools detected (${tools.length > 0 ? tools.map(t => t.name).join(', ') : 'none'})`,
      ok: tools.length > 0,
      fix: 'Install Claude Code, Cursor, or Windsurf'
    })

    // 3. Skills installed (check Claude Code)
    const claudeSkillsDir = join(home, '.claude', 'skills')
    const expectedSkills = ['dummy-memory', 'skill4d-core-orchestrator', 'ConnectPro-v9.8', 'app-factory-multiagent', 'mock-to-react', 'preview-bridge', 'surge-core', 'engineering-mentor']
    let installedCount = 0
    for (const skill of expectedSkills) {
      if (await fs.pathExists(join(claudeSkillsDir, skill, 'SKILL.md'))) installedCount++
    }
    checks.push({
      label: `Skills installed (${installedCount}/8)`,
      ok: installedCount === 8,
      fix: 'Run: dummy install --force'
    })

    // 4. CLAUDE.md exists and has boot trigger
    const claudeMd = join(home, '.claude', 'CLAUDE.md')
    let claudeMdOk = false
    if (await fs.pathExists(claudeMd)) {
      const content = await fs.readFile(claudeMd, 'utf8')
      claudeMdOk = content.includes('hi dummy')
    }
    checks.push({
      label: 'CLAUDE.md with boot trigger',
      ok: claudeMdOk,
      fix: 'Run: dummy install --force (reinstalls CLAUDE.md)'
    })

    // 5. dev-browser installed (optional but recommended for browser_auto)
    let devBrowserOk = false
    try {
      execFileSync('dev-browser', ['--version'], { stdio: 'pipe' })
      devBrowserOk = true
    } catch {}
    checks.push({
      label: `dev-browser CLI ${devBrowserOk ? '' : '(optional — needed for browser_auto)'}`,
      ok: devBrowserOk,
      warn: !devBrowserOk,
      fix: 'npm install -g dev-browser && dev-browser install'
    })

    // 6. Project memory initialized
    const memDir = join(process.cwd(), '.dummy', 'memory')
    const hasMemory = await fs.pathExists(memDir)
    checks.push({
      label: `Project memory (${hasMemory ? 'initialized' : 'not initialized'})`,
      ok: hasMemory,
      warn: !hasMemory,
      fix: 'Run: dummy init (in your project folder)'
    })

    // Print results
    let allOk = true
    for (const c of checks) {
      if (c.ok) {
        console.log(`  ${chalk.green('✓')} ${c.label}`)
      } else if (c.warn) {
        console.log(`  ${chalk.yellow('⚠')} ${c.label}`)
        console.log(chalk.dim(`    → ${c.fix}`))
      } else {
        console.log(`  ${chalk.red('✗')} ${c.label}`)
        console.log(chalk.dim(`    → ${c.fix}`))
        allOk = false
      }
    }

    console.log('')
    if (allOk) {
      console.log(chalk.green.bold('✓ D.U.M.M.Y. OS is healthy. Say "hi dummy" to start.'))
    } else {
      console.log(chalk.yellow('Some issues found. Fix the ✗ items above and re-run: dummy doctor'))
    }
  })

program.parse()
