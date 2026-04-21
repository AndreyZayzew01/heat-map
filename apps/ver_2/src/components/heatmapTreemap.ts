import Highcharts from 'highcharts'
import type { HeatmapAsset, HeatmapTone } from '../data/mockHeatmap.js'

export const DASHBOARD_CELL_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0410\u0421'

export type HeatmapTreemapPointCustom = {
  normalizedPercent: number
  tone: HeatmapTone
}

export type HeatmapTreemapPoint = Highcharts.PointOptionsObject & {
  custom: HeatmapTreemapPointCustom
}

const CELL_FILL: Highcharts.GradientColorObject = {
  linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
  stops: [
    [0, 'rgba(55, 58, 69, 0.84)'],
    [1, 'rgba(37, 39, 48, 0.96)'],
  ],
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

export function createTreemapPoints(assets: HeatmapAsset[]) {
  return normalizeTreemapPercents(assets).map<HeatmapTreemapPoint>((asset) => {
    const tone = getHeatmapTone(asset.value)

    return {
      id: asset.id,
      name: asset.name,
      value: Math.sqrt(Math.max(asset.percent, 0.0001)),
      color: CELL_FILL,
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
        alternateStartingDirection: true,
        borderRadius: 10,
        clip: false,
        data: points,
        dataLabels: {
          enabled: false,
        },
        enableMouseTracking: false,
        inactiveOtherPoints: false,
        layoutAlgorithm: 'squarified',
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
        borderWidth: 8,
        borderColor: 'rgba(18, 22, 34, 0.96)',
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
