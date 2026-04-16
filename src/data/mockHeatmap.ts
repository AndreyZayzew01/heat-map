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

export type HeatmapTreemapCell = HeatmapAsset & {
  normalizedPercent: number
  tone: HeatmapTone
  x: number
  y: number
  width: number
  height: number
}

type WorkingCell = HeatmapAsset & {
  normalizedPercent: number
  area: number
}

type TreemapBounds = {
  x: number
  y: number
  width: number
  height: number
}

const TREEMAP_SIZE = 100
const EPSILON = 0.0001

function createAssets(blockId: number, tribeId: number, percents: number[], values: number[]) {
  if (percents.length !== values.length) {
    throw new Error(`Expected matching percents and values for block ${blockId}, tribe ${tribeId}`)
  }

  return percents.map((percent, idx) => ({
    id: `b${blockId}-t${tribeId}-a${idx + 1}`,
    percent,
    value: values[idx],
  }))
}

function createBlock(
  blockId: number,
  top: { percents: number[]; values: number[] },
  bottomLeft: { percents: number[]; values: number[] },
  bottomRight: { percents: number[]; values: number[] },
): HeatmapBlock {
  return {
    id: `block-${blockId}`,
    tribes: [
      {
        id: `block-${blockId}-tribe-top`,
        assets: createAssets(blockId, 1, top.percents, top.values),
      },
      {
        id: `block-${blockId}-tribe-left`,
        assets: createAssets(blockId, 2, bottomLeft.percents, bottomLeft.values),
      },
      {
        id: `block-${blockId}-tribe-right`,
        assets: createAssets(blockId, 3, bottomRight.percents, bottomRight.values),
      },
    ],
  }
}

export const heatmapBlocks: HeatmapBlock[] = [
  createBlock(
    1,
    {
      percents: [37, 19, 14, 9, 7, 6, 5, 3],
      values: [4, 7, 3, 6, 10, 5, 2, 8],
    },
    {
      percents: [24, 18, 16, 15, 14, 13],
      values: [3, 6, 4, 7, 2, 8],
    },
    {
      percents: [26, 18, 16, 14, 13, 13],
      values: [9, 5, 7, 4, 8, 3],
    },
  ),
  createBlock(
    2,
    {
      percents: [29, 18, 15, 11, 9, 7, 6, 5],
      values: [8, 4, 6, 9, 5, 3, 7, 2],
    },
    {
      percents: [23, 19, 17, 14, 14, 13],
      values: [4, 8, 6, 2, 7, 5],
    },
    {
      percents: [22, 20, 18, 16, 13, 11],
      values: [5, 9, 4, 8, 3, 7],
    },
  ),
  createBlock(
    3,
    {
      percents: [32, 17, 12, 11, 9, 7, 6, 4, 2],
      values: [3, 10, 5, 7, 2, 8, 4, 9, 6],
    },
    {
      percents: [27, 18, 17, 15, 13, 10],
      values: [7, 3, 8, 4, 6, 2],
    },
    {
      percents: [25, 21, 18, 14, 12, 10],
      values: [8, 5, 9, 3, 7, 4],
    },
  ),
  createBlock(
    4,
    {
      percents: [28, 16, 15, 12, 10, 7, 6, 4, 2],
      values: [9, 5, 4, 8, 6, 3, 10, 2, 7],
    },
    {
      percents: [24, 19, 16, 15, 14, 12],
      values: [8, 4, 7, 3, 6, 9],
    },
    {
      percents: [30, 18, 16, 14, 12, 10],
      values: [4, 7, 5, 8, 2, 9],
    },
  ),
  createBlock(
    5,
    {
      percents: [26, 18, 14, 12, 10, 8, 6, 4, 2],
      values: [5, 8, 4, 10, 3, 7, 2, 9, 6],
    },
    {
      percents: [25, 18, 17, 15, 13, 12],
      values: [2, 7, 4, 8, 5, 9],
    },
    {
      percents: [24, 20, 17, 15, 13, 11],
      values: [7, 3, 8, 4, 9, 5],
    },
  ),
]

