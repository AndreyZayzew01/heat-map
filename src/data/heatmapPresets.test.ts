import assert from 'node:assert/strict'
import test from 'node:test'
import { heatmapBlocks } from './mockHeatmap.js'
import { getHeatmapPreset, getHeatmapPresets } from './heatmapPresets.js'

test('exports three named heatmap presets', () => {
  const heatmapPresets = getHeatmapPresets()

  assert.equal(heatmapPresets.length, 3)
  assert.deepEqual(
    heatmapPresets.map((preset: { id: string }) => preset.id),
    ['default', 'elevated', 'critical'],
  )
})

test('falls back to the default preset and warns for an unknown id', () => {
  const warnings: string[] = []
  const originalWarn = console.warn

  console.warn = (message?: unknown) => {
    warnings.push(String(message))
  }

  try {
    const preset = getHeatmapPreset('missing')

    assert.equal(preset.id, 'default')
    assert.equal(warnings.length, 1)
    assert.match(warnings[0], /missing/)
  } finally {
    console.warn = originalWarn
  }
})

test('rebuilds the default preset from the latest mock heatmap data', () => {
  const tribe = heatmapBlocks[0]?.tribes[0]

  if (!tribe) {
    assert.fail('Expected the first tribe to exist')
  }

  const originalAssets = tribe.assets.map((asset) => ({
    ...asset,
  }))

  tribe.assets = [{ ...tribe.assets[0], percent: 56 }, ...tribe.assets.slice(2)]

  try {
    const preset = getHeatmapPreset('default')
    const updatedAssets = preset.blocks[0]?.tribes[0]?.assets

    assert.ok(updatedAssets)
    assert.equal(updatedAssets.length, tribe.assets.length)
    assert.equal(updatedAssets[0]?.percent, 56)
  } finally {
    tribe.assets = originalAssets
  }
})
