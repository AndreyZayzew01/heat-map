import type Highcharts from 'highcharts'
import {
  getHeatmapTone,
  normalizeHeatmapAssetPercents,
  type HeatmapBlock,
  type HeatmapNormalizedAsset,
  type HeatmapTone,
} from '../data/mockHeatmap.js'

type HeatmapTreemapPointCustom = {
  tone: HeatmapTone
  metricValue: number
  rawPercent: number
  normalizedPercent: number
  tribeLabel: string
  assetCount?: number
}

export type HeatmapTreemapPoint = Highcharts.PointOptionsObject & {
  id: string
  name: string
  parent?: string
  value?: number
  className?: string
  color?: Highcharts.ColorType
  borderColor?: Highcharts.ColorType
  custom?: HeatmapTreemapPointCustom
}

const TRIBE_LABELS = [
  '\u0422\u0440\u0430\u0439\u0431 \u0412\u0435\u0440\u0445\u043D\u0438\u0439',
  '\u0422\u0440\u0430\u0439\u0431 \u041B\u0435\u0432\u044B\u0439',
  '\u0422\u0440\u0430\u0439\u0431 \u041F\u0440\u0430\u0432\u044B\u0439',
] as const
const CHART_FONT_FAMILY = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
const CHART_TEXT_COLOR = '#f5f7ff'
const CHART_MUTED_TEXT_COLOR = '#aeb9d8'
const TRIBE_FILL = 'rgba(18, 24, 38, 0.94)'
const TRIBE_BORDER = 'rgba(68, 78, 111, 0.62)'
const TOP_TRIBE_WEIGHT = 60
const SIDE_TRIBE_WEIGHT = 20
const MIN_TILE_PERCENT = 5
const EDGE_PERCENT_THRESHOLD = 15
const COMPACT_STACK_WIDTH_THRESHOLD = 90
const AGGREGATED_ASSET_LABEL = '\u0410\u0421 \u041F\u0440\u043E\u0447\u0438\u0435'
const ASSET_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0410\u0421'
const LEAF_POINT_CLASS = 'heatmap-cell'
const TRIBE_POINT_CLASS = 'heatmap-tribe-node'
const TRIBE_DATA_LABEL_CLASS = 'heatmap-tribe-data-label'
const LEAF_DATA_LABEL_CLASS = 'heatmap-leaf-data-label'

type ToneAppearance = {
  fill: Highcharts.GradientColorObject
  border: string
}

function createToneGradient(topColor: string, bottomColor: string): Highcharts.GradientColorObject {
  return {
    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
    stops: [
      [0, topColor],
      [1, bottomColor],
    ],
  }
}

const TONE_THEME: Record<HeatmapTone, ToneAppearance> = {
  critical: {
    fill: createToneGradient('rgba(55, 58, 69, 0.84)', 'rgba(37, 39, 48, 0.96)'),
    border: 'rgba(160, 99, 111, 0.68)',
  },
  warning: {
    fill: createToneGradient('rgba(55, 58, 69, 0.84)', 'rgba(37, 39, 48, 0.96)'),
    border: 'rgba(186, 157, 79, 0.7)',
  },
  healthy: {
    fill: createToneGradient('rgba(55, 58, 69, 0.84)', 'rgba(37, 39, 48, 0.96)'),
    border: 'rgba(77, 181, 114, 0.74)',
  },
}

const TONE_CELL_GLOW: Record<HeatmapTone, string> = {
  healthy: 'rgba(52, 170, 106, 0.24)',
  critical: 'rgba(160, 82, 92, 0.24)',
  warning: 'rgba(214, 158, 54, 0.24)',
}

const SVG_NS = 'http://www.w3.org/2000/svg'

function getBlockNumber(blockId: string, fallbackIndex: number) {
  const suffix = blockId.match(/(\d+)$/)?.[1]

  return suffix ?? String(fallbackIndex + 1)
}

function getTribeLabel(index: number) {
  return TRIBE_LABELS[index] ?? `\u0422\u0440\u0430\u0439\u0431 ${index + 1}`
}

