import { describe, expect, it } from 'vitest'
import { createAssets } from '../data/mockHeatmap.js'
import {
  createTreemapPoints,
  getHeatmapTone,
  getTreemapLabelMode,
  normalizeTreemapPercents,
} from './heatmapTreemap.js'

describe('normalizeTreemapPercents', () => {
  it('normalizes asset percents to a 100 percent layout budget', () => {
    const assets = createAssets(1, 1, [
      { percent: 40, value: 9 },
      { percent: 10, value: 4 },
    ])

    const normalized = normalizeTreemapPercents(assets)

    expect(normalized.map((asset) => asset.normalizedPercent)).toEqual([80, 20])
  })

  it('falls back to equal shares when the tribe total is empty', () => {
    const assets = createAssets(1, 1, [
      { percent: 0, value: 9 },
      { percent: 0, value: 4 },
      { percent: 0, value: 1 },
    ])

    const normalized = normalizeTreemapPercents(assets)

    expect(normalized.map((asset) => asset.normalizedPercent)).toEqual([
      100 / 3,
      100 / 3,
      100 / 3,
    ])
  })
})

describe('createTreemapPoints', () => {
  it('maps the existing asset model into highcharts points with tone metadata', () => {
    const assets = createAssets(2, 2, [
      { percent: 29, value: 8 },
      { percent: 18, value: 5 },
      { percent: 11, value: 3 },
    ])

    const points = createTreemapPoints(assets)

    expect(points.map((point) => point.value)).toEqual([29, 18, 11])
    expect(points.map((point) => point.custom.tone)).toEqual(['healthy', 'warning', 'critical'])
    expect(points.map((point) => point.custom.normalizedPercent)).toEqual([50, 31.03448275862069, 18.96551724137931])
  })
})

describe('heatmap label rules', () => {
  it('keeps larger tiles on the full layout mode', () => {
    expect(getTreemapLabelMode(24, 18)).toBe('full')
  })

  it('uses stacked compact labels for narrow small tiles', () => {
    expect(getTreemapLabelMode(7, 24)).toBe('compact-stack')
  })

  it('uses inline compact labels for wider small tiles', () => {
    expect(getTreemapLabelMode(9, 36)).toBe('compact-inline')
  })

  it('preserves the risk tone thresholds from the original heatmap', () => {
    expect(getHeatmapTone(8)).toBe('healthy')
    expect(getHeatmapTone(5)).toBe('warning')
    expect(getHeatmapTone(4)).toBe('critical')
  })
})
