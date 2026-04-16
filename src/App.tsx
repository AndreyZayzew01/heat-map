import { useState } from 'react'
import HeatMapPanel from './components/HeatMapPanel.js'
import { getHeatmapPreset, getHeatmapPresets, type HeatmapPreset, type HeatmapPresetId } from './data/heatmapPresets.js'

type AppProps = {
  initialPresetId?: string
}

type HeatmapDashboardViewProps = {
  activePreset: HeatmapPreset
  activePresetId: HeatmapPresetId
  onSelectPreset: (presetId: HeatmapPresetId) => void
}

const DASHBOARD_KICKER = '\u041C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u0441\u043E\u0431\u044B\u0442\u0438\u0439 \u041A\u0411'
const DASHBOARD_TITLE =
  '\u041C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u0441\u043E\u0431\u044B\u0442\u0438\u0439 \u041A\u0411 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0439 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0438'
const PRESET_PANEL_TITLE = '\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u0438 heatmap'
const PRESET_STATUS_PREFIX = '\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0440\u0435\u0436\u0438\u043C:'

export function HeatmapDashboardView({ activePreset, activePresetId, onSelectPreset }: HeatmapDashboardViewProps) {
  const heatmapPresets = getHeatmapPresets()

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <p className="dashboard-kicker">{DASHBOARD_KICKER}</p>
        <h1>{DASHBOARD_TITLE}</h1>
      </header>

      <section className="dashboard-content">
        <section className="dashboard-preset-panel" aria-label={PRESET_PANEL_TITLE}>
          <div className="dashboard-preset-copy">
            <p className="dashboard-preset-heading">{PRESET_PANEL_TITLE}</p>
            <p className="dashboard-preset-status">
              {PRESET_STATUS_PREFIX} <strong>{activePreset.label}</strong>
            </p>
            <p className="dashboard-preset-description">{activePreset.description}</p>
          </div>

          <div className="dashboard-preset-group">
            {heatmapPresets.map((preset) => {
              const isActive = preset.id === activePresetId

              return (
                <button
                  key={preset.id}
                  type="button"
                  className={isActive ? 'dashboard-preset-button dashboard-preset-button--active' : 'dashboard-preset-button'}
                  aria-pressed={isActive}
                  onClick={() => {
                    onSelectPreset(preset.id)
                  }}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </section>

        <HeatMapPanel blocks={activePreset.blocks} />
      </section>
    </main>
  )
}

function App({ initialPresetId }: AppProps) {
  const [activePresetId, setActivePresetId] = useState<HeatmapPresetId>(() => getHeatmapPreset(initialPresetId).id)
  const activePreset = getHeatmapPreset(activePresetId)

  return <HeatmapDashboardView activePreset={activePreset} activePresetId={activePresetId} onSelectPreset={setActivePresetId} />
}

export default App
