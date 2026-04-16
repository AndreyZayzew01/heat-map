import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import HeatMapPanel from './components/HeatMapPanel.js';
import { getHeatmapPreset, getHeatmapPresets } from './data/heatmapPresets.js';
const DASHBOARD_KICKER = '\u041C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u0441\u043E\u0431\u044B\u0442\u0438\u0439 \u041A\u0411';
const DASHBOARD_TITLE = '\u041C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u0441\u043E\u0431\u044B\u0442\u0438\u0439 \u041A\u0411 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0439 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0438';
const PRESET_PANEL_TITLE = '\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u0438 heatmap';
const PRESET_STATUS_PREFIX = '\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0440\u0435\u0436\u0438\u043C:';
export function HeatmapDashboardView({ activePreset, activePresetId, onSelectPreset }) {
    const heatmapPresets = getHeatmapPresets();
    return (_jsxs("main", { className: "dashboard-page", children: [_jsxs("header", { className: "dashboard-header", children: [_jsx("p", { className: "dashboard-kicker", children: DASHBOARD_KICKER }), _jsx("h1", { children: DASHBOARD_TITLE })] }), _jsxs("section", { className: "dashboard-content", children: [_jsxs("section", { className: "dashboard-preset-panel", "aria-label": PRESET_PANEL_TITLE, children: [_jsxs("div", { className: "dashboard-preset-copy", children: [_jsx("p", { className: "dashboard-preset-heading", children: PRESET_PANEL_TITLE }), _jsxs("p", { className: "dashboard-preset-status", children: [PRESET_STATUS_PREFIX, " ", _jsx("strong", { children: activePreset.label })] }), _jsx("p", { className: "dashboard-preset-description", children: activePreset.description })] }), _jsx("div", { className: "dashboard-preset-group", children: heatmapPresets.map((preset) => {
                                    const isActive = preset.id === activePresetId;
                                    return (_jsx("button", { type: "button", className: isActive ? 'dashboard-preset-button dashboard-preset-button--active' : 'dashboard-preset-button', "aria-pressed": isActive, onClick: () => {
                                            onSelectPreset(preset.id);
                                        }, children: preset.label }, preset.id));
                                }) })] }), _jsx(HeatMapPanel, { blocks: activePreset.blocks })] })] }));
}
function App({ initialPresetId }) {
    const [activePresetId, setActivePresetId] = useState(() => getHeatmapPreset(initialPresetId).id);
    const activePreset = getHeatmapPreset(activePresetId);
    return _jsx(HeatmapDashboardView, { activePreset: activePreset, activePresetId: activePresetId, onSelectPreset: setActivePresetId });
}
export default App;
