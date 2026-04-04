---
title: Mobile filter bar
date: 2026-04-04
maturity: solid
tags: [design, mobile, filters, responsive]
description: When a page has a desktop filter sidebar, mobile gets a compact toggle button and collapsible panel instead.
category: design
section: Interactive controls
ai: co-created
---

On desktop, filter controls live in a sidebar. On mobile (800px and below), the sidebar disappears and a "Filters" toggle button takes over. One scroll context throughout.

## The layout rule

```
Desktop (>800px): sidebar visible, mobile bar hidden
Mobile (≤800px):  sidebar hidden, mobile bar shown
```

Never add `overflow`, `max-height`, or `position: sticky` to either column. One page, one scrollbar.

## How the sync works

The mobile panel uses separate inputs from the sidebar. They stay in sync via data attributes:

- Sidebar inputs get `data-filter-group="status"` (or whichever group)
- Mobile inputs get `data-mobile-group="status"`

When a mobile checkbox changes, find the matching sidebar input and set `.checked`, then call `render()`. Since `render()` always reads from the sidebar inputs, the filter logic needs no changes.

```js
mobileInputs.forEach(mInput => {
  mInput.addEventListener('change', () => {
    const group = mInput.dataset.mobileGroup ?? '';
    const match = sidebarInputs.find(
      i => i.dataset.filterGroup === group && i.value === mInput.value
    );
    if (match) match.checked = mInput.checked;
    updateCount();
    currentPage = 1;
    render();
  });
});
```

## Count badge

The toggle button shows a badge with the number of active filters. Hidden at zero.

```js
function updateCount() {
  const n = mobileInputs.filter(i => i.checked).length;
  countEl.textContent = String(n);
  countEl.hidden = n === 0;
}
```

## Panel background color

Use the page's own filter color, not a generic one:
- Stream: `#EEF3EB` (green-tinted)
- Library: `#F0EAE4` (sand)

Match the sidebar's folder-tab color so the panel feels like it belongs.

## Where used

Homepage stream (groups: Collection, Maturity, Written by) and library page (groups: Status, Format, Topic, Book type).
