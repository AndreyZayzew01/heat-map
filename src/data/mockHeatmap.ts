export type HeatmapAsset = {
  id: string
  percent: number
  value: number
}

export type HeatmapTribe = {
  id: string
  assets: HeatmapAsset[]
}

export type HeatmapBlock = {
  id: string
  tribes: [HeatmapTribe, HeatmapTribe, HeatmapTribe]
}

export type HeatmapTone = 'critical' | 'warning' | 'healthy'

export type HeatmapNormalizedAsset = HeatmapAsset & {
  normalizedPercent: number
}

type HeatmapAssetDefinition = Omit<HeatmapAsset, 'id'>

export function createAssets(blockId: number, tribeId: number, items: HeatmapAssetDefinition[]) {
  return items.map((item, idx) => ({
    id: `b${blockId}-t${tribeId}-a${idx + 1}`,
    percent: item.percent,
    value: item.value,
  }))
}

function createBlock(
  blockId: number,
  top: HeatmapAssetDefinition[],
  bottomLeft: HeatmapAssetDefinition[],
  bottomRight: HeatmapAssetDefinition[],
): HeatmapBlock {
  return {
    id: `block-${blockId}`,
    tribes: [
      {
        id: `block-${blockId}-tribe-top`,
        assets: createAssets(blockId, 1, top),
      },
      {
        id: `block-${blockId}-tribe-left`,
        assets: createAssets(blockId, 2, bottomLeft),
      },
      {
        id: `block-${blockId}-tribe-right`,
        assets: createAssets(blockId, 3, bottomRight),
      },
    ],
  }
}

export const heatmapBlocks: HeatmapBlock[] = [
  createBlock(
    1,
    [
      { percent: 60, value: 4 },
      { percent: 5, value: 7 },
      { percent: 5, value: 3 },
      { percent: 9, value: 6 },
      { percent: 7, value: 10 },
      { percent: 6, value: 5 },
      { percent: 5, value: 2 },
      { percent: 3, value: 8 },
    ],
    [
      { percent: 24, value: 3 },
      { percent: 18, value: 6 },
      { percent: 16, value: 4 },
      { percent: 15, value: 7 },
      { percent: 14, value: 2 },
      { percent: 13, value: 8 },
    ],
    [
      { percent: 26, value: 9 },
      { percent: 18, value: 5 },
      { percent: 16, value: 7 },
      { percent: 14, value: 4 },
      { percent: 13, value: 8 },
      { percent: 13, value: 3 },
    ],
  ),
  createBlock(
    2,
    [
      { percent: 29, value: 8 },
      { percent: 18, value: 4 },
      { percent: 15, value: 6 },
      { percent: 11, value: 9 },
      { percent: 9, value: 5 },
      { percent: 7, value: 3 },
      { percent: 6, value: 7 },
      { percent: 5, value: 2 },
    ],
    [
      { percent: 23, value: 4 },
      { percent: 19, value: 8 },
      { percent: 17, value: 6 },
      { percent: 14, value: 2 },
      { percent: 14, value: 7 },
      { percent: 13, value: 5 },
    ],
    [
      { percent: 22, value: 5 },
      { percent: 20, value: 9 },
      { percent: 18, value: 4 },
      { percent: 16, value: 8 },
      { percent: 13, value: 3 },
      { percent: 11, value: 7 },
    ],
  ),
  createBlock(
    3,
    [
      { percent: 32, value: 3 },
      { percent: 17, value: 10 },
      { percent: 12, value: 5 },
      { percent: 11, value: 7 },
      { percent: 9, value: 2 },
      { percent: 7, value: 8 },
      { percent: 6, value: 4 },
      { percent: 4, value: 9 },
      { percent: 2, value: 6 },
    ],
    [
      { percent: 27, value: 7 },
      { percent: 18, value: 3 },
      { percent: 17, value: 8 },
      { percent: 15, value: 4 },
      { percent: 13, value: 6 },
      { percent: 10, value: 2 },
    ],
    [
      { percent: 25, value: 8 },
      { percent: 21, value: 5 },
      { percent: 18, value: 9 },
      { percent: 14, value: 3 },
      { percent: 12, value: 7 },
      { percent: 10, value: 4 },
    ],
  ),
  createBlock(
    4,
    [
      { percent: 28, value: 9 },
      { percent: 16, value: 5 },
      { percent: 15, value: 4 },
      { percent: 12, value: 8 },
      { percent: 10, value: 6 },
      { percent: 7, value: 3 },
      { percent: 6, value: 10 },
      { percent: 4, value: 2 },
      { percent: 2, value: 7 },
    ],
    [
      { percent: 24, value: 8 },
      { percent: 19, value: 4 },
      { percent: 16, value: 7 },
      { percent: 15, value: 3 },
      { percent: 14, value: 6 },
      { percent: 12, value: 9 },
    ],
    [
      { percent: 30, value: 4 },
      { percent: 18, value: 7 },
      { percent: 16, value: 5 },
      { percent: 14, value: 8 },
      { percent: 12, value: 2 },
      { percent: 10, value: 9 },
    ],
  ),
  createBlock(
    5,
    [
      { percent: 26, value: 5 },
      { percent: 18, value: 8 },
      { percent: 14, value: 4 },
      { percent: 12, value: 10 },
      { percent: 10, value: 3 },
      { percent: 8, value: 7 },
      { percent: 6, value: 2 },
      { percent: 4, value: 9 },
      { percent: 2, value: 6 },
    ],
    [
      { percent: 25, value: 2 },
      { percent: 18, value: 7 },
      { percent: 17, value: 4 },
      { percent: 15, value: 8 },
      { percent: 13, value: 5 },
      { percent: 12, value: 9 },
    ],
    [
      { percent: 24, value: 7 },
      { percent: 20, value: 3 },
      { percent: 17, value: 8 },
      { percent: 15, value: 4 },
      { percent: 13, value: 9 },
      { percent: 11, value: 5 },
    ],
  ),
]

export function getHeatmapTone(value: number): HeatmapTone {
  if (value >= 8) {
    return 'healthy'
  }

  if (value >= 5) {
    return 'warning'
  }

  return 'critical'
}

const HEATMAP_TONE_COLOR_MAP: Record<HeatmapTone, string> = {
  critical: '#8f5260',
  warning: '#b69143',
  healthy: '#3ea86c',
}

export function getHeatmapToneColor(tone: HeatmapTone) {
  return HEATMAP_TONE_COLOR_MAP[tone]
}

function sumPercents(items: HeatmapAsset[]) {
  return items.reduce((total, item) => total + Math.max(item.percent, 0), 0)
}

export function normalizeHeatmapAssetPercents(items: HeatmapAsset[]): HeatmapNormalizedAsset[] {
  if (items.length === 0) {
    return []
  }

  const total = sumPercents(items)

  if (total <= 0) {
    const equalPercent = 100 / items.length

    return items.map((item) => ({
      ...item,
      normalizedPercent: equalPercent,
    }))
  }

  return items.map((item) => ({
    ...item,
    normalizedPercent: (Math.max(item.percent, 0) / total) * 100,
  }))
}
