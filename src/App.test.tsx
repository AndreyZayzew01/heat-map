import assert from 'node:assert/strict'
import test from 'node:test'
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react'
import { isValidElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import App, { HeatmapDashboardView } from './App.js'
import HeatMapPanel from './components/HeatMapPanel.js'
import { getHeatmapPreset, getHeatmapPresets, type HeatmapPresetId } from './data/heatmapPresets.js'

type ButtonElement = ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>
type ElementWithChildren = ReactElement<{ children?: ReactNode }>

function collectButtons(node: ReactNode, result: ButtonElement[] = []) {
  if (Array.isArray(node)) {
    for (const child of node) {
      collectButtons(child, result)
    }

    return result
  }

  if (!isValidElement(node)) {
    return result
  }

  if (node.type === 'button') {
    result.push(node as ButtonElement)
  }

  collectButtons((node as ElementWithChildren).props.children, result)

  return result
}

function findHeatMapPanel(node: ReactNode): ReactElement<{ blocks: unknown }> | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const panel = findHeatMapPanel(child)

      if (panel) {
        return panel
      }
    }

    return null
  }

  if (!isValidElement(node)) {
    return null
  }

  if (node.type === HeatMapPanel) {
    return node as ReactElement<{ blocks: unknown }>
  }

  return findHeatMapPanel((node as ElementWithChildren).props.children)
}

function getButtonText(children: ReactNode): string {
  if (Array.isArray(children)) {
    return children.map((child) => getButtonText(child)).join('')
  }

  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }

  if (!isValidElement(children)) {
    return ''
  }

  return getButtonText((children as ElementWithChildren).props.children)
}

test('renders three preset buttons and current mode label', () => {
  const markup = renderToStaticMarkup(<App />)
  const heatmapPresets = getHeatmapPresets()

  assert.match(markup, /\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0440\u0435\u0436\u0438\u043C:/)

  for (const preset of heatmapPresets) {
    assert.ok(markup.includes(preset.label))
  }
})

test('invokes preset selection on button click', () => {
  const selectedPresetIds: HeatmapPresetId[] = []
  const activePreset = getHeatmapPreset('default')
  const view = HeatmapDashboardView({
    activePreset,
    activePresetId: activePreset.id,
    onSelectPreset: (presetId) => {
      selectedPresetIds.push(presetId)
    },
  })
  const buttons = collectButtons(view)
  const criticalButton = buttons.find((button) => getButtonText(button.props.children).includes(getHeatmapPreset('critical').label))

  assert.equal(buttons.length, 3)
  assert.ok(criticalButton)

  criticalButton.props.onClick?.({} as never)

  assert.deepEqual(selectedPresetIds, ['critical'])
})

test('passes the active preset blocks into HeatMapPanel', () => {
  const elevatedPreset = getHeatmapPreset('elevated')
  const view = HeatmapDashboardView({
    activePreset: elevatedPreset,
    activePresetId: elevatedPreset.id,
    onSelectPreset: () => {},
  })
  const panel = findHeatMapPanel(view)

  assert.ok(panel)
  assert.equal(panel.props.blocks, elevatedPreset.blocks)
})
