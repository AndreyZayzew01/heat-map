import { readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const TEMP_DIR = '.tmp-tests'

rmSync(TEMP_DIR, { recursive: true, force: true })

const compileResult = spawnSync(
  process.execPath,
  ['./node_modules/typescript/bin/tsc', '-p', 'tsconfig.unit-tests.json'],
  {
    stdio: 'inherit',
  },
)

if (compileResult.status !== 0) {
  process.exit(compileResult.status ?? 1)
}

const testsDirectory = join(TEMP_DIR, 'tests')
const testFiles = readdirSync(testsDirectory)
  .filter((fileName) => fileName.endsWith('.test.js'))
  .map((fileName) => join(testsDirectory, fileName))

if (testFiles.length === 0) {
  console.error('No compiled unit tests found.')
  process.exit(1)
}

const testResult = spawnSync(process.execPath, ['--test', ...testFiles], {
  stdio: 'inherit',
})

process.exit(testResult.status ?? 1)
