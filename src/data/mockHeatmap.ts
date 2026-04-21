export type HeatmapAsset = {
  id: string
  name: string
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

type HeatmapAssetDefinition = Omit<HeatmapAsset, 'id'>

const TREEMAP_SIZE = 100
const EPSILON = 0.0001

export function createAssets(blockId: number, tribeId: number, items: HeatmapAssetDefinition[]) {
  return items.map((item, idx) => ({
    id: `b${blockId}-t${tribeId}-a${idx + 1}`,
    name: item.name,
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
      { name: 'CRM', percent: 60, value: 4 },
      { name: 'Система дистанционного банковского обслуживания', percent: 5, value: 7 },
      { name: 'АС-7', percent: 5, value: 3 },
      { name: 'Платёжный шлюз', percent: 9, value: 6 },
      { name: 'Мобильный банк', percent: 7, value: 10 },
      { name: 'Антифрод', percent: 6, value: 5 },
      { name: 'Депозитный модуль', percent: 5, value: 2 },
      { name: 'Автоматизированная система отчётности', percent: 3, value: 8 },
    ],
    [
      { name: 'АБС', percent: 24, value: 3 },
      { name: 'Кредитный конвейер', percent: 18, value: 6 },
      { name: 'DWH', percent: 16, value: 4 },
      { name: 'Процессинг карт', percent: 15, value: 7 },
      { name: 'Казначейство', percent: 14, value: 2 },
      { name: 'Модуль KYC', percent: 13, value: 8 },
    ],
    [
      { name: 'SberPay', percent: 26, value: 9 },
      { name: 'Интернет-банк', percent: 18, value: 5 },
      { name: 'Модуль противодействия отмыванию', percent: 16, value: 7 },
      { name: 'АС-12', percent: 14, value: 4 },
      { name: 'ERP', percent: 13, value: 8 },
      { name: 'Автоматизированнаясистемаотчётности', percent: 13, value: 3 },
    ],
  ),
  createBlock(
    2,
    [
      { name: 'АБС', percent: 29, value: 8 },
      { name: 'SberPay', percent: 18, value: 4 },
      { name: 'Кредитный конвейер', percent: 15, value: 6 },
      { name: 'Антифрод', percent: 11, value: 9 },
      { name: 'CRM', percent: 9, value: 5 },
      { name: 'АС-3', percent: 7, value: 3 },
      { name: 'Модуль KYC', percent: 6, value: 7 },
      { name: 'Платёжный шлюз', percent: 5, value: 2 },
    ],
    [
      { name: 'Система дистанционного банковского обслуживания', percent: 23, value: 4 },
      { name: 'DWH', percent: 19, value: 8 },
      { name: 'Депозитный модуль', percent: 17, value: 6 },
      { name: 'АС-8', percent: 14, value: 2 },
      { name: 'Процессинг карт', percent: 14, value: 7 },
      { name: 'Казначейство', percent: 13, value: 5 },
    ],
    [
      { name: 'Мобильный банк', percent: 22, value: 5 },
      { name: 'ERP', percent: 20, value: 9 },
      { name: 'Автоматизированная система отчётности', percent: 18, value: 4 },
      { name: 'Интернет-банк', percent: 16, value: 8 },
      { name: 'CRM', percent: 13, value: 3 },
      { name: 'АБС', percent: 11, value: 7 },
    ],
  ),
  createBlock(
    3,
    [
      { name: 'АБС', percent: 32, value: 3 },
      { name: 'CRM', percent: 17, value: 10 },
      { name: 'Кредитный конвейер', percent: 12, value: 5 },
      { name: 'SberPay', percent: 11, value: 7 },
      { name: 'Антифрод', percent: 9, value: 2 },
      { name: 'АС-11', percent: 7, value: 8 },
      { name: 'DWH', percent: 6, value: 4 },
      { name: 'Модуль KYC', percent: 4, value: 9 },
      { name: 'Автоматизированная система отчётности', percent: 2, value: 6 },
    ],
    [
      { name: 'Процессинг карт', percent: 27, value: 7 },
      { name: 'Платёжный шлюз', percent: 18, value: 3 },
      { name: 'Казначейство', percent: 17, value: 8 },
      { name: 'АС-4', percent: 15, value: 4 },
      { name: 'ERP', percent: 13, value: 6 },
      { name: 'Система дистанционного банковского обслуживания', percent: 10, value: 2 },
    ],
    [
      { name: 'Интернет-банк', percent: 25, value: 8 },
      { name: 'Мобильный банк', percent: 21, value: 5 },
      { name: 'CRM', percent: 18, value: 9 },
      { name: 'АБС', percent: 14, value: 3 },
      { name: 'Депозитный модуль', percent: 12, value: 7 },
      { name: 'Модуль KYC', percent: 10, value: 4 },
    ],
  ),
  createBlock(
    4,
    [
      { name: 'CRM', percent: 28, value: 9 },
      { name: 'АБС', percent: 16, value: 5 },
      { name: 'SberPay', percent: 15, value: 4 },
      { name: 'Кредитный конвейер', percent: 12, value: 8 },
      { name: 'Антифрод', percent: 10, value: 6 },
      { name: 'Платёжный шлюз', percent: 7, value: 3 },
      { name: 'АС-6', percent: 6, value: 10 },
      { name: 'DWH', percent: 4, value: 2 },
      { name: 'Система дистанционного банковского обслуживания', percent: 2, value: 7 },
    ],
    [
      { name: 'Мобильный банк', percent: 24, value: 8 },
      { name: 'ERP', percent: 19, value: 4 },
      { name: 'Процессинг карт', percent: 16, value: 7 },
      { name: 'АС-2', percent: 15, value: 3 },
      { name: 'Интернет-банк', percent: 14, value: 6 },
      { name: 'Модуль KYC', percent: 12, value: 9 },
    ],
    [
      { name: 'АБС', percent: 30, value: 4 },
      { name: 'Автоматизированная система отчётности', percent: 18, value: 7 },
      { name: 'CRM', percent: 16, value: 5 },
      { name: 'Депозитный модуль', percent: 14, value: 8 },
      { name: 'Казначейство', percent: 12, value: 2 },
      { name: 'АС-9', percent: 10, value: 9 },
    ],
  ),
  createBlock(
    5,
    [
      { name: 'SberPay', percent: 26, value: 5 },
      { name: 'CRM', percent: 18, value: 8 },
      { name: 'АБС', percent: 14, value: 4 },
      { name: 'Мобильный банк', percent: 12, value: 10 },
      { name: 'Антифрод', percent: 10, value: 3 },
      { name: 'Процессинг карт', percent: 8, value: 7 },
      { name: 'АС-5', percent: 6, value: 2 },
      { name: 'Платёжный шлюз', percent: 4, value: 9 },
      { name: 'Автоматизированнаясистемаотчётности', percent: 2, value: 6 },
    ],
    [
      { name: 'DWH', percent: 25, value: 2 },
      { name: 'ERP', percent: 18, value: 7 },
      { name: 'Кредитный конвейер', percent: 17, value: 4 },
      { name: 'АС-10', percent: 15, value: 8 },
      { name: 'Казначейство', percent: 13, value: 5 },
      { name: 'Система дистанционного банковского обслуживания', percent: 12, value: 9 },
    ],
    [
      { name: 'Интернет-банк', percent: 24, value: 7 },
      { name: 'CRM', percent: 20, value: 3 },
      { name: 'Депозитный модуль', percent: 17, value: 8 },
      { name: 'АБС', percent: 15, value: 4 },
      { name: 'Модуль KYC', percent: 13, value: 9 },
      { name: 'SberPay', percent: 11, value: 5 },
    ],
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
