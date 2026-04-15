import type { CSSProperties } from 'react'
import {
  buildTreemapLayout,
  tribeBottomLeftData,
  tribeBottomRightData,
  tribeTopData,
  type HeatmapAsset,
} from '../data/mockHeatmap'

type TribeCardProps = {
  data: HeatmapAsset[]
  height: number
}

const BLOCK_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0411\u043B\u043E\u043A\u0430'
const TRIBE_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0422\u0440\u0430\u0439\u0431\u0430'
const DASHBOARD_CELL_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0410\u0421'

function TribeCard({ data, height }: TribeCardProps) {
  const cells = buildTreemapLayout(data)

  return (
    <article className="heatmap-card">
      <header className="heatmap-card-header">
        <h2>{TRIBE_TITLE}</h2>
      </header>

      <div className="heatmap-grid" style={{ height }}>
        {cells.map((cell) => {
          const cellStyle = {
            left: `${cell.x}%`,
            top: `${cell.y}%`,
            width: `${cell.width}%`,
            height: `${cell.height}%`,
          } satisfies CSSProperties

          return (
            <div className="heatmap-cell-slot" key={cell.id} style={cellStyle}>
              <div className={`heatmap-cell heatmap-cell--${cell.tone}`}>
                <div className="heatmap-cell-copy">
                  <span className="heatmap-cell-kicker">{DASHBOARD_CELL_TITLE}</span>
                  <span className="heatmap-cell-label">{cell.name}</span>
                </div>

                <span className="heatmap-cell-percent">{cell.normalizedPercent.toFixed(2)}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}

function HeatMapPanel() {
  const blockCount = 5

  return (
    <div className="heatmap-sections-row">
      {Array.from({ length: blockCount }, (_, idx) => (
        <section className="heatmap-section" key={`block-${idx + 1}`}>
          <h1>{BLOCK_TITLE}</h1>

          <div className="heatmap-layout">
            <TribeCard data={tribeTopData} height={564} />

            <div className="heatmap-bottom-row">
              <TribeCard data={tribeBottomLeftData} height={372} />
              <TribeCard data={tribeBottomRightData} height={372} />
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

export default HeatMapPanel
