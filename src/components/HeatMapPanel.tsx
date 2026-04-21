import Highcharts from 'highcharts'
import 'highcharts/modules/treemap'
import HighchartsReact from 'highcharts-react-official'
import { createHeatmapTreemapOptions } from '../charts/heatmapTreemap.js'
import type { HeatmapBlock } from '../data/mockHeatmap.js'

type HeatMapPanelProps = {
  blocks: HeatmapBlock[]
}

const BLOCK_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0411\u043B\u043E\u043A\u0430'

function HeatMapPanel({ blocks }: HeatMapPanelProps) {
  return (
    <div className="heatmap-sections-row">
      {blocks.map((block, blockIndex) => (
        <section className="heatmap-section" key={block.id}>
          <h1>{BLOCK_TITLE}</h1>

          <div className="heatmap-chart-shell">
            <HighchartsReact
              highcharts={Highcharts}
              options={createHeatmapTreemapOptions(block, blockIndex)}
              containerProps={{ className: 'heatmap-chart-container' }}
            />
          </div>
        </section>
      ))}
    </div>
  )
}

export default HeatMapPanel
