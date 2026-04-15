import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { buildTreemapLayout, heatmapBlocks } from '../data/mockHeatmap.js';
const BLOCK_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0411\u043B\u043E\u043A\u0430';
const TRIBE_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0422\u0440\u0430\u0439\u0431\u0430';
const DASHBOARD_CELL_TITLE = '\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0410\u0421';
const EDGE_PERCENT_THRESHOLD = 15;
function TribeCard({ data, height }) {
    const cells = buildTreemapLayout(data);
    return (_jsxs("article", { className: "heatmap-card", children: [_jsx("header", { className: "heatmap-card-header", children: _jsx("h2", { children: TRIBE_TITLE }) }), _jsx("div", { className: "heatmap-grid", style: { height }, children: cells.map((cell) => {
                    const isCompactPercent = cell.normalizedPercent < EDGE_PERCENT_THRESHOLD;
                    const cellStyle = {
                        left: `${cell.x}%`,
                        top: `${cell.y}%`,
                        width: `${cell.width}%`,
                        height: `${cell.height}%`,
                    };
                    return (_jsx("div", { className: "heatmap-cell-slot", style: cellStyle, children: _jsxs("div", { className: `heatmap-cell heatmap-cell--${cell.tone}`, children: [_jsxs("div", { className: isCompactPercent ? 'heatmap-cell-copy heatmap-cell-copy--compact' : 'heatmap-cell-copy', children: [_jsx("span", { className: "heatmap-cell-kicker", children: DASHBOARD_CELL_TITLE }), isCompactPercent ? (_jsxs("span", { className: "heatmap-cell-percent heatmap-cell-percent--inline", children: [cell.normalizedPercent.toFixed(2), "%"] })) : null] }), !isCompactPercent ? _jsxs("span", { className: "heatmap-cell-percent", children: [cell.normalizedPercent.toFixed(2), "%"] }) : null] }) }, cell.id));
                }) })] }));
}
function HeatMapPanel() {
    return (_jsx("div", { className: "heatmap-sections-row", children: heatmapBlocks.map((block) => {
            const [topTribe, bottomLeftTribe, bottomRightTribe] = block.tribes;
            return (_jsxs("section", { className: "heatmap-section", children: [_jsx("h1", { children: BLOCK_TITLE }), _jsxs("div", { className: "heatmap-layout", children: [_jsx(TribeCard, { data: topTribe.assets, height: 564 }), _jsxs("div", { className: "heatmap-bottom-row", children: [_jsx(TribeCard, { data: bottomLeftTribe.assets, height: 372 }), _jsx(TribeCard, { data: bottomRightTribe.assets, height: 372 })] })] })] }, block.id));
        }) }));
}
export default HeatMapPanel;
