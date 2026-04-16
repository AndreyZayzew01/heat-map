const TREEMAP_SIZE = 100;
const EPSILON = 0.0001;
export function createAssets(blockId, tribeId, items) {
    return items.map((item, idx) => ({
        id: `b${blockId}-t${tribeId}-a${idx + 1}`,
        percent: item.percent,
        value: item.value,
    }));
}
function createBlock(blockId, top, bottomLeft, bottomRight) {
    return {
        id: `block-${blockId}`,
        tribes: [
            {
                id: `block-${blockId}-tribe-top`,
                assets: createAssets(blockId, 1, top),
            },
            {
                id: `block-${blockId}-tribe-left`,
                assets: createAssets(blockId, 2, bottomLeft),
            },
            {
                id: `block-${blockId}-tribe-right`,
                assets: createAssets(blockId, 3, bottomRight),
            },
        ],
    };
}
export const heatmapBlocks = [
    createBlock(1, [
        { percent: 60, value: 4 },
        { percent: 5, value: 7 },
        { percent: 5, value: 3 },
        { percent: 9, value: 6 },
        { percent: 7, value: 10 },
        { percent: 6, value: 5 },
        { percent: 5, value: 2 },
        { percent: 3, value: 8 },
    ], [
        { percent: 24, value: 3 },
        { percent: 18, value: 6 },
        { percent: 16, value: 4 },
        { percent: 15, value: 7 },
        { percent: 14, value: 2 },
        { percent: 13, value: 8 },
    ], [
        { percent: 26, value: 9 },
        { percent: 18, value: 5 },
        { percent: 16, value: 7 },
        { percent: 14, value: 4 },
        { percent: 13, value: 8 },
        { percent: 13, value: 3 },
    ]),
    createBlock(2, [
        { percent: 29, value: 8 },
        { percent: 18, value: 4 },
        { percent: 15, value: 6 },
        { percent: 11, value: 9 },
        { percent: 9, value: 5 },
        { percent: 7, value: 3 },
        { percent: 6, value: 7 },
        { percent: 5, value: 2 },
    ], [
        { percent: 23, value: 4 },
        { percent: 19, value: 8 },
        { percent: 17, value: 6 },
        { percent: 14, value: 2 },
        { percent: 14, value: 7 },
        { percent: 13, value: 5 },
    ], [
        { percent: 22, value: 5 },
        { percent: 20, value: 9 },
        { percent: 18, value: 4 },
        { percent: 16, value: 8 },
        { percent: 13, value: 3 },
        { percent: 11, value: 7 },
    ]),
    createBlock(3, [
        { percent: 32, value: 3 },
        { percent: 17, value: 10 },
        { percent: 12, value: 5 },
        { percent: 11, value: 7 },
        { percent: 9, value: 2 },
        { percent: 7, value: 8 },
        { percent: 6, value: 4 },
        { percent: 4, value: 9 },
        { percent: 2, value: 6 },
    ], [
        { percent: 27, value: 7 },
        { percent: 18, value: 3 },
        { percent: 17, value: 8 },
        { percent: 15, value: 4 },
        { percent: 13, value: 6 },
        { percent: 10, value: 2 },
    ], [
        { percent: 25, value: 8 },
        { percent: 21, value: 5 },
        { percent: 18, value: 9 },
        { percent: 14, value: 3 },
        { percent: 12, value: 7 },
        { percent: 10, value: 4 },
    ]),
    createBlock(4, [
        { percent: 28, value: 9 },
        { percent: 16, value: 5 },
        { percent: 15, value: 4 },
        { percent: 12, value: 8 },
        { percent: 10, value: 6 },
        { percent: 7, value: 3 },
        { percent: 6, value: 10 },
        { percent: 4, value: 2 },
        { percent: 2, value: 7 },
    ], [
        { percent: 24, value: 8 },
        { percent: 19, value: 4 },
        { percent: 16, value: 7 },
        { percent: 15, value: 3 },
        { percent: 14, value: 6 },
        { percent: 12, value: 9 },
    ], [
        { percent: 30, value: 4 },
        { percent: 18, value: 7 },
        { percent: 16, value: 5 },
        { percent: 14, value: 8 },
        { percent: 12, value: 2 },
        { percent: 10, value: 9 },
    ]),
    createBlock(5, [
        { percent: 26, value: 5 },
        { percent: 18, value: 8 },
        { percent: 14, value: 4 },
        { percent: 12, value: 10 },
        { percent: 10, value: 3 },
        { percent: 8, value: 7 },
        { percent: 6, value: 2 },
        { percent: 4, value: 9 },
        { percent: 2, value: 6 },
    ], [
        { percent: 25, value: 2 },
        { percent: 18, value: 7 },
        { percent: 17, value: 4 },
        { percent: 15, value: 8 },
        { percent: 13, value: 5 },
        { percent: 12, value: 9 },
    ], [
        { percent: 24, value: 7 },
        { percent: 20, value: 3 },
        { percent: 17, value: 8 },
        { percent: 15, value: 4 },
        { percent: 13, value: 9 },
        { percent: 11, value: 5 },
    ]),
];
function getHeatmapTone(value) {
    if (value >= 8) {
        return 'healthy';
    }
    if (value >= 5) {
        return 'warning';
    }
    return 'critical';
}
function sumPercents(items) {
    return items.reduce((total, item) => total + Math.max(item.percent, 0), 0);
}
function normalizePercentages(items) {
    if (items.length === 0) {
        return [];
    }
    const total = sumPercents(items);
    if (total <= 0) {
        const equalPercent = 100 / items.length;
        return items.map((item) => ({
            ...item,
            normalizedPercent: equalPercent,
        }));
    }
    return items.map((item) => ({
        ...item,
        normalizedPercent: (Math.max(item.percent, 0) / total) * 100,
    }));
}
function getCellAspectRatio(width, height) {
    const shortestSide = Math.min(width, height);
    if (shortestSide <= 0) {
        return Number.POSITIVE_INFINITY;
    }
    return Math.max(width, height) / shortestSide;
}
function getTotalArea(items) {
    return items.reduce((total, item) => total + item.area, 0);
}
function splitBounds(bounds, firstAreaShare) {
    if (bounds.width >= bounds.height) {
        const firstWidth = bounds.width * firstAreaShare;
        return [
            {
                x: bounds.x,
                y: bounds.y,
                width: firstWidth,
                height: bounds.height,
            },
            {
                x: bounds.x + firstWidth,
                y: bounds.y,
                width: bounds.width - firstWidth,
                height: bounds.height,
            },
        ];
    }
    const firstHeight = bounds.height * firstAreaShare;
    return [
        {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: firstHeight,
        },
        {
            x: bounds.x,
            y: bounds.y + firstHeight,
            width: bounds.width,
            height: bounds.height - firstHeight,
        },
    ];
}
function layoutBalancedTreemap(items, bounds) {
    if (items.length === 0) {
        return {
            cells: [],
            worstAspectRatio: 0,
        };
    }
    if (items.length === 1) {
        const [item] = items;
        return {
            cells: [
                {
                    ...item,
                    tone: getHeatmapTone(item.value),
                    x: bounds.x,
                    y: bounds.y,
                    width: bounds.width,
                    height: bounds.height,
                },
            ],
            worstAspectRatio: getCellAspectRatio(bounds.width, bounds.height),
        };
    }
    const totalArea = getTotalArea(items);
    let bestLayout = null;
    let bestBalanceDiff = Number.POSITIVE_INFINITY;
    for (let splitIndex = 1; splitIndex < items.length; splitIndex += 1) {
        const firstItems = items.slice(0, splitIndex);
        const secondItems = items.slice(splitIndex);
        const firstArea = getTotalArea(firstItems);
        const [firstBounds, secondBounds] = splitBounds(bounds, firstArea / totalArea);
        const firstLayout = layoutBalancedTreemap(firstItems, firstBounds);
        const secondLayout = layoutBalancedTreemap(secondItems, secondBounds);
        const worstAspectRatio = Math.max(firstLayout.worstAspectRatio, secondLayout.worstAspectRatio);
        const balanceDiff = Math.abs(totalArea / 2 - firstArea);
        if (bestLayout === null ||
            worstAspectRatio < bestLayout.worstAspectRatio - EPSILON ||
            (Math.abs(worstAspectRatio - bestLayout.worstAspectRatio) <= EPSILON && balanceDiff < bestBalanceDiff)) {
            bestLayout = {
                cells: [...firstLayout.cells, ...secondLayout.cells],
                worstAspectRatio,
            };
            bestBalanceDiff = balanceDiff;
        }
    }
    return bestLayout ?? { cells: [], worstAspectRatio: 0 };
}
function buildWorkingCells(items) {
    return normalizePercentages(items).map((item) => ({
        ...item,
        area: (item.normalizedPercent / 100) * TREEMAP_SIZE * TREEMAP_SIZE,
    }));
}
export function buildTreemapLayout(items) {
    const workingCells = buildWorkingCells(items);
    if (workingCells.length === 0) {
        return [];
    }
    const bounds = {
        x: 0,
        y: 0,
        width: TREEMAP_SIZE,
        height: TREEMAP_SIZE,
    };
    return layoutBalancedTreemap(workingCells, bounds).cells;
}
