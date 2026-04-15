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
      percents: [29, 17, 12, 10, 9, 7, 6, 5, 5],
      values: [4, 7, 3, 6, 10, 5, 2, 8, 9],
    },
    {
      percents: [25, 19, 17, 14, 13, 12],
      values: [3, 6, 4, 7, 2, 8],
    },
    {
      percents: [27, 18, 16, 14, 13, 12],
      values: [9, 5, 7, 4, 8, 3],
    },
  ),
  createBlock(
    2,
    {
      percents: [24, 21, 14, 11, 8, 7, 6, 5, 4],
      values: [8, 4, 6, 9, 5, 3, 7, 2, 10],
    },
    {
      percents: [22, 20, 18, 15, 14, 11],
      values: [4, 8, 6, 2, 7, 5],
    },
    {
      percents: [23, 19, 17, 16, 14, 11],
      values: [5, 9, 4, 8, 3, 7],
    },
  ),
  createBlock(
    3,
    {
      percents: [31, 16, 13, 10, 8, 7, 6, 5, 4],
      values: [3, 10, 5, 7, 2, 8, 4, 9, 6],
    },
    {
      percents: [28, 21, 16, 13, 12, 10],
      values: [7, 3, 8, 4, 6, 2],
    },
    {
      percents: [24, 22, 18, 13, 12, 11],
      values: [8, 5, 9, 3, 7, 4],
    },
  ),
  createBlock(
    4,
    {
      percents: [26, 18, 15, 10, 9, 8, 6, 4, 4],
      values: [9, 5, 4, 8, 6, 3, 10, 2, 7],
    },
    {
      percents: [24, 18, 17, 16, 14, 11],
      values: [8, 4, 7, 3, 6, 9],
    },
    {
      percents: [29, 17, 15, 14, 13, 12],
      values: [4, 7, 5, 8, 2, 9],
    },
  ),
  createBlock(
    5,
    {
      percents: [27, 19, 13, 11, 8, 7, 6, 5, 4],
      values: [5, 8, 4, 10, 3, 7, 2, 9, 6],
    },
    {
      percents: [26, 18, 16, 15, 13, 12],
      values: [2, 7, 4, 8, 5, 9],
    },
    {
      percents: [25, 21, 16, 15, 12, 11],
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

function getWorstAspectRatio(row: WorkingCell[], shortSide: number) {
  if (row.length === 0 || shortSide <= 0) {
    return Number.POSITIVE_INFINITY
  }

  const areas = row.map((item) => item.area)
  const rowArea = areas.reduce((total, value) => total + value, 0)
  const largest = Math.max(...areas)
  const smallest = Math.min(...areas)
  const shortSideSquared = shortSide * shortSide

  return Math.max(
    (shortSideSquared * largest) / (rowArea * rowArea),
    (rowArea * rowArea) / (shortSideSquared * smallest),
  )
}

function layoutRow(row: WorkingCell[], bounds: TreemapBounds) {
  const rowArea = row.reduce((total, item) => total + item.area, 0)
  const layouts: HeatmapTreemapCell[] = []

  if (bounds.width >= bounds.height) {
    const rowHeight = rowArea / bounds.width
    let offsetX = bounds.x

    for (const item of row) {
      const width = rowHeight === 0 ? 0 : item.area / rowHeight

      layouts.push({
        ...item,
        tone: getHeatmapTone(item.value),
        x: offsetX,
        y: bounds.y,
        width,
        height: rowHeight,
      })

      offsetX += width
    }

    return {
      cells: layouts,
      nextBounds: {
        x: bounds.x,
        y: bounds.y + rowHeight,
        width: bounds.width,
        height: bounds.height - rowHeight,
      },
    }
  }

  const columnWidth = rowArea / bounds.height
  let offsetY = bounds.y

  for (const item of row) {
    const height = columnWidth === 0 ? 0 : item.area / columnWidth

    layouts.push({
      ...item,
      tone: getHeatmapTone(item.value),
      x: bounds.x,
      y: offsetY,
      width: columnWidth,
      height,
    })

    offsetY += height
  }

  return {
    cells: layouts,
    nextBounds: {
      x: bounds.x + columnWidth,
      y: bounds.y,
      width: bounds.width - columnWidth,
      height: bounds.height,
    },
  }
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

  const remaining = [...workingCells]
  const layout: HeatmapTreemapCell[] = []
  let row: WorkingCell[] = []
  let bounds: TreemapBounds = {
    x: 0,
    y: 0,
    width: TREEMAP_SIZE,
    height: TREEMAP_SIZE,
  }

  while (remaining.length > 0) {
    const candidate = remaining[0]
    const shortSide = Math.min(bounds.width, bounds.height)
    const expandedRow = [...row, candidate]

    if (
      row.length === 0 ||
      getWorstAspectRatio(row, shortSide) >= getWorstAspectRatio(expandedRow, shortSide) - EPSILON
    ) {
      row = expandedRow
      remaining.shift()
      continue
    }

    const rowLayout = layoutRow(row, bounds)
    layout.push(...rowLayout.cells)
    bounds = rowLayout.nextBounds
    row = []
  }

  if (row.length > 0) {
    const rowLayout = layoutRow(row, bounds)
    layout.push(...rowLayout.cells)
  }

  return layout
}
