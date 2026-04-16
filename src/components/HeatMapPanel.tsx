import type { CSSProperties } from 'react'
import { buildTreemapLayout, type HeatmapAsset, type HeatmapBlock } from '../data/mockHeatmap.js'

type TribeCardProps = {
  title: string
  data: HeatmapAsset[]
  height: number
}

type HeatMapPanelProps = {
  blocks: HeatmapBlock[]
}

const BLOCK_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0411\u043B\u043E\u043A\u0430'
const DASHBOARD_CELL_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0410\u0421'
const EDGE_PERCENT_THRESHOLD = 15
const COMPACT_STACK_WIDTH_THRESHOLD = 32
const TOP_TRIBE_TITLE = '\u0422\u0440\u0430\u0439\u0431 \u0412\u0435\u0440\u0445\u043D\u0438\u0439'
const LEFT_TRIBE_TITLE = '\u0422\u0440\u0430\u0439\u0431 \u041B\u0435\u0432\u044B\u0439'
const RIGHT_TRIBE_TITLE = '\u0422\u0440\u0430\u0439\u0431 \u041F\u0440\u0430\u0432\u044B\u0439'

function TribeCard({ title, data, height }: TribeCardProps) {
  const cells = buildTreemapLayout(data)

  return (
    <article className="heatmap-card">
      <h2 className="heatmap-card-title">{title}</h2>

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
              <TribeCard title={TOP_TRIBE_TITLE} data={topTribe.assets} height={564} />

              <div className="heatmap-bottom-row">
                <TribeCard title={LEFT_TRIBE_TITLE} data={bottomLeftTribe.assets} height={372} />
                <TribeCard title={RIGHT_TRIBE_TITLE} data={bottomRightTribe.assets} height={372} />
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default HeatMapPanel