function getAssetLabel(index: number) {
  return `\u0410\u0421 ${String(index + 1).padStart(2, '0')}`
}

function getTribeWeight(index: number) {
  return index === 0 ? TOP_TRIBE_WEIGHT : SIDE_TRIBE_WEIGHT
}

function getLeafAppearance(tone: HeatmapTone) {
  return TONE_THEME[tone]
}

function getLeafPointClassName(tone: HeatmapTone) {
  return `${LEAF_POINT_CLASS} ${LEAF_POINT_CLASS}--${tone}`
}

function getScaledAssetValue(asset: HeatmapNormalizedAsset, tribeWeight: number) {
  return Number(((asset.normalizedPercent / 100) * tribeWeight).toFixed(4))
}

function createLeafNode(
  tribeId: string,
  tribeLabel: string,
  asset: HeatmapNormalizedAsset,
  assetName: string,
  tribeWeight: number,
): HeatmapTreemapPoint {
  const tone = getHeatmapTone(asset.value)
  const appearance = getLeafAppearance(tone)

  return {
    id: asset.id,
    name: assetName,
    parent: tribeId,
    value: getScaledAssetValue(asset, tribeWeight),
    className: getLeafPointClassName(tone),
    color: appearance.fill,
    borderColor: appearance.border,
    custom: {
      tone,
      metricValue: asset.value,
      rawPercent: asset.percent,
      normalizedPercent: asset.normalizedPercent,
      tribeLabel,
    },
  }
}

function mergeTinyAssets(
  tribeId: string,
  tribeLabel: string,
  assets: HeatmapNormalizedAsset[],
  tribeWeight: number,
): HeatmapTreemapPoint[] {
  const sortedBySize = [...assets].sort((left, right) => left.normalizedPercent - right.normalizedPercent)
  const tinyAssetIds = new Set<string>()
  let overflowNormalizedPercent = 0

  for (const asset of sortedBySize) {
    if (asset.normalizedPercent < MIN_TILE_PERCENT || (tinyAssetIds.size > 0 && overflowNormalizedPercent < MIN_TILE_PERCENT)) {
      tinyAssetIds.add(asset.id)
      overflowNormalizedPercent += asset.normalizedPercent
      continue
    }

    break
  }

  if (tinyAssetIds.size === assets.length && assets.length > 1) {
    const largestAsset = sortedBySize[sortedBySize.length - 1]

    tinyAssetIds.delete(largestAsset.id)
    overflowNormalizedPercent -= largestAsset.normalizedPercent
  }

  const tinyAssets = assets.filter((asset) => tinyAssetIds.has(asset.id))
  const stableAssets = assets.filter((asset) => !tinyAssetIds.has(asset.id))
  const baseNodes = stableAssets.map((asset, assetIndex) =>
    createLeafNode(tribeId, tribeLabel, asset, getAssetLabel(assetIndex), tribeWeight),
  )

  if (tinyAssets.length === 0) {
    return baseNodes
  }

  const overflowPercent = tinyAssets.reduce((total, asset) => total + Math.max(asset.percent, 0), 0)
  const weightedMetricSum = tinyAssets.reduce((total, asset) => total + asset.value * Math.max(asset.percent, 0), 0)
  const overflowMetricValue = weightedMetricSum / Math.max(overflowPercent, 1)
  const overflowTone = getHeatmapTone(Math.round(overflowMetricValue))
  const overflowAppearance = getLeafAppearance(overflowTone)

  return [
    ...baseNodes,
    {
      id: `${tribeId}-overflow`,
      name: AGGREGATED_ASSET_LABEL,
      parent: tribeId,
      value: Number(((overflowNormalizedPercent / 100) * tribeWeight).toFixed(4)),
      className: getLeafPointClassName(overflowTone),
      color: overflowAppearance.fill,
      borderColor: overflowAppearance.border,
      custom: {
        tone: overflowTone,
        metricValue: Number(overflowMetricValue.toFixed(1)),
        rawPercent: overflowPercent,
        normalizedPercent: Number(overflowNormalizedPercent.toFixed(2)),
        tribeLabel,
        assetCount: tinyAssets.length,
      },
    },
  ]
}

