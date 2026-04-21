import { describe, expect, it } from 'vitest'
import { createAssets } from '../data/mockHeatmap.js'
import {
  createTreemapPoints,
  getHeatmapTone,
  normalizeTreemapPercents,
} from './heatmapTreemap.js'

describe('normalizeTreemapPercents', () => {
  it('normalizes asset percents to a 100 percent layout budget', () => {
    const assets = createAssets(1, 1, [
      { name: 'A', percent: 40, value: 9 },
      { name: 'B', percent: 10, value: 4 },
    ])

    const normalized = normalizeTreemapPercents(assets)

    expect(normalized.map((asset) => asset.normalizedPercent)).toEqual([80, 20])
  })

  it('falls back to equal shares when the tribe total is empty', () => {
    const assets = createAssets(1, 1, [
      { name: 'A', percent: 0, value: 9 },
      { name: 'B', percent: 0, value: 4 },
      { name: 'C', percent: 0, value: 1 },
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
      { name: 'A', percent: 29, value: 8 },
      { name: 'B', percent: 18, value: 5 },
      { name: 'C', percent: 11, value: 3 },
    ])

    const points = createTreemapPoints(assets)

    expect(points.map((point) => point.value)).toEqual([
      Math.sqrt(29),
      Math.sqrt(18),
      Math.sqrt(11),
    ])
    expect(points.map((point) => point.custom.tone)).toEqual(['healthy', 'warning', 'critical'])
    expect(points.map((point) => point.custom.normalizedPercent)).toEqual([50, 31.03448275862069, 18.96551724137931])
  })
})

describe('heatmap tone thresholds', () => {
  it('preserves the risk tone thresholds from the original heatmap', () => {
    expect(getHeatmapTone(8)).toBe('healthy')
    expect(getHeatmapTone(5)).toBe('warning')
    expect(getHeatmapTone(4)).toBe('critical')
  })
})