function getHeatmapTone(value: number): HeatmapTone {
  if (value >= 8) {
    return 'healthy'
  }

  if (value >= 5) {
    return 'warning'
  }

  return 'critical'
}

function sumPercents(items: HeatmapAsset[]) {
  return items.reduce((total, item) => total + Math.max(item.percent, 0), 0)
}

function normalizePercentages(items: HeatmapAsset[]) {
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

function getCellAspectRatio(width: number, height: number) {
  const shortestSide = Math.min(width, height)

  if (shortestSide <= 0) {
    return Number.POSITIVE_INFINITY
  }

  return Math.max(width, height) / shortestSide
}

function getTotalArea(items: WorkingCell[]) {
  return items.reduce((total, item) => total + item.area, 0)
}

function splitBounds(bounds: TreemapBounds, firstAreaShare: number) {
  if (bounds.width >= bounds.height) {
    const firstWidth = bounds.width * firstAreaShare

    return [
      {
        x: bounds.x,
        y: bounds.y,
        width: firstWidth,
        height: bounds.height,
      },
      {
        x: bounds.x + firstWidth,
        y: bounds.y,
        width: bounds.width - firstWidth,
        height: bounds.height,
      },
    ] as const
  }

  const firstHeight = bounds.height * firstAreaShare

  return [
    {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: firstHeight,
    },
    {
      x: bounds.x,
      y: bounds.y + firstHeight,
      width: bounds.width,
      height: bounds.height - firstHeight,
    },
  ] as const
}

function layoutBalancedTreemap(
  items: WorkingCell[],
  bounds: TreemapBounds,
): { cells: HeatmapTreemapCell[]; worstAspectRatio: number } {
  if (items.length === 0) {
    return {
      cells: [],
      worstAspectRatio: 0,
    }
  }

  if (items.length === 1) {
    const [item] = items

    return {
      cells: [
        {
          ...item,
          tone: getHeatmapTone(item.value),
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        },
      ],
      worstAspectRatio: getCellAspectRatio(bounds.width, bounds.height),
    }
  }

  const totalArea = getTotalArea(items)
  let bestLayout: { cells: HeatmapTreemapCell[]; worstAspectRatio: number } | null = null
  let bestBalanceDiff = Number.POSITIVE_INFINITY

  for (let splitIndex = 1; splitIndex < items.length; splitIndex += 1) {
    const firstItems = items.slice(0, splitIndex)
    const secondItems = items.slice(splitIndex)
    const firstArea = getTotalArea(firstItems)
    const [firstBounds, secondBounds] = splitBounds(bounds, firstArea / totalArea)
    const firstLayout = layoutBalancedTreemap(firstItems, firstBounds)
    const secondLayout = layoutBalancedTreemap(secondItems, secondBounds)
    const worstAspectRatio = Math.max(firstLayout.worstAspectRatio, secondLayout.worstAspectRatio)
    const balanceDiff = Math.abs(totalArea / 2 - firstArea)

    if (
      bestLayout === null ||
      worstAspectRatio < bestLayout.worstAspectRatio - EPSILON ||
      (Math.abs(worstAspectRatio - bestLayout.worstAspectRatio) <= EPSILON && balanceDiff < bestBalanceDiff)
    ) {
      bestLayout = {
        cells: [...firstLayout.cells, ...secondLayout.cells],
        worstAspectRatio,
      }
      bestBalanceDiff = balanceDiff
    }
  }

  return bestLayout ?? { cells: [], worstAspectRatio: 0 }
}

function buildWorkingCells(items: HeatmapAsset[]) {
  return normalizePercentages(items).map((item) => ({
    ...item,
    area: (item.normalizedPercent / 100) * TREEMAP_SIZE * TREEMAP_SIZE,
  }))
}

export function buildTreemapLayout(items: HeatmapAsset[]) {
  const workingCells = buildWorkingCells(items)

  if (workingCells.length === 0) {
    return []
  }

  const bounds: TreemapBounds = {
    x: 0,
    y: 0,
    width: TREEMAP_SIZE,
    height: TREEMAP_SIZE,
  }

  return layoutBalancedTreemap(workingCells, bounds).cells
}