function getTribeLabelMarkup(label: string) {
  return `<span class="heatmap-tribe-label">${label}</span>`
}

export function getAssetLabelMarkup(point: HeatmapTreemapPoint, tileWidth = Number.POSITIVE_INFINITY) {
  const percent = point.custom?.normalizedPercent

  if (percent === undefined) {
    return `<span class="heatmap-asset-label__title">${ASSET_TITLE}</span>`
  }

  const isCompactPercent = percent < EDGE_PERCENT_THRESHOLD
  const shouldStackCompactPercent = isCompactPercent && tileWidth < COMPACT_STACK_WIDTH_THRESHOLD
  const classes = shouldStackCompactPercent
    ? 'heatmap-asset-label heatmap-asset-label--compact-stack'
    : isCompactPercent
      ? 'heatmap-asset-label heatmap-asset-label--compact'
      : 'heatmap-asset-label'

  return [
    `<div class="${classes}">`,
    `<span class="heatmap-asset-label__kicker">${ASSET_TITLE}</span>`,
    `<span class="heatmap-asset-label__percent">${percent.toFixed(2)}%</span>`,
    '</div>',
  ].join('')
}

function ensureLeafVisualDefs(chart: Highcharts.Chart) {
  const chartWithDefs = chart as Highcharts.Chart & { __leafVisualDefsReady?: boolean }
  if (chartWithDefs.__leafVisualDefsReady) {
    return
  }

  const svg = chart.renderer.box
  if (!svg) {
    return
  }

  const doc = svg.ownerDocument
  let defs = svg.querySelector('defs')
  if (!defs) {
    defs = doc.createElementNS(SVG_NS, 'defs')
    svg.insertBefore(defs, svg.firstChild)
  }

  const ensureStop = (gradient: SVGElement, offset: string, color: string) => {
    const stop = doc.createElementNS(SVG_NS, 'stop')
    stop.setAttribute('offset', offset)
    stop.setAttribute('stop-color', color)
    gradient.appendChild(stop)
  }

  if (!defs.querySelector('#heatmapLeafBaseLinear')) {
    const gradient = doc.createElementNS(SVG_NS, 'linearGradient')
    gradient.setAttribute('id', 'heatmapLeafBaseLinear')
    gradient.setAttribute('x1', '0')
    gradient.setAttribute('y1', '0')
    gradient.setAttribute('x2', '0')
    gradient.setAttribute('y2', '1')
    ensureStop(gradient, '0%', 'rgba(55, 58, 69, 0.84)')
    ensureStop(gradient, '100%', 'rgba(37, 39, 48, 0.96)')
    defs.appendChild(gradient)
  }

  if (!defs.querySelector('#heatmapLeafHighlightRadial')) {
    const gradient = doc.createElementNS(SVG_NS, 'radialGradient')
    gradient.setAttribute('id', 'heatmapLeafHighlightRadial')
    gradient.setAttribute('cx', '0.5')
    gradient.setAttribute('cy', '0.4')
    gradient.setAttribute('r', '0.54')
    ensureStop(gradient, '0%', 'rgba(255, 255, 255, 0.04)')
    ensureStop(gradient, '54%', 'rgba(255, 255, 255, 0)')
    defs.appendChild(gradient)
  }

  if (!defs.querySelector('#heatmapLeafShadowFilter')) {
    const filter = doc.createElementNS(SVG_NS, 'filter')
    filter.setAttribute('id', 'heatmapLeafShadowFilter')
    filter.setAttribute('x', '-20%')
    filter.setAttribute('y', '-20%')
    filter.setAttribute('width', '140%')
    filter.setAttribute('height', '160%')
    filter.setAttribute('color-interpolation-filters', 'sRGB')

    const outerShadow = doc.createElementNS(SVG_NS, 'feDropShadow')
    outerShadow.setAttribute('dx', '0')
    outerShadow.setAttribute('dy', '10')
    outerShadow.setAttribute('stdDeviation', '10')
    outerShadow.setAttribute('flood-color', 'rgb(0, 0, 0)')
    outerShadow.setAttribute('flood-opacity', '0.16')
    filter.appendChild(outerShadow)

    const innerHighlightOffset = doc.createElementNS(SVG_NS, 'feOffset')
    innerHighlightOffset.setAttribute('in', 'SourceAlpha')
    innerHighlightOffset.setAttribute('dx', '0')
    innerHighlightOffset.setAttribute('dy', '1')
    innerHighlightOffset.setAttribute('result', 'innerHighlightOffset')
    filter.appendChild(innerHighlightOffset)

    const innerHighlightComposite = doc.createElementNS(SVG_NS, 'feComposite')
    innerHighlightComposite.setAttribute('in', 'innerHighlightOffset')
    innerHighlightComposite.setAttribute('in2', 'SourceAlpha')
    innerHighlightComposite.setAttribute('operator', 'arithmetic')
    innerHighlightComposite.setAttribute('k2', '-1')
    innerHighlightComposite.setAttribute('k3', '1')
    innerHighlightComposite.setAttribute('result', 'innerHighlightShape')
    filter.appendChild(innerHighlightComposite)

    const innerHighlightFlood = doc.createElementNS(SVG_NS, 'feFlood')
    innerHighlightFlood.setAttribute('flood-color', 'rgb(255, 255, 255)')
    innerHighlightFlood.setAttribute('flood-opacity', '0.05')
    innerHighlightFlood.setAttribute('result', 'innerHighlightColor')
    filter.appendChild(innerHighlightFlood)

    const innerHighlightMask = doc.createElementNS(SVG_NS, 'feComposite')
    innerHighlightMask.setAttribute('in', 'innerHighlightColor')
    innerHighlightMask.setAttribute('in2', 'innerHighlightShape')
    innerHighlightMask.setAttribute('operator', 'in')
    innerHighlightMask.setAttribute('result', 'innerHighlight')
    filter.appendChild(innerHighlightMask)

    const innerShadowOffset = doc.createElementNS(SVG_NS, 'feOffset')
    innerShadowOffset.setAttribute('in', 'SourceAlpha')
    innerShadowOffset.setAttribute('dx', '0')
    innerShadowOffset.setAttribute('dy', '12')
    innerShadowOffset.setAttribute('result', 'innerShadowOffset')
    filter.appendChild(innerShadowOffset)

    const innerShadowBlur = doc.createElementNS(SVG_NS, 'feGaussianBlur')
    innerShadowBlur.setAttribute('in', 'innerShadowOffset')
    innerShadowBlur.setAttribute('stdDeviation', '14')
    innerShadowBlur.setAttribute('result', 'innerShadowBlur')
    filter.appendChild(innerShadowBlur)

    const innerShadowComposite = doc.createElementNS(SVG_NS, 'feComposite')
    innerShadowComposite.setAttribute('in', 'innerShadowBlur')
    innerShadowComposite.setAttribute('in2', 'SourceAlpha')
    innerShadowComposite.setAttribute('operator', 'arithmetic')
    innerShadowComposite.setAttribute('k2', '-1')
    innerShadowComposite.setAttribute('k3', '1')
    innerShadowComposite.setAttribute('result', 'innerShadowShape')
    filter.appendChild(innerShadowComposite)

    const innerShadowFlood = doc.createElementNS(SVG_NS, 'feFlood')
    innerShadowFlood.setAttribute('flood-color', 'rgb(0, 0, 0)')
    innerShadowFlood.setAttribute('flood-opacity', '0.22')
    innerShadowFlood.setAttribute('result', 'innerShadowColor')
    filter.appendChild(innerShadowFlood)

    const innerShadowMask = doc.createElementNS(SVG_NS, 'feComposite')
    innerShadowMask.setAttribute('in', 'innerShadowColor')
    innerShadowMask.setAttribute('in2', 'innerShadowShape')
    innerShadowMask.setAttribute('operator', 'in')
    innerShadowMask.setAttribute('result', 'innerShadow')
    filter.appendChild(innerShadowMask)

    const merge = doc.createElementNS(SVG_NS, 'feMerge')
    const mergeInnerShadow = doc.createElementNS(SVG_NS, 'feMergeNode')
    mergeInnerShadow.setAttribute('in', 'innerShadow')
    const mergeInnerHighlight = doc.createElementNS(SVG_NS, 'feMergeNode')
    mergeInnerHighlight.setAttribute('in', 'innerHighlight')
    const mergeSourceGraphic = doc.createElementNS(SVG_NS, 'feMergeNode')
    mergeSourceGraphic.setAttribute('in', 'SourceGraphic')
    merge.appendChild(mergeInnerShadow)
    merge.appendChild(mergeInnerHighlight)
    merge.appendChild(mergeSourceGraphic)
    filter.appendChild(merge)

    defs.appendChild(filter)
  }

  ;(['critical', 'warning', 'healthy'] as HeatmapTone[]).forEach((tone) => {
    const glowGradientId = `heatmapLeafGlow-${tone}`
    if (!defs.querySelector(`#${glowGradientId}`)) {
      const gradient = doc.createElementNS(SVG_NS, 'radialGradient')
      gradient.setAttribute('id', glowGradientId)
      gradient.setAttribute('cx', '0.5')
      gradient.setAttribute('cy', '0.5')
      gradient.setAttribute('r', '0.72')
      ensureStop(gradient, '0%', TONE_CELL_GLOW[tone])
      ensureStop(gradient, '72%', 'rgba(0, 0, 0, 0)')
      defs.appendChild(gradient)
    }

    const patternId = `heatmapLeafPattern-${tone}`
    if (!defs.querySelector(`#${patternId}`)) {
      const pattern = doc.createElementNS(SVG_NS, 'pattern')
      pattern.setAttribute('id', patternId)
      pattern.setAttribute('patternUnits', 'objectBoundingBox')
      pattern.setAttribute('width', '1')
      pattern.setAttribute('height', '1')

      const baseRect = doc.createElementNS(SVG_NS, 'rect')
      baseRect.setAttribute('width', '1')
      baseRect.setAttribute('height', '1')
      baseRect.setAttribute('fill', 'url(#heatmapLeafBaseLinear)')

      const highlightRect = doc.createElementNS(SVG_NS, 'rect')
      highlightRect.setAttribute('width', '1')
      highlightRect.setAttribute('height', '1')
      highlightRect.setAttribute('fill', 'url(#heatmapLeafHighlightRadial)')

      const glowRect = doc.createElementNS(SVG_NS, 'rect')
      glowRect.setAttribute('width', '1')
      glowRect.setAttribute('height', '1')
      glowRect.setAttribute('fill', `url(#${glowGradientId})`)

      pattern.appendChild(baseRect)
      pattern.appendChild(highlightRect)
      pattern.appendChild(glowRect)
      defs.appendChild(pattern)
    }
  })

  chartWithDefs.__leafVisualDefsReady = true
}

