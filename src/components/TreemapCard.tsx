import { useCallback, useMemo, useState } from 'react'
import Highcharts from 'highcharts'
import TreemapModule from 'highcharts/modules/treemap'
import HighchartsReact from 'highcharts-react-official'
import type { HeatmapAsset, HeatmapTone } from '../data/mockHeatmap.js'
import {
  DASHBOARD_CELL_TITLE,
  createTreemapOptions,
  createTreemapPoints,
  getTreemapLabelMode,
  type HeatmapTreemapPoint,
} from './heatmapTreemap.js'

const initTreemapModule = TreemapModule as unknown as ((highcharts: typeof Highcharts) => void) | undefined

if (typeof initTreemapModule === 'function') {
  initTreemapModule(Highcharts)
}

type TreemapCardProps = {
  title: string
  data: HeatmapAsset[]
  height: number
}

type OverlayCell = {
  id: string
  height: number
  normalizedPercent: number
  tone: HeatmapTone
  width: number
  widthPercent: number
  x: number
  y: number
}

type TreemapShapeArgs = {
  height?: number
  width?: number
  x?: number
  y?: number
}

function buildOverlayCells(chart: Highcharts.Chart) {
  const [series] = chart.series

  if (!series || chart.plotWidth <= 0) {
    return []
  }

  return series.points.flatMap((point) => {
    const shapeArgs = point.shapeArgs as TreemapShapeArgs | undefined
    const pointOptions = point.options as HeatmapTreemapPoint

    if (
      !shapeArgs ||
      typeof shapeArgs.x !== 'number' ||
      typeof shapeArgs.y !== 'number' ||
      typeof shapeArgs.width !== 'number' ||
      typeof shapeArgs.height !== 'number' ||
      shapeArgs.width <= 0 ||
      shapeArgs.height <= 0 ||
      !pointOptions.custom
    ) {
      return []
    }

    return [
      {
        id: pointOptions.id ?? `${shapeArgs.x}-${shapeArgs.y}`,
        x: shapeArgs.x,
        y: shapeArgs.y,
        width: shapeArgs.width,
        height: shapeArgs.height,
        widthPercent: (shapeArgs.width / chart.plotWidth) * 100,
        normalizedPercent: pointOptions.custom.normalizedPercent,
        tone: pointOptions.custom.tone,
      } satisfies OverlayCell,
    ]
  })
}

function buildOverlaySignature(cells: OverlayCell[]) {
  return cells
    .map((cell) =>
      [
        cell.id,
        cell.x.toFixed(1),
        cell.y.toFixed(1),
        cell.width.toFixed(1),
        cell.height.toFixed(1),
        cell.normalizedPercent.toFixed(2),
      ].join(':'),
    )
    .join('|')
}

function TreemapCard({ title, data, height }: TreemapCardProps) {
  const [overlayCells, setOverlayCells] = useState<OverlayCell[]>([])
  const points = useMemo(() => createTreemapPoints(data), [data])
  const syncOverlayCells = useCallback((chart: Highcharts.Chart) => {
    const nextCells = buildOverlayCells(chart)
    const nextSignature = buildOverlaySignature(nextCells)

    setOverlayCells((currentCells) => {
      if (buildOverlaySignature(currentCells) === nextSignature) {
        return currentCells
      }

      return nextCells
    })
  }, [])

  const options = useMemo(() => createTreemapOptions(points, height, syncOverlayCells), [height, points, syncOverlayCells])

  return (
    <article className="heatmap-card">
      <h2 className="heatmap-card-title">{title}</h2>

      <div className="heatmap-grid heatmap-grid--chart" style={{ height }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          containerProps={{ className: 'heatmap-highcharts' }}
          updateArgs={[true, true, false]}
        />

        <div className="heatmap-chart-overlay" aria-hidden="true">
          {overlayCells.map((cell) => {
            const labelMode = getTreemapLabelMode(cell.normalizedPercent, cell.widthPercent)
            const isCompact = labelMode !== 'full'
            const percentText = `${cell.normalizedPercent.toFixed(2)}%`

            return (
              <div
                className="heatmap-overlay-cell"
                key={cell.id}
                style={{
                  left: `${cell.x}px`,
                  top: `${cell.y}px`,
                  width: `${cell.width}px`,
                  height: `${cell.height}px`,
                }}
              >
                <div
                  className={
                    isCompact
                      ? labelMode === 'compact-stack'
                        ? 'heatmap-cell-copy heatmap-cell-copy--compact-stack'
                        : 'heatmap-cell-copy heatmap-cell-copy--compact'
                      : 'heatmap-cell-copy'
                  }
                >
                  <span className="heatmap-cell-kicker">{DASHBOARD_CELL_TITLE}</span>
                  {isCompact ? (
                    <span
                      className={
                        labelMode === 'compact-stack'
                          ? 'heatmap-cell-percent heatmap-cell-percent--stacked'
                          : 'heatmap-cell-percent heatmap-cell-percent--inline'
                      }
                    >
                      {percentText}
                    </span>
                  ) : null}
                </div>

                {!isCompact ? <span className="heatmap-cell-percent">{percentText}</span> : null}
              </div>
            )
          })}
        </div>
      </div>
    </article>
  )
}

export default TreemapCard
