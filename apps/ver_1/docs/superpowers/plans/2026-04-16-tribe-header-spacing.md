# Tribe Header Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visually separate tribe titles from treemap rectangles so headers never overlap or touch the content area.

**Architecture:** Keep the existing card structure, but strengthen the dedicated header zone inside each tribe card. Increase header spacing and add a stable gap before the treemap grid so the blocks always start lower than the title.

**Tech Stack:** React, TypeScript, CSS, Vite

---

### Task 1: Tribe card header spacing

**Files:**
- Modify: `src/styles/app.css`
- Verify: `npm run build`, `npm run lint`

- [ ] **Step 1: Adjust the tribe card header zone**

```css
.heatmap-card {
  padding: 12px;
}

.heatmap-card-header {
  padding: 2px 2px 0;
  margin-bottom: 14px;
}

.heatmap-card-header h2 {
  line-height: 1.2;
}
```

- [ ] **Step 2: Keep the treemap content below the title**

```css
.heatmap-grid {
  margin-top: 0;
}
```

- [ ] **Step 3: Verify the project still builds**

Run: `npm run build`
Expected: Vite and TypeScript build completes successfully.

- [ ] **Step 4: Verify lint status**

Run: `npm run lint`
Expected: ESLint completes without new errors in edited files.
