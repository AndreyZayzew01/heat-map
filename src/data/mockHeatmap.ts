export type HeatmapAsset = {
  id: string
  name: string
  percent: number
  value: number
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

export const tribeTopData: HeatmapAsset[] = [
  { id: 'ac-01', name: 'AC 01', percent: 50, value: 4 },
  { id: 'ac-02', name: 'AC 02', percent: 6.25, value: 7 },
  { id: 'ac-03', name: 'AC 03', percent: 6.25, value: 3 },
  { id: 'ac-04', name: 'AC 04', percent: 6.25, value: 6 },
  { id: 'ac-05', name: 'AC 05', percent: 6.25, value: 10 },
  { id: 'ac-06', name: 'AC 06', percent: 6.25, value: 5 },
  { id: 'ac-07', name: 'AC 07', percent: 6.25, value: 2 },
  { id: 'ac-08', name: 'AC 08', percent: 6.25, value: 8 },
  { id: 'ac-09', name: 'AC 09', percent: 6.25, value: 9 },
]

export const tribeBottomLeftData: HeatmapAsset[] = [
  { id: 'ac-10', name: 'AC 10', percent: 24, value: 3 },
  { id: 'ac-11', name: 'AC 11', percent: 18, value: 6 },
  { id: 'ac-12', name: 'AC 12', percent: 16, value: 4 },
  { id: 'ac-13', name: 'AC 13', percent: 14, value: 7 },
  { id: 'ac-14', name: 'AC 14', percent: 12, value: 2 },
  { id: 'ac-15', name: 'AC 15', percent: 16, value: 8 },
]

export const tribeBottomRightData: HeatmapAsset[] = [
  { id: 'ac-16', name: 'AC 16', percent: 26, value: 9 },
  { id: 'ac-17', name: 'AC 17', percent: 18, value: 5 },
  { id: 'ac-18', name: 'AC 18', percent: 14, value: 7 },
  { id: 'ac-19', name: 'AC 19', percent: 12, value: 4 },
  { id: 'ac-20', name: 'AC 20', percent: 15, value: 8 },
  { id: 'ac-21', name: 'AC 21', percent: 15, value: 3 },
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
