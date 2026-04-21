# Treemap Minimal Gap Shadow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить минимально заметный и стабильный зазор между treemap-плитками и убрать эффект визуального слипания, не ломая overlay и текущий стиль.

**Architecture:** Решение ограничено двумя точками: визуальный шов на уровне Highcharts treemap (`borderWidth` + `borderColor`) и смягчение CSS `drop-shadow` для SVG-плиток. Логика построения `overlayCells` и позиционирование текста не изменяются, поэтому синхронизация остается прежней.

**Tech Stack:** React 19, TypeScript, Highcharts Treemap, CSS, Vite, ESLint, Vitest.

---

## File Structure (before tasks)

- Modify: `src/components/heatmapTreemap.ts`  
  Ответственность: конфигурация Highcharts treemap в `createTreemapOptions`.
- Modify: `src/styles/app.css`  
  Ответственность: визуальные эффекты SVG-плиток (`.heatmap-highcharts .highcharts-point`).
- Verify (no code changes planned): `src/components/TreemapCard.tsx`  
  Ответственность: overlay-слой, построенный из `shapeArgs`; используется как контрольная точка регрессий.

### Task 1: Add explicit treemap tile gap via Highcharts config

**Files:**
- Modify: `src/components/heatmapTreemap.ts`
- Test: Manual visual verification through running app at `http://localhost:5174/`

- [ ] **Step 1: Add failing visual expectation as acceptance note**

Create a local checklist note for verification (in terminal notes or task log):

```text
Expected after change:
1) Thin visible seams between all treemap tiles
2) No geometry shift in tile layout proportions
3) Overlay labels remain inside their own tiles
```

- [ ] **Step 2: Run app and confirm current issue is reproducible**

Run: `npm run dev -- --host 0.0.0.0 --port 5174`  
Expected: App opens and current tiles still look visually merged in dense areas.

- [ ] **Step 3: Update treemap plotOptions with minimal border seam**

Apply this exact change in `createTreemapOptions` under `plotOptions.treemap`:

```ts
treemap: {
  animation: false,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: 'rgba(19, 26, 43, 0.92)',
},
```

- [ ] **Step 4: Ensure series-level config does not override seam settings**

Verify `series: [{ type: 'treemap', ... }]` has no conflicting `borderWidth`/`borderColor` values.  
Expected: final runtime values come from `plotOptions.treemap`.

- [ ] **Step 5: Run lint for the modified file**

Run: `npm run lint -- src/components/heatmapTreemap.ts`  
Expected: PASS (exit code 0, no new lint errors).

- [ ] **Step 6: Commit Task 1**

```bash
git add src/components/heatmapTreemap.ts
git commit -m "fix: add subtle treemap seam via border settings"
```

### Task 2: Reduce shadow bleed so seams stay readable

**Files:**
- Modify: `src/styles/app.css`
- Test: Manual visual verification through running app at `http://localhost:5174/`

- [ ] **Step 1: Capture current shadow values**

Confirm existing block in `.heatmap-highcharts .highcharts-point` is:

```css
filter:
  drop-shadow(0 18px 30px rgba(0, 0, 0, 0.34))
  drop-shadow(0 6px 14px rgba(8, 12, 22, 0.28));
stroke-width: 1px;
```

- [ ] **Step 2: Replace shadow with softened values**

Update the same CSS block to:

```css
filter:
  drop-shadow(0 12px 20px rgba(0, 0, 0, 0.26))
  drop-shadow(0 4px 10px rgba(8, 12, 22, 0.2));
stroke-width: 1px;
```

- [ ] **Step 3: Verify no unintended style-side regressions**

Check that no other selectors for `.highcharts-point` override this block.  
Expected: exactly one effective rule for tile shadow.

- [ ] **Step 4: Run lint for style-related changes**

Run: `npm run lint -- src/styles/app.css`  
Expected: PASS (exit code 0, no new lint errors).

- [ ] **Step 5: Commit Task 2**

```bash
git add src/styles/app.css
git commit -m "fix: soften treemap point shadows to prevent visual merging"
```

### Task 3: Verify overlay sync and responsive behavior

**Files:**
- Verify: `src/components/TreemapCard.tsx`
- Verify: `src/components/heatmapTreemap.ts`
- Verify: `src/styles/app.css`

- [ ] **Step 1: Validate overlay still uses shapeArgs geometry**

Confirm `buildOverlayCells` in `TreemapCard` still derives:

```ts
x: shapeArgs.x,
y: shapeArgs.y,
width: shapeArgs.width,
height: shapeArgs.height,
```

Expected: no code changes required in overlay logic.

- [ ] **Step 2: Perform desktop visual verification**

In browser at default desktop width, confirm:

```text
1) Seams are visible but subtle
2) No tile overlap impression
3) Labels remain inside each tile
```

- [ ] **Step 3: Verify responsive breakpoints**

Check widths for media queries in `app.css`:

```text
max-width: 1280px
max-width: 900px
```

Expected: treemap proportions and overlay alignment remain stable.

- [ ] **Step 4: Run full project checks**

Run: `npm run lint && npm run build && npm run test:unit`  
Expected:
- `lint`: PASS
- `build`: PASS
- `test:unit`: PASS

- [ ] **Step 5: Commit verification checkpoint**

```bash
git add -A
git commit -m "test: verify treemap seam and overlay behavior across breakpoints"
```

### Task 4: Optional micro-tuning pass (only if seam is too weak)

**Files:**
- Modify (conditional): `src/components/heatmapTreemap.ts`

- [ ] **Step 1: Adjust only borderColor contrast (keep borderWidth at 1)**

If seam is too weak in very small tiles, update only color:

```ts
borderColor: 'rgba(22, 30, 49, 0.94)'
```

- [ ] **Step 2: Re-run focused verification**

Run: `npm run build`  
Expected: PASS, then re-check dense tile areas visually.

- [ ] **Step 3: Commit only if tuning was applied**

```bash
git add src/components/heatmapTreemap.ts
git commit -m "tune: slightly increase treemap seam contrast for small tiles"
```

If no tuning is needed, skip this task.

---

## Self-Review Checklist (against spec)

- Spec coverage:
  - Highcharts seam via border settings: covered in Task 1.
  - Shadow intensity reduction: covered in Task 2.
  - Overlay safety and shapeArgs sync: covered in Task 3.
  - Breakpoint validation: covered in Task 3.
- Placeholder scan:
  - No `TODO`, `TBD`, or ambiguous steps.
- Type consistency:
  - Uses existing identifiers: `createTreemapOptions`, `buildOverlayCells`, `shapeArgs`, `.heatmap-highcharts .highcharts-point`.

