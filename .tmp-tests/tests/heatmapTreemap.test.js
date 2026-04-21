import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHeatmapTreemapOptions, createHeatmapTreemapSeriesData, getAssetLabelMarkup } from '../src/charts/heatmapTreemap.js';
import { createAssets, heatmapBlocks } from '../src/data/mockHeatmap.js';
function createTestBlock() {
    return {
        id: 'block-test',
        tribes: [
            {
                id: 'block-test-tribe-top',
                assets: createAssets(1, 1, [
                    { percent: 30, value: 9 },
                    { percent: 10, value: 4 },
                ]),
            },
            {
                id: 'block-test-tribe-left',
                assets: createAssets(1, 2, [{ percent: 100, value: 6 }]),
            },
            {
                id: 'block-test-tribe-right',
                assets: createAssets(1, 3, [{ percent: 100, value: 2 }]),
            },
        ],
    };
}
function readWorktreeFile(...segments) {
    return readFileSync(join(process.cwd(), ...segments), 'utf8').replace(/\r\n/g, '\n');
}
function readRootFile(...segments) {
    return readFileSync(join(process.cwd(), '..', '..', ...segments), 'utf8').replace(/\r\n/g, '\n');
}
test('scales tribe areas to match the main layout proportions', () => {
    const seriesData = createHeatmapTreemapSeriesData(createTestBlock());
    const topTribeNode = seriesData.find((point) => point.id === 'block-test-tribe-top');
    const leftTribeNode = seriesData.find((point) => point.id === 'block-test-tribe-left');
    const rightTribeNode = seriesData.find((point) => point.id === 'block-test-tribe-right');
    assert.equal(topTribeNode?.value, 60);
    assert.equal(leftTribeNode?.value, 20);
    assert.equal(rightTribeNode?.value, 20);
});
test('keeps base application CSS files identical to root styles while allowing treemap-specific worktree styling', () => {
    assert.equal(readWorktreeFile('src', 'index.css'), readRootFile('src', 'index.css'));
    assert.equal(readWorktreeFile('src', 'App.css'), readRootFile('src', 'App.css'));
});
test('assigns separate SVG classes to tribe and leaf treemap points', () => {
    const seriesData = createHeatmapTreemapSeriesData(createTestBlock());
    const tribeNode = seriesData.find((point) => point.id === 'block-test-tribe-top');
    const healthyLeaf = seriesData.find((point) => point.id === 'b1-t1-a1');
    const criticalLeaf = seriesData.find((point) => point.id === 'b1-t1-a2');
    const warningLeaf = seriesData.find((point) => point.id === 'b1-t2-a1');
    assert.equal(tribeNode?.className, 'heatmap-tribe-node');
    assert.equal(healthyLeaf?.className, 'heatmap-cell heatmap-cell--healthy');
    assert.equal(criticalLeaf?.className, 'heatmap-cell heatmap-cell--critical');
    assert.equal(warningLeaf?.className, 'heatmap-cell heatmap-cell--warning');
});
test('adds dedicated CSS hooks for Highcharts treemap SVG points and data labels', () => {
    const stylesheet = readWorktreeFile('src', 'styles', 'app.css');
    assert.match(stylesheet, /\.highcharts-point\.heatmap-cell/);
    assert.match(stylesheet, /\.highcharts-point\.heatmap-tribe-node/);
    assert.match(stylesheet, /\.heatmap-cell--critical[\s\S]*url\(#heatmapLeafPattern-critical\)/);
    assert.match(stylesheet, /\.heatmap-cell--warning[\s\S]*url\(#heatmapLeafPattern-warning\)/);
    assert.match(stylesheet, /\.heatmap-cell--healthy[\s\S]*url\(#heatmapLeafPattern-healthy\)/);
    assert.match(stylesheet, /\.highcharts-data-label\.heatmap-leaf-data-label/);
    assert.match(stylesheet, /\.highcharts-data-label\.heatmap-tribe-data-label/);
});
test('uses the transferred treemap theme from main', () => {
    const options = createHeatmapTreemapOptions(heatmapBlocks[0], 0);
    const treemapOptions = options.plotOptions?.treemap;
    const levels = treemapOptions?.levels ?? [];
    const tribeLevel = levels[0];
    const assetLevel = levels[1];
    const tribeDataLabels = Array.isArray(tribeLevel?.dataLabels) ? tribeLevel.dataLabels[0] : tribeLevel?.dataLabels;
    const assetDataLabels = Array.isArray(assetLevel?.dataLabels) ? assetLevel.dataLabels[0] : assetLevel?.dataLabels;
    const responsiveRule = options.responsive?.rules?.[0];
    assert.equal(options.chart?.height, 948);
    assert.equal(treemapOptions?.layoutAlgorithm, 'sliceAndDice');
    assert.equal(treemapOptions?.layoutStartingDirection, 'vertical');
    assert.equal(treemapOptions?.groupPadding, 12);
    assert.equal(treemapOptions?.borderRadius, 12);
    assert.equal(tribeDataLabels?.useHTML, true);
    assert.equal(tribeDataLabels?.className, 'heatmap-tribe-data-label');
    assert.equal(assetDataLabels?.useHTML, true);
    assert.equal(assetDataLabels?.className, 'heatmap-leaf-data-label');
    assert.equal(typeof options.chart?.events?.render, 'function');
    assert.equal(responsiveRule?.condition?.maxWidth, 900);
    assert.equal(responsiveRule?.chartOptions?.chart?.height, 720);
});
test('disables tooltip and reduces tile spacing for the compact screenshot look', () => {
    const options = createHeatmapTreemapOptions(heatmapBlocks[0], 0);
    const treemapOptions = options.plotOptions?.treemap;
    const levels = treemapOptions?.levels ?? [];
    const tribeLevel = levels[0];
    const assetLevel = levels[1];
    assert.equal(options.tooltip?.enabled, false);
    assert.equal(treemapOptions?.groupPadding, 12);
    assert.equal(tribeLevel?.borderWidth, 2);
    assert.equal(assetLevel?.borderWidth, 2);
});
test('keeps treemap tiles visually stable on hover', () => {
    const options = createHeatmapTreemapOptions(heatmapBlocks[0], 0);
    const treemapOptions = options.plotOptions?.treemap;
    const states = treemapOptions?.states;
    assert.equal(states?.hover?.enabled, false);
    assert.equal(states?.inactive?.opacity, 1);
});
test('uses requested two-color base background for leaf tiles', () => {
    const seriesData = createHeatmapTreemapSeriesData(heatmapBlocks[0]);
    const expectedStops = ['rgba(55, 58, 69, 0.84)', 'rgba(37, 39, 48, 0.96)'];
    let checkedLeafCount = 0;
    for (const point of seriesData) {
        if (!point.parent || !point.color || typeof point.color === 'string') {
            continue;
        }
        const gradient = point.color;
        const stops = gradient.stops?.map((stop) => stop[1]);
        checkedLeafCount += 1;
        assert.deepEqual(stops, expectedStops);
    }
    assert.ok(checkedLeafCount > 0);
});
test('maps glow tones through border colors for each tile value band', () => {
    const seriesData = createHeatmapTreemapSeriesData(createTestBlock());
    const healthyTile = seriesData.find((point) => point.id === 'b1-t1-a1');
    const criticalTile = seriesData.find((point) => point.id === 'b1-t1-a2');
    const warningTile = seriesData.find((point) => point.id === 'b1-t2-a1');
    assert.equal(healthyTile?.custom?.tone, 'healthy');
    assert.equal(healthyTile?.borderColor, 'rgba(77, 181, 114, 0.74)');
    assert.equal(criticalTile?.custom?.tone, 'critical');
    assert.equal(criticalTile?.borderColor, 'rgba(160, 99, 111, 0.68)');
    assert.equal(warningTile?.custom?.tone, 'warning');
    assert.equal(warningTile?.borderColor, 'rgba(186, 157, 79, 0.7)');
});
test('renders gradient-capable leaf label markup with tone class', () => {
    const markup = getAssetLabelMarkup({
        id: 'asset-1',
        name: 'АС 01',
        custom: {
            tone: 'healthy',
            metricValue: 8,
            rawPercent: 11,
            normalizedPercent: 11,
            tribeLabel: 'Трайб Верхний',
        },
    }, 160);
    assert.match(markup, /heatmap-asset-label/);
    assert.doesNotMatch(markup, /heatmap-asset-label__surface/);
    assert.doesNotMatch(markup, /heatmap-asset-label--tone-/);
});
test('renders compact stacked labels for narrow low-percent tiles', () => {
    const markup = getAssetLabelMarkup({
        id: 'asset-1',
        name: 'АС 01',
        custom: {
            tone: 'warning',
            metricValue: 6,
            rawPercent: 6,
            normalizedPercent: 6,
            tribeLabel: 'Трайб Верхний',
        },
    }, 72);
    assert.match(markup, /heatmap-asset-label--compact-stack/);
    assert.match(markup, />6\.00%</);
});
