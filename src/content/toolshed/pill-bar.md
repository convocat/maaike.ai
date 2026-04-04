---
title: Pill bar
date: 2026-04-04
maturity: solid
tags: [design, ui-components, interaction]
description: "A segmented control for mutually exclusive options: sort order, view mode, any pick-one group."
category: design
section: Interactive controls
ai: co-created
---

A pill bar is a row of options in a shared trough. Visually it reads as one control, not a row of separate buttons. Use it for choices where only one option can be active at a time.

## Two variants

**Radio inputs** when the state must survive JavaScript and only one option is ever valid:

```html
<div class="pill-bar" role="group" aria-label="Sort by">
  <label class="pill-option">
    <input type="radio" class="sr-only" name="sort" value="date" checked />
    <span>Date added</span>
  </label>
  <label class="pill-option">
    <input type="radio" class="sr-only" name="sort" value="title" />
    <span>Title A-Z</span>
  </label>
</div>
```

**Buttons** when JavaScript controls the state (view switching, DOM changes):

```html
<div class="pill-bar" role="group" aria-label="Display mode">
  <button class="pill-btn active" data-view="cards" aria-pressed="true">Cards</button>
  <button class="pill-btn" data-view="list" aria-pressed="false">List</button>
</div>
```

## CSS

```css
.pill-bar {
  display: flex;
  gap: 2px;
  background: var(--color-border);
  border-radius: 0.5rem;
  padding: 2px;
}

.pill-option { cursor: pointer; }
.pill-option span,
.pill-btn {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.65rem;
  border-radius: 0.35rem;
  font-size: 0.75rem;
  font-family: inherit;
  line-height: 1;
  color: var(--color-text-muted);
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}
.pill-option:has(input:checked) span,
.pill-btn.active {
  background: var(--color-bg);
  color: var(--color-text);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.pill-btn {
  border: none;
  background: transparent;
  cursor: pointer;
}
```

## The line-height trap

Always set `line-height: 1` on pill items. Buttons default to `line-height: normal` (~1.2), but spans and labels inherit the body line-height (~1.7). With identical padding, a label pill will be taller than a button pill. Pin it explicitly on the shared class.

This is a general rule: whenever mixing element types in a visually unified component, always pin `line-height` explicitly.

## Usage rules

- Sort/filter options: use radio inputs with `:has(input:checked)`
- View mode toggle: use buttons with `.active` class managed by JS
- Always the same scale on one page
- Sits in the toolbar row above the content grid, never in the filter sidebar
- Sidebar is for filtering only. Toolbar is for sorting and view mode.

## Where used

Library page (sort bar + view toggle), homepage stream (view toggle).
