import assert from 'node:assert/strict';
import test from 'node:test';
import * as heatmapModule from './mockHeatmap.js';
function getBuildTreemapLayout() {
    return heatmapModule
        .buildTreemapLayout;
}
function getAreaPercent(cell) {
    return (cell.width * cell.height) / 100;
}
test('allocates half of the tribe area to a 50 percent system', () => {
    const buildTreemapLayout = getBuildTreemapLayout();
    if (!buildTreemapLayout) {
        assert.fail('Expected buildTreemapLayout to be exported');
    }
    const cells = buildTreemapLayout([
        { id: 'ac-1', name: 'AC 1', percent: 50, value: 9 },
        { id: 'ac-2', name: 'AC 2', percent: 6.25, value: 5 },
        { id: 'ac-3', name: 'AC 3', percent: 6.25, value: 5 },
        { id: 'ac-4', name: 'AC 4', percent: 6.25, value: 5 },
        { id: 'ac-5', name: 'AC 5', percent: 6.25, value: 5 },
        { id: 'ac-6', name: 'AC 6', percent: 6.25, value: 5 },
        { id: 'ac-7', name: 'AC 7', percent: 6.25, value: 5 },
        { id: 'ac-8', name: 'AC 8', percent: 6.25, value: 5 },
        { id: 'ac-9', name: 'AC 9', percent: 6.25, value: 5 },
    ]);
    assert.ok(cells);
    assert.equal(cells.length, 9);
    assert.ok(Math.abs(getAreaPercent(cells[0]) - 50) < 0.0001);
    for (const cell of cells.slice(1)) {
        assert.ok(Math.abs(getAreaPercent(cell) - 6.25) < 0.0001);
    }
});
test('normalizes percentages when the tribe total is not 100 percent', () => {
    const buildTreemapLayout = getBuildTreemapLayout();
    if (!buildTreemapLayout) {
        assert.fail('Expected buildTreemapLayout to be exported');
    }
    const cells = buildTreemapLayout([
        { id: 'ac-1', name: 'AC 1', percent: 30, value: 8 },
        { id: 'ac-2', name: 'AC 2', percent: 30, value: 6 },
    ]);
    assert.ok(cells);
    assert.equal(cells.length, 2);
    assert.ok(Math.abs(cells[0].normalizedPercent - 50) < 0.0001);
    assert.ok(Math.abs(cells[1].normalizedPercent - 50) < 0.0001);
    assert.ok(Math.abs(getAreaPercent(cells[0]) - 50) < 0.0001);
    assert.ok(Math.abs(getAreaPercent(cells[1]) - 50) < 0.0001);
});
test('keeps equal percentages equal after layout calculation', () => {
    const buildTreemapLayout = getBuildTreemapLayout();
    if (!buildTreemapLayout) {
        assert.fail('Expected buildTreemapLayout to be exported');
    }
    const cells = buildTreemapLayout([
        { id: 'ac-1', name: 'AC 1', percent: 1, value: 4 },
        { id: 'ac-2', name: 'AC 2', percent: 1, value: 4 },
        { id: 'ac-3', name: 'AC 3', percent: 1, value: 4 },
    ]);
    assert.ok(cells);
    assert.equal(cells.length, 3);
    const [first, second, third] = cells;
    assert.ok(Math.abs(first.normalizedPercent - second.normalizedPercent) < 0.0001);
    assert.ok(Math.abs(second.normalizedPercent - third.normalizedPercent) < 0.0001);
    assert.ok(Math.abs(getAreaPercent(first) - getAreaPercent(second)) < 0.0001);
    assert.ok(Math.abs(getAreaPercent(second) - getAreaPercent(third)) < 0.0001);
});