function applyLeafSvgStyles(chart: Highcharts.Chart) {
  ensureLeafVisualDefs(chart)

  const series = chart.series?.[0]
  if (!series) {
    return
  }

  const points = (series as Highcharts.Series & { points?: Highcharts.Point[] }).points ?? []
  for (const point of points) {
    const custom = (point.options as HeatmapTreemapPoint).custom
    if (!custom?.tone || !point.graphic) {
      continue
    }

    const fill = `url(#heatmapLeafPattern-${custom.tone})`
    const filter = 'url(#heatmapLeafShadowFilter)'
    const shape = point.graphic.element?.querySelector?.('rect, path')
    const target = shape ?? point.graphic.element
    target?.setAttribute('filter', filter)
    target?.setAttribute('data-heatmap-leaf-fill', fill)
  }
}

export function createHeatmapTreemapSeriesData(block: HeatmapBlock): HeatmapTreemapPoint[] {
  return block.tribes.flatMap((tribe, tribeIndex) => {
    const tribeLabel = getTribeLabel(tribeIndex)
    const tribeWeight = getTribeWeight(tribeIndex)
    const normalizedAssets = normalizeHeatmapAssetPercents(tribe.assets)
    const tribeNode: HeatmapTreemapPoint = {
      id: tribe.id,
      name: tribeLabel,
      value: tribeWeight,
      className: TRIBE_POINT_CLASS,
      color: TRIBE_FILL,
      borderColor: TRIBE_BORDER,
    }
    const assetNodes = mergeTinyAssets(tribe.id, tribeLabel, normalizedAssets, tribeWeight)

    return [tribeNode, ...assetNodes]
  })
}

