import * as esbuild from 'esbuild'
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const mode = args.includes('--dev')
  ? 'dev'
  : args.includes('--preview')
    ? 'preview'
    : 'build'

const portIdx = args.indexOf('--port')
const defaultPort = mode === 'preview' ? 4173 : 5173
const port = portIdx !== -1 ? Number(args[portIdx + 1]) : defaultPort

const outdir = 'dist'
const publicDir = 'public'

function prepareDist() {
  fs.rmSync(outdir, { recursive: true, force: true })
  fs.mkdirSync(outdir, { recursive: true })
  if (fs.existsSync(publicDir)) {
    fs.cpSync(publicDir, outdir, { recursive: true })
  }
}

function writeHtml({ withLiveReload }) {
  let html = fs.readFileSync('index.html', 'utf8')
    .replace(/\/src\/main\.tsx/g, '/main.js')
    .replace('</head>', '    <link rel="stylesheet" href="/main.css" />\n  </head>')
  if (withLiveReload) {
    html = html.replace(
      '</body>',
      '    <script>new EventSource("/esbuild").addEventListener("change", () => location.reload())</script>\n  </body>',
    )
  }
  fs.writeFileSync(path.join(outdir, 'index.html'), html)
}

const buildOptions = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  format: 'esm',
  outdir,
  target: 'es2020',
  jsx: 'automatic',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.png': 'file',
    '.svg': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.gif': 'file',
    '.woff': 'file',
    '.woff2': 'file',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'dev' ? 'development' : 'production'),
  },
  minify: mode === 'build',
  sourcemap: mode === 'dev' ? 'inline' : false,
}

if (mode === 'dev') {
  prepareDist()
  writeHtml({ withLiveReload: true })
  const ctx = await esbuild.context(buildOptions)
  await ctx.watch()
  const { port: servedPort } = await ctx.serve({ servedir: outdir, port, host: '0.0.0.0' })
  console.log(`Dev server: http://localhost:${servedPort}`)
} else if (mode === 'preview') {
  const ctx = await esbuild.context({})
  const { port: servedPort } = await ctx.serve({ servedir: outdir, port, host: '0.0.0.0' })
  console.log(`Preview:    http://localhost:${servedPort}`)
} else {
  prepareDist()
  writeHtml({ withLiveReload: false })
  await esbuild.build(buildOptions)
  console.log(`Built to ${outdir}`)
}
