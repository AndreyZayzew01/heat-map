# Heatmap Tiles Full-Fill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Обновить визуал treemap-плиток так, чтобы цвет заполнял всю площадь, цвета стали умеренно ярче на dark UI, а тень давала более читаемую глубину без визуального шума.

**Architecture:** Изменения локальны в двух файлах. В `getTreemapToneVisual` заменяется модель заливки с radial на диагональный linear gradient с новыми stop-параметрами для `healthy/warning/critical`. В CSS усиливается тень именно у `highcharts-point`, без изменений в overlay-слое, логике подписей и layout treemap.

**Tech Stack:** TypeScript, Highcharts treemap, CSS (drop-shadow filters), Vite.

---

### Task 1: Обновить тоновые градиенты treemap в `heatmapTreemap.ts`

**Files:**
- Modify: `src/components/heatmapTreemap.ts`
- Test: ручная визуальная проверка в dev-server (treemap cards)

- [ ] **Step 1: Зафиксировать failing-проверку текущего артефакта (radial circle)**

Run: `npm run dev`  
Expected: на текущей версии плитки выглядят с центральным radial-эффектом, а не full-fill.

- [ ] **Step 2: Заменить gradient geometry с radial на linear для всех тонов**

В `getTreemapToneVisual` заменить:

```ts
fillColor: {
  radialGradient: { cx: 0.52, cy: 0.42, r: 0.66 },
  stops: [...]
}
```

на:

```ts
fillColor: {
  linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
  stops: [...]
}
```

- [ ] **Step 3: Применить согласованные border/stops для `healthy`, `warning`, `critical`**

```ts
case 'healthy':
  return {
    borderColor: 'rgba(92, 196, 129, 0.82)',
    fillColor: {
      linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
      stops: [
        [0, 'rgba(74, 194, 124, 0.34)'],
        [0.52, 'rgba(56, 152, 104, 0.60)'],
        [1, 'rgba(33, 44, 58, 0.96)'],
      ],
    },
  }
```

```ts
case 'warning':
  return {
    borderColor: 'rgba(208, 174, 92, 0.80)',
    fillColor: {
      linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
      stops: [
        [0, 'rgba(224, 174, 70, 0.34)'],
        [0.52, 'rgba(178, 132, 58, 0.58)'],
        [1, 'rgba(34, 43, 57, 0.96)'],
      ],
    },
  }
```

```ts
default:
  return {
    borderColor: 'rgba(186, 116, 130, 0.80)',
    fillColor: {
      linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
      stops: [
        [0, 'rgba(182, 96, 112, 0.34)'],
        [0.52, 'rgba(146, 78, 94, 0.58)'],
        [1, 'rgba(34, 42, 56, 0.96)'],
      ],
    },
  }
```

- [ ] **Step 4: Проверить типизацию TypeScript и сборку**

Run: `npm run build`  
Expected: build succeeds, ошибок типов по `Highcharts.GradientColorObject` нет.

- [ ] **Step 5: Commit**

```bash
git add src/components/heatmapTreemap.ts
git commit -m "feat: switch treemap tiles to full-fill linear gradients"
```

### Task 2: Усилить тени плиток в `app.css` без ломки overlay

**Files:**
- Modify: `src/styles/app.css`
- Test: ручная визуальная проверка на small/large tiles

- [ ] **Step 1: Зафиксировать baseline тени перед изменением**

Текущий фрагмент:

```css
.heatmap-highcharts .highcharts-point {
  filter: drop-shadow(0 14px 24px rgba(0,0,0,0.28));
  stroke-width: 1px;
}
```

- [ ] **Step 2: Обновить filter до двухслойной глубины**

```css
.heatmap-highcharts .highcharts-point {
  filter:
    drop-shadow(0 18px 30px rgba(0, 0, 0, 0.34))
    drop-shadow(0 6px 14px rgba(8, 12, 22, 0.28));
  stroke-width: 1px;
}
```

- [ ] **Step 3: Убедиться, что hover/overlay слои не затронуты**

Run: `rg "heatmap-chart-overlay|highcharts-point|hover" src/styles/app.css src/components`  
Expected: нет незапланированных изменений вне `highcharts-point` и тоновых параметров treemap.

- [ ] **Step 4: Визуальная проверка в браузере**

Run: `npm run dev`  
Checklist:
- small и large плитки визуально консистентны;
- цвет выглядит full-fill по всей площади;
- `НАИМЕНОВАНИЕ АС` и проценты читаемы;
- нет артефактов по скруглениям/бордерам;
- общая dark-композиция сохранена.

- [ ] **Step 5: Commit**

```bash
git add src/styles/app.css
git commit -m "style: increase treemap tile depth with layered shadow"
```

### Task 3: Финальная верификация и подготовка отчета для пользователя

**Files:**
- Modify: нет (если всё в порядке)
- Test: build + manual QA checklist

- [ ] **Step 1: Запустить финальную проверку сборки**

Run: `npm run build`  
Expected: PASS.

- [ ] **Step 2: Проверить рабочее дерево**

Run: `git status --short`  
Expected: только ожидаемые изменения (или чисто после коммитов).

- [ ] **Step 3: Подготовить итог для пользователя в требуемом формате**

Include:
- краткое объяснение что и зачем поменяли;
- diff по `src/components/heatmapTreemap.ts` и `src/styles/app.css`;
- отдельный блок с финальными параметрами градиентов и теней для тонкой настройки.

- [ ] **Step 4: Commit (если были пост-правки по QA)**

```bash
git add src/components/heatmapTreemap.ts src/styles/app.css
git commit -m "chore: finalize heatmap tile visual tuning verification"
```

