import type { HeatmapBlock } from '../data/mockHeatmap.js'
import TreemapCard from './TreemapCard.js'

type HeatMapPanelProps = {
  blocks: HeatmapBlock[]
}

const BLOCK_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0411\u043B\u043E\u043A\u0430'
const TOP_TRIBE_TITLE = '\u0422\u0440\u0430\u0439\u0431 \u0412\u0435\u0440\u0445\u043D\u0438\u0439'
const LEFT_TRIBE_TITLE = '\u0422\u0440\u0430\u0439\u0431 \u041B\u0435\u0432\u044B\u0439'
const RIGHT_TRIBE_TITLE = '\u0422\u0440\u0430\u0439\u0431 \u041F\u0440\u0430\u0432\u044B\u0439'

function HeatMapPanel({ blocks }: HeatMapPanelProps) {
  return (
    <div className="heatmap-sections-row">
      {blocks.map((block) => {
        const [topTribe, bottomLeftTribe, bottomRightTribe] = block.tribes

        return (
          <section className="heatmap-section" key={block.id}>
            <h1>{BLOCK_TITLE}</h1>

            <div className="heatmap-layout">
              <TreemapCard title={TOP_TRIBE_TITLE} data={topTribe.assets} height={564} />

              <div className="heatmap-bottom-row">
                <TreemapCard title={LEFT_TRIBE_TITLE} data={bottomLeftTribe.assets} height={372} />
                <TreemapCard title={RIGHT_TRIBE_TITLE} data={bottomRightTribe.assets} height={372} />
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default HeatMapPanel
