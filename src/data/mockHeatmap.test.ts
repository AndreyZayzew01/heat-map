import assert from 'node:assert/strict'
import test from 'node:test'
import * as heatmapModule from './mockHeatmap.js'

type HeatmapAssetInput = {
  id: string
  percent: number
  value: number
}

type HeatmapBlock = {
  id: string
  tribes: Array<{
    id: string
    assets: HeatmapAssetInput[]
  }>
}

type TreemapCell = {
  id: string
  normalizedPercent: number
  x: number
  y: number
  width: number
  height: number
}

function getBuildTreemapLayout() {
  return (heatmapModule as { buildTreemapLayout?: (items: HeatmapAssetInput[]) => TreemapCell[] })
    .buildTreemapLayout
}

function getHeatmapBlocks() {
  return (heatmapModule as { heatmapBlocks?: HeatmapBlock[] }).heatmapBlocks
}

function getAreaPercent(cell: TreemapCell) {
  return (cell.width * cell.height) / 100
}

function getAspectRatio(cell: TreemapCell) {
  const shortestSide = Math.min(cell.width, cell.height)

  if (shortestSide === 0) {
    return Number.POSITIVE_INFINITY
  }

  return Math.max(cell.width, cell.height) / shortestSide
}

test('allocates half of the tribe area to a 50 percent system', () => {
  const buildTreemapLayout = getBuildTreemapLayout()

  if (!buildTreemapLayout) {
    assert.fail('Expected buildTreemapLayout to be exported')
  }

  const cells = buildTreemapLayout([
    { id: 'ac-1', percent: 50, value: 9 },
    { id: 'ac-2', percent: 6.25, value: 5 },
    { id: 'ac-3', percent: 6.25, value: 5 },
    { id: 'ac-4', percent: 6.25, value: 5 },
    { id: 'ac-5', percent: 6.25, value: 5 },
    { id: 'ac-6', percent: 6.25, value: 5 },
    { id: 'ac-7', percent: 6.25, value: 5 },
    { id: 'ac-8', percent: 6.25, value: 5 },
    { id: 'ac-9', percent: 6.25, value: 5 },
  ])

  assert.ok(cells)
  assert.equal(cells.length, 9)
  assert.ok(Math.abs(getAreaPercent(cells[0]) - 50) < 0.0001)

  for (const cell of cells.slice(1)) {
    assert.ok(Math.abs(getAreaPercent(cell) - 6.25) < 0.0001)
  }
})

test('normalizes percentages when the tribe total is not 100 percent', () => {
  const buildTreemapLayout = getBuildTreemapLayout()

  if (!buildTreemapLayout) {
    assert.fail('Expected buildTreemapLayout to be exported')
  }

  const cells = buildTreemapLayout([
    { id: 'ac-1', percent: 30, value: 8 },
    { id: 'ac-2', percent: 30, value: 6 },
  ])

  assert.ok(cells)
  assert.equal(cells.length, 2)
  assert.ok(Math.abs(cells[0].normalizedPercent - 50) < 0.0001)
  assert.ok(Math.abs(cells[1].normalizedPercent - 50) < 0.0001)
  assert.ok(Math.abs(getAreaPercent(cells[0]) - 50) < 0.0001)
  assert.ok(Math.abs(getAreaPercent(cells[1]) - 50) < 0.0001)
})

test('keeps equal percentages equal after layout calculation', () => {
  const buildTreemapLayout = getBuildTreemapLayout()

  if (!buildTreemapLayout) {
    assert.fail('Expected buildTreemapLayout to be exported')
  }

  const cells = buildTreemapLayout([
    { id: 'ac-1', percent: 1, value: 4 },
    { id: 'ac-2', percent: 1, value: 4 },
    { id: 'ac-3', percent: 1, value: 4 },
  ])

  assert.ok(cells)
  assert.equal(cells.length, 3)

  const [first, second, third] = cells
  assert.ok(Math.abs(first.normalizedPercent - second.normalizedPercent) < 0.0001)
  assert.ok(Math.abs(second.normalizedPercent - third.normalizedPercent) < 0.0001)
  assert.ok(Math.abs(getAreaPercent(first) - getAreaPercent(second)) < 0.0001)
  assert.ok(Math.abs(getAreaPercent(second) - getAreaPercent(third)) < 0.0001)
})

test('keeps small indicators close to a rectangular aspect ratio', () => {
  const buildTreemapLayout = getBuildTreemapLayout()

  if (!buildTreemapLayout) {
    assert.fail('Expected buildTreemapLayout to be exported')
  }

  const cells = buildTreemapLayout([
    { id: 'ac-1', percent: 39, value: 4 },
    { id: 'ac-2', percent: 17, value: 7 },
    { id: 'ac-3', percent: 12, value: 3 },
    { id: 'ac-4', percent: 10, value: 6 },
    { id: 'ac-5', percent: 9, value: 10 },
    { id: 'ac-6', percent: 7, value: 5 },
    { id: 'ac-7', percent: 6, value: 2 },
    { id: 'ac-8', percent: 2, value: 8 },
  ])

  const compactCells = cells.filter((cell) => cell.normalizedPercent < 15)

  assert.ok(compactCells.length > 0)

  for (const cell of compactCells) {
    assert.ok(getAspectRatio(cell) <= 2.1, `Expected ${cell.id} to stay near 2:1, got ${getAspectRatio(cell)}`)
  }
})

test('exports varied block data with percentages that do not exceed 100 per tribe', () => {
  const heatmapBlocks = getHeatmapBlocks()

  assert.ok(heatmapBlocks)
  assert.equal(heatmapBlocks.length, 5)

  for (const block of heatmapBlocks) {
    assert.ok(block.tribes.length > 0)

    for (const tribe of block.tribes) {
      assert.ok(tribe.assets.length > 0)
      assert.ok(new Set(tribe.assets.map((asset) => asset.percent)).size > 1)

      const totalPercent = tribe.assets.reduce((sum, asset) => sum + asset.percent, 0)
      assert.ok(totalPercent <= 100, `Expected ${tribe.id} to stay within 100%, got ${totalPercent}`)

      for (const asset of tribe.assets) {
        assert.equal(typeof asset.percent, 'number')
        assert.ok(asset.percent > 0)
      }
    }
  }

  const topTribeSignatures = heatmapBlocks.map((block) =>
    block.tribes[0].assets.map((asset) => asset.percent.toFixed(2)).join('|'),
  )

  assert.equal(new Set(topTribeSignatures).size, heatmapBlocks.length)
})
