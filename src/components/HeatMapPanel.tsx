import type { CSSProperties } from 'react'
import { buildTreemapLayout, type HeatmapAsset, type HeatmapBlock } from '../data/mockHeatmap.js'

type TribeCardProps = {
  data: HeatmapAsset[]
  height: number
}

type HeatMapPanelProps = {
  blocks: HeatmapBlock[]
}

const BLOCK_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0411\u043B\u043E\u043A\u0430'
const TRIBE_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0422\u0440\u0430\u0439\u0431\u0430'
const DASHBOARD_CELL_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0410\u0421'
const EDGE_PERCENT_THRESHOLD = 15
const COMPACT_STACK_WIDTH_THRESHOLD = 32

function TribeCard({ data, height }: TribeCardProps) {
  const cells = buildTreemapLayout(data)

  return (
    <article className="heatmap-card">
      <header className="heatmap-card-header">
        <h2>{TRIBE_TITLE}</h2>
      </header>

      <div className="heatmap-grid" style={{ height }}>
        {cells.map((cell) => {
          const isCompactPercent = cell.normalizedPercent < EDGE_PERCENT_THRESHOLD
          const shouldStackCompactPercent = isCompactPercent && cell.width < COMPACT_STACK_WIDTH_THRESHOLD
          const cellStyle = {
            left: `${cell.x}%`,
            top: `${cell.y}%`,
            width: `${cell.width}%`,
            height: `${cell.height}%`,
          } satisfies CSSProperties

          return (
            <div className="heatmap-cell-slot" key={cell.id} style={cellStyle}>
              <div className={`heatmap-cell heatmap-cell--${cell.tone}`}>
                <div
                  className={
                    isCompactPercent
                      ? shouldStackCompactPercent
                        ? 'heatmap-cell-copy heatmap-cell-copy--compact-stack'
                        : 'heatmap-cell-copy heatmap-cell-copy--compact'
                      : 'heatmap-cell-copy'
                  }
                >
                  <span className="heatmap-cell-kicker">{DASHBOARD_CELL_TITLE}</span>
                  {isCompactPercent ? (
                    <span
                      className={
                        shouldStackCompactPercent
                          ? 'heatmap-cell-percent heatmap-cell-percent--stacked'
                          : 'heatmap-cell-percent heatmap-cell-percent--inline'
                      }
                    >
                      {cell.normalizedPercent.toFixed(2)}%
                    </span>
                  ) : null}
                </div>

                {!isCompactPercent ? <span className="heatmap-cell-percent">{cell.normalizedPercent.toFixed(2)}%</span> : null}
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}

function HeatMapPanel({ blocks }: HeatMapPanelProps) {
  return (
    <div className="heatmap-sections-row">
      {blocks.map((block) => {
        const [topTribe, bottomLeftTribe, bottomRightTribe] = block.tribes

        return (
          <section className="heatmap-section" key={block.id}>
            <h1>{BLOCK_TITLE}</h1>

            <div className="heatmap-layout">
              <TribeCard data={topTribe.assets} height={564} />

              <div className="heatmap-bottom-row">
                <TribeCard data={bottomLeftTribe.assets} height={372} />
                <TribeCard data={bottomRightTribe.assets} height={372} />
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default HeatMapPanel
