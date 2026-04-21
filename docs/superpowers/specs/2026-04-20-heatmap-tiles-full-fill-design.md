# Heatmap Tiles Full-Fill Visual Update Design

## Context

Current Highcharts treemap tiles use a radial fill in `src/components/heatmapTreemap.ts` (`getTreemapToneVisual`).  
On dark UI this creates a visible "center circle" impression instead of a full-surface color fill.

Goal:
- make each tile look fully filled across its entire area;
- keep the existing dark corporate style;
- increase depth with stronger but clean shadow;
- make tone colors slightly brighter and more readable without neon saturation.

Scope is intentionally local:
- `src/components/heatmapTreemap.ts`
- `src/styles/app.css`

No layout, overlay, or data logic refactor.

## Chosen Approach

Selected option: **A — linear gradient + stronger neutral shadow**.

Design decisions:
- Replace `radialGradient` with diagonal `linearGradient` in all tones.
- Keep 3-stop structure per tone:
  - brighter top tone (`0`);
  - readable mid tone (`0.52`);
  - deeper lower tone (`1`) to preserve text contrast.
- Slightly increase tone border contrast for dark background readability.
- Strengthen `.heatmap-highcharts .highcharts-point` shadow using two neutral `drop-shadow()` layers.
- Do not add extra color glow layer in CSS for this iteration (to avoid oversaturation and small-tile noise).

## Visual Parameters

### Gradient geometry (all tones)

- `linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 }`

### Healthy

- `borderColor: rgba(92, 196, 129, 0.82)`
- `stops`:
  - `[0, rgba(74, 194, 124, 0.34)]`
  - `[0.52, rgba(56, 152, 104, 0.60)]`
  - `[1, rgba(33, 44, 58, 0.96)]`

### Warning

- `borderColor: rgba(208, 174, 92, 0.80)`
- `stops`:
  - `[0, rgba(224, 174, 70, 0.34)]`
  - `[0.52, rgba(178, 132, 58, 0.58)]`
  - `[1, rgba(34, 43, 57, 0.96)]`

### Critical

- `borderColor: rgba(186, 116, 130, 0.80)`
- `stops`:
  - `[0, rgba(182, 96, 112, 0.34)]`
  - `[0.52, rgba(146, 78, 94, 0.58)]`
  - `[1, rgba(34, 42, 56, 0.96)]`

### Tile shadow

For `.heatmap-highcharts .highcharts-point`:
- `drop-shadow(0 18px 30px rgba(0, 0, 0, 0.34))`
- `drop-shadow(0 6px 14px rgba(8, 12, 22, 0.28))`

## Data/Rendering Flow Impact

- Tone selection logic (`healthy/warning/critical`) remains unchanged.
- Only tone visual tokens are updated.
- Overlay labels (`НАИМЕНОВАНИЕ АС`, percents) continue to render as before.
- Hover/inactive behavior remains unchanged.

## Error Handling and Safety

- No runtime branching changes.
- No new dependencies.
- No API or type contract changes.
- Existing Highcharts treemap option shape remains valid (`Highcharts.GradientColorObject`).

## Verification Plan

Manual checks after implementation:
- Tiles look fully filled on both small and large rectangles.
- No central radial-circle artifact remains.
- Label and percent readability remains good on all three tones.
- Border radius and tile edges render cleanly (no clipping artifacts).
- Existing overlay composition and hover/inactive behavior remain stable.

## Out of Scope

- Reworking typography or overlay structure.
- Changing treemap layout algorithm.
- Adding animated effects.
- Global redesign of dashboard color system.