export function createHeatmapTreemapOptions(block: HeatmapBlock, blockIndex: number): Highcharts.Options {
  return {
    chart: {
      type: 'treemap',
      backgroundColor: 'transparent',
      animation: false,
      height: 948,
      spacing: [0, 0, 0, 0],
      margin: [0, 0, 0, 0],
      style: {
        fontFamily: CHART_FONT_FAMILY,
      },
      events: {
        render: function () {
          applyLeafSvgStyles(this as Highcharts.Chart)
        },
      },
    },
    title: {
      text: undefined,
    },
    subtitle: {
      text: undefined,
      style: {
        color: CHART_MUTED_TEXT_COLOR,
      },
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    exporting: {
      enabled: false,
    },
    accessibility: {
      enabled: false,
    },
    tooltip: {
      enabled: false,
    },
    plotOptions: {
      series: {
        animation: false,
      },
      treemap: {
        allowTraversingTree: false,
        interactByLeaf: true,
        layoutAlgorithm: 'sliceAndDice',
        layoutStartingDirection: 'vertical',
        alternateStartingDirection: true,
        borderRadius: 12,
        colorByPoint: false,
        groupPadding: 12,
        levels: [
          {
            level: 1,
            borderColor: TRIBE_BORDER,
            borderWidth: 2,
            color: TRIBE_FILL,
            dataLabels: {
              enabled: true,
              className: TRIBE_DATA_LABEL_CLASS,
              headers: true,
              useHTML: true,
              formatter: function (this: Highcharts.Point) {
                const point = this as Highcharts.Point & { point?: Highcharts.Point }

                return getTribeLabelMarkup((point.point?.name ?? point.name) ?? '')
              },
              style: {
                color: CHART_TEXT_COLOR,
                fontSize: '13px',
                fontWeight: '800',
                textOutline: 'none',
              },
            },
          },
          {
            level: 2,
            borderWidth: 2,
            dataLabels: {
              enabled: true,
              className: LEAF_DATA_LABEL_CLASS,
              useHTML: true,
              crop: false,
              overflow: 'allow',
              formatter: function (this: Highcharts.Point) {
                const point = this as Highcharts.Point & {
                  point?: Highcharts.Point & { options: HeatmapTreemapPoint }
                  options?: HeatmapTreemapPoint
                  shapeArgs?: { width?: number }
                }

                return getAssetLabelMarkup(
                  point.point?.options ?? point.options ?? ({ id: '', name: '' } as HeatmapTreemapPoint),
                  point.point?.shapeArgs?.width ?? point.shapeArgs?.width,
                )
              },
              style: {
                color: CHART_TEXT_COLOR,
                fontSize: '12px',
                fontWeight: '700',
                textOutline: 'none',
              },
            },
          },
        ],
        states: {
          hover: {
            enabled: false,
          },
          inactive: {
            opacity: 1,
          },
        },
      },
    },
    series: [
      {
        type: 'treemap',
        name: `\u0411\u043B\u043E\u043A ${getBlockNumber(block.id, blockIndex)}`,
        data: createHeatmapTreemapSeriesData(block),
        turboThreshold: 0,
      },
    ],
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 900,
          },
          chartOptions: {
            chart: {
              height: 720,
            },
          },
        },
      ],
    },
  }
}
