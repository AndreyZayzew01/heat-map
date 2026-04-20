import Highcharts from 'highcharts'
import type { HeatmapAsset, HeatmapTone } from '../data/mockHeatmap.js'

export const DASHBOARD_CELL_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0410\u0421'
export const EDGE_PERCENT_THRESHOLD = 15
export const COMPACT_STACK_WIDTH_THRESHOLD = 32

export type HeatmapTreemapPointCustom = {
  normalizedPercent: number
  tone: HeatmapTone
}

export type HeatmapTreemapPoint = Highcharts.PointOptionsObject & {
  custom: HeatmapTreemapPointCustom
}

export type TreemapLabelMode = 'full' | 'compact-inline' | 'compact-stack'

type ToneVisual = {
  borderColor: string
  fillColor: Highcharts.GradientColorObject
}

function sumPercents(items: HeatmapAsset[]) {
  return items.reduce((total, item) => total + Math.max(item.percent, 0), 0)
}

export function normalizeTreemapPercents(items: HeatmapAsset[]) {
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

export function getHeatmapTone(value: number): HeatmapTone {
  if (value >= 8) {
    return 'healthy'
  }

  if (value >= 5) {
    return 'warning'
  }

  return 'critical'
}

export function getTreemapLabelMode(normalizedPercent: number, widthPercent: number): TreemapLabelMode {
  if (normalizedPercent >= EDGE_PERCENT_THRESHOLD) {
    return 'full'
  }

  if (widthPercent < COMPACT_STACK_WIDTH_THRESHOLD) {
    return 'compact-stack'
  }

  return 'compact-inline'
}

export function getTreemapToneVisual(tone: HeatmapTone): ToneVisual {
  switch (tone) {
    case 'healthy':
      return {
        borderColor: 'rgba(92, 196, 129, 0.91)',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
          stops: [
            [0, 'rgba(74, 194, 124, 0.34)'],
            [0.52, 'rgba(56, 152, 104, 0.60)'],
            [1, 'rgba(33, 44, 58, 0.96)'],
          ],
        },
      }
    case 'warning':
      return {
        borderColor: 'rgba(208, 174, 92, 0.89)',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
          stops: [
            [0, 'rgba(224, 174, 70, 0.34)'],
            [0.52, 'rgba(178, 132, 58, 0.58)'],
            [1, 'rgba(34, 43, 57, 0.96)'],
          ],
        },
      }
    default:
      return {
        borderColor: 'rgba(186, 116, 130, 0.89)',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
          stops: [
            [0, 'rgba(182, 96, 112, 0.34)'],
            [0.52, 'rgba(146, 78, 94, 0.58)'],
            [1, 'rgba(34, 42, 56, 0.96)'],
          ],
        },
      }
  }
}

export function createTreemapPoints(assets: HeatmapAsset[]) {
  return normalizeTreemapPercents(assets).map<HeatmapTreemapPoint>((asset) => {
    const tone = getHeatmapTone(asset.value)
    const visual = getTreemapToneVisual(tone)

    return {
      id: asset.id,
      name: DASHBOARD_CELL_TITLE,
      value: Math.max(asset.percent, 0.0001),
      color: visual.fillColor,
      custom: {
        normalizedPercent: asset.normalizedPercent,
        tone,
      },
    }
  })
}

export function createTreemapOptions(
  points: HeatmapTreemapPoint[],
  height: number,
  onChartRender: (chart: Highcharts.Chart) => void,
): Highcharts.Options {
  return {
    chart: {
      animation: false,
      backgroundColor: 'transparent',
      height,
      margin: 0,
      spacing: [4, 4, 4, 4],
      events: {
        load() {
          onChartRender(this)
        },
        render() {
          onChartRender(this)
        },
      },
      style: {
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      },
    },
    title: undefined,
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      enabled: false,
    },
    accessibility: {
      enabled: false,
    },
    series: [
      {
        type: 'treemap',
        animation: false,
        allowTraversingTree: false,
        alternateStartingDirection: false,
        borderRadius: 10,
        clip: false,
        data: points,
        dataLabels: {
          enabled: false,
        },
        enableMouseTracking: false,
        inactiveOtherPoints: false,
        layoutAlgorithm: 'strip',
        layoutStartingDirection: 'vertical',
        nodeSizeBy: 'leaf',
        states: {
          hover: {
            enabled: false,
          },
          inactive: {
            enabled: false,
            opacity: 1,
          },
        },
      },
    ],
    plotOptions: {
      series: {
        animation: false,
        states: {
          hover: {
            enabled: false,
          },
          inactive: {
            enabled: false,
            opacity: 1,
          },
        },
      },
      treemap: {
        animation: false,
        borderRadius: 8,
        borderWidth: 4,
        borderColor: 'rgba(18, 22, 34, 0.92)',
        inactiveOtherPoints: false,
        states: {
          hover: {
            enabled: false,
          },
          inactive: {
            enabled: false,
            opacity: 1,
          },
        },
      } as Highcharts.PlotTreemapOptions & {
        borderWidth?: number
        borderColor?: Highcharts.ColorType
        inactiveOtherPoints?: boolean
        states?: {
          hover?: {
            enabled?: boolean
          }
          inactive?: {
            enabled?: boolean
            opacity?: number
          }
        }
      },
    },
  }
}
