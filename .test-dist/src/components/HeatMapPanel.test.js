import { jsx as _jsx } from "react/jsx-runtime";
import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { heatmapBlocks } from '../data/mockHeatmap.js';
import HeatMapPanel from './HeatMapPanel.js';
test('renders only the AS label and percentages inside cards', () => {
    const markup = renderToStaticMarkup(_jsx(HeatMapPanel, { blocks: heatmapBlocks }));
    assert.ok(markup.includes('\u041d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435 \u0410\u0421'));
    assert.match(markup, /\d+\.\d{2}%/);
    assert.ok(!markup.includes('AC 01'));
    assert.ok(!markup.includes('AC 10'));
});
test('renders percentages below 15 percent inline with the title', () => {
    const markup = renderToStaticMarkup(_jsx(HeatMapPanel, { blocks: heatmapBlocks }));
    assert.match(markup, /class="heatmap-cell-copy heatmap-cell-copy--compact"><span class="heatmap-cell-kicker">Наименование АС<\/span><span class="heatmap-cell-percent heatmap-cell-percent--inline">14\.00%<\/span><\/div>/);
    assert.match(markup, /class="heatmap-cell-percent heatmap-cell-percent--inline">13\.00%<\/span>/);
    assert.match(markup, /class="heatmap-cell-percent">15\.00%<\/span>/);
});
test('moves compact percentages onto a separate line for narrow cells', () => {
    const markup = renderToStaticMarkup(_jsx(HeatMapPanel, { blocks: heatmapBlocks }));
    assert.match(markup, /heatmap-cell-copy heatmap-cell-copy--compact-stack/);
    assert.match(markup, /class="heatmap-cell-percent heatmap-cell-percent--stacked">13\.00%<\/span>/);
});
