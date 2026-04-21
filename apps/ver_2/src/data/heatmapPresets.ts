import {
  heatmapBlocks,
  type HeatmapAsset,
  type HeatmapBlock,
  type HeatmapTribe,
} from "./mockHeatmap.js";

export type HeatmapPresetId = "default" | "elevated" | "critical";

export type HeatmapPreset = {
  id: HeatmapPresetId;
  label: string;
  description: string;
  blocks: HeatmapBlock[];
};

type HeatmapPresetDefinition = Omit<HeatmapPreset, "blocks"> & {
  blocks: () => HeatmapBlock[];
};

const DEFAULT_PRESET_ID: HeatmapPresetId = "default";
const ROUNDING_FACTOR = 100;
const ELEVATED_WEIGHTS = [1.18, 1.1, 1.04, 0.98, 0.92, 0.86, 0.8, 0.74, 0.68];
const CRITICAL_WEIGHTS = [1.34, 1.2, 1.08, 0.96, 0.84, 0.72, 0.62, 0.54, 0.46];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function sumPercents(assets: HeatmapAsset[]) {
  return assets.reduce((total, asset) => total + Math.max(asset.percent, 0), 0);
}

function cloneAssets(assets: HeatmapAsset[]) {
  return assets.map((asset) => ({
    ...asset,
  }));
}

function cloneTribe(tribe: HeatmapTribe): HeatmapTribe {
  return {
    ...tribe,
    assets: cloneAssets(tribe.assets),
  };
}

function cloneBlocks(blocks: HeatmapBlock[]) {
  return blocks.map((block) => ({
    ...block,
    tribes: block.tribes.map((tribe) =>
      cloneTribe(tribe),
    ) as HeatmapBlock["tribes"],
  }));
}

function normalizePercents(values: number[], targetTotal: number) {
  const safeTargetTotal = Math.max(targetTotal, 0);
  const totalUnits = Math.round(safeTargetTotal * ROUNDING_FACTOR);
  const rawTotal = values.reduce((sum, value) => sum + Math.max(value, 0), 0);

  if (values.length === 0) {
    return [];
  }

  if (rawTotal <= 0) {
    const evenShare = Math.floor(totalUnits / values.length);
    const remainder = totalUnits - evenShare * values.length;

    return values.map(
      (_, index) => (evenShare + (index < remainder ? 1 : 0)) / ROUNDING_FACTOR,
    );
  }

  const scaled = values.map(
    (value) => (Math.max(value, 0) / rawTotal) * totalUnits,
  );
  const units = scaled.map((value) => Math.floor(value));
  let remainder = totalUnits - units.reduce((sum, value) => sum + value, 0);
  const indicesByFraction = scaled
    .map((value, index) => ({
      index,
      fraction: value - Math.floor(value),
    }))
    .sort((left, right) => right.fraction - left.fraction);

  for (
    let index = 0;
    index < indicesByFraction.length && remainder > 0;
    index += 1
  ) {
    units[indicesByFraction[index].index] += 1;
    remainder -= 1;
  }

  return units.map((value) => value / ROUNDING_FACTOR);
}

function getWeight(weights: number[], index: number) {
  return weights[Math.min(index, weights.length - 1)] ?? 1;
}

function getElevatedValue(value: number, index: number) {
  const reduction = index === 0 ? 3 : index < 3 ? 2 : 1;

  return clamp(value - reduction, 1, 10);
}

function getCriticalValue(value: number, index: number) {
  const reduction = index === 0 ? 6 : index < 3 ? 4 : 3;

  return clamp(value - reduction, 1, 10);
}

function transformAssets(
  assets: HeatmapAsset[],
  weights: number[],
  getScenarioValue: (value: number, index: number) => number,
) {
  const targetTotal = Math.min(sumPercents(assets), 100);
  const weightedPercents = assets.map(
    (asset, index) => asset.percent * getWeight(weights, index),
  );
  const normalizedPercents = normalizePercents(weightedPercents, targetTotal);

  return assets.map((asset, index) => ({
    ...asset,
    percent: normalizedPercents[index] ?? 0,
    value: getScenarioValue(asset.value, index),
  }));
}

function transformBlocks(
  blocks: HeatmapBlock[],
  weights: number[],
  getScenarioValue: (value: number, index: number) => number,
) {
  return blocks.map((block) => ({
    ...block,
    tribes: block.tribes.map((tribe) => ({
      ...tribe,
      assets: transformAssets(tribe.assets, weights, getScenarioValue),
    })) as HeatmapBlock["tribes"],
  }));
}

const heatmapPresetDefinitions: HeatmapPresetDefinition[] = [
  {
    id: "default",
    label: "\u0411\u0430\u0437\u043E\u0432\u044B\u0439",
    description:
      "\u0411\u0430\u0437\u043E\u0432\u0430\u044F \u043A\u0430\u0440\u0442\u0438\u043D\u0430 \u043F\u043E \u043C\u0435\u0442\u0440\u0438\u043A\u0430\u043C \u0438 \u0440\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u044E \u0434\u043E\u043B\u0435\u0439.",
    blocks: () => cloneBlocks(heatmapBlocks),
  },
  {
    id: "elevated",
    label:
      "\u041F\u043E\u0432\u044B\u0448\u0435\u043D\u043D\u044B\u0439 \u0440\u0438\u0441\u043A",
    description:
      "\u0423\u043C\u0435\u0440\u0435\u043D\u043D\u043E \u0443\u0445\u0443\u0434\u0448\u0435\u043D\u043D\u044B\u0439 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0439 \u0441 \u0440\u043E\u0441\u0442\u043E\u043C warning \u0438 critical \u0437\u043E\u043D.",
    blocks: () =>
      transformBlocks(
        cloneBlocks(heatmapBlocks),
        ELEVATED_WEIGHTS,
        getElevatedValue,
      ),
  },
  {
    id: "critical",
    label: "\u041A\u0440\u0438\u0437\u0438\u0441\u043D\u044B\u0439",
    description:
      "\u041A\u0440\u0438\u0437\u0438\u0441\u043D\u044B\u0439 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0439 \u0441 \u044F\u0432\u043D\u044B\u043C \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435\u043C \u0432 critical-\u043C\u0435\u0442\u0440\u0438\u043A\u0438.",
    blocks: () =>
      transformBlocks(
        cloneBlocks(heatmapBlocks),
        CRITICAL_WEIGHTS,
        getCriticalValue,
      ),
  },
];

export function getHeatmapPresets(): HeatmapPreset[] {
  return heatmapPresetDefinitions.map((preset) => ({
    id: preset.id,
    label: preset.label,
    description: preset.description,
    blocks: preset.blocks(),
  }));
}

export function getHeatmapPreset(presetId: string | undefined) {
  const normalizedPresetId = presetId ?? DEFAULT_PRESET_ID;
  const heatmapPresetMap = new Map(
    getHeatmapPresets().map((preset) => [preset.id, preset] as const),
  );
  const preset = heatmapPresetMap.get(normalizedPresetId as HeatmapPresetId);

  if (preset) {
    return preset;
  }

  console.warn(
    `Unknown heatmap preset id "${normalizedPresetId}", falling back to default.`,
  );

  return heatmapPresetMap.get(DEFAULT_PRESET_ID)!;
}
