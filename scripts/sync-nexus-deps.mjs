import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const targets = process.argv.slice(2)

if (targets.length === 0) {
  console.error('Usage: node scripts/sync-nexus-deps.mjs <path/to/package.json> [...]')
  process.exit(1)
}

function run(cmd, cwd) {
  return execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
}

function resolveRange(name, range, cwd) {
  try {
    const out = run(`npm view ${name}@"${range}" version --json`, cwd)
    if (!out) return null
    const parsed = JSON.parse(out)
    return Array.isArray(parsed) ? parsed[parsed.length - 1] : parsed
  } catch {
    return null
  }
}

function listVersions(name, cwd) {
  try {
    const out = run(`npm view ${name} versions --json`, cwd)
    if (!out) return []
    const parsed = JSON.parse(out)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return []
  }
}

function detectPrefix(range) {
  const match = /^[\^~]?/.exec(range)
  return match ? match[0] : '^'
}

function syncBag(pkg, bagName, cwd) {
  const bag = pkg[bagName]
  if (!bag) return []
  const updates = []
  for (const [name, range] of Object.entries(bag)) {
    const hit = resolveRange(name, range, cwd)
    if (hit) {
      console.log(`  ok    ${name}@${range} -> ${hit}`)
      continue
    }
    const versions = listVersions(name, cwd)
    if (versions.length === 0) {
      console.log(`  MISS  ${name}: not available in registry`)
      updates.push({ name, from: range, to: null, missing: true })
      continue
    }
    const latest = versions[versions.length - 1]
    const prefix = detectPrefix(range)
    const newRange = `${prefix}${latest}`
    bag[name] = newRange
    updates.push({ name, from: range, to: newRange })
    console.log(`  bump  ${name} ${range} -> ${newRange}`)
  }
  return updates
}

for (const target of targets) {
  const pkgPath = path.resolve(target)
  if (!fs.existsSync(pkgPath)) {
    console.error(`Skip: ${pkgPath} not found`)
    continue
  }

  const cwd = path.dirname(pkgPath)
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

  console.log(`\n# ${pkgPath}`)
  console.log('[dependencies]')
  const a = syncBag(pkg, 'dependencies', cwd)
  console.log('[devDependencies]')
  const b = syncBag(pkg, 'devDependencies', cwd)

  const changed = [...a, ...b].filter((item) => item.to)
  const missing = [...a, ...b].filter((item) => item.missing)

  if (changed.length > 0) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    console.log(`\n  -> updated ${changed.length} entr${changed.length === 1 ? 'y' : 'ies'}`)
  } else {
    console.log('\n  -> no updates needed')
  }
  if (missing.length > 0) {
    console.log(`  -> ${missing.length} missing package(s) in registry: ${missing.map((item) => item.name).join(', ')}`)
  }
}
