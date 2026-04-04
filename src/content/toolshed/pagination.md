---
title: Pagination for long lists
date: 2026-04-04
maturity: solid
tags: [design, pagination, interaction, lists]
description: Long lists use pagination, not infinite scroll. Same mechanism as the homepage stream.
category: design
section: Interactive controls
ai: co-created
---

Any page with a long list uses pagination. Not infinite scroll, not "load more." Previous/next buttons, a page indicator, scroll to top on navigate.

## The structure

```html
<nav class="pagination" id="pagination" aria-label="Pages" hidden>
  <button class="page-btn" id="page-prev" aria-label="Previous page">Previous</button>
  <span class="page-indicator" id="page-indicator"></span>
  <button class="page-btn" id="page-next" aria-label="Next page">Next</button>
</nav>
```

## The JS pattern

```js
const PAGE_SIZE = window.innerWidth <= 800 ? 6 : 12;
let currentPage = 1;

function render() {
  const matching = allItems.filter(matchesFilters);
  const totalPages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * PAGE_SIZE;
  allItems.forEach(el => { el.style.display = 'none'; });
  matching.slice(start, start + PAGE_SIZE).forEach(el => { el.style.display = ''; });

  pagination.hidden = totalPages <= 1;
  indicator.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) { currentPage--; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
});
nextBtn.addEventListener('click', () => {
  currentPage++; render(); window.scrollTo({ top: 0, behavior: 'smooth' });
});
```

## Rules

- Filters always reset `currentPage = 1`
- Prev/next always scroll to the top of the page
- Hide the nav entirely when everything fits on one page
- PAGE_SIZE: 6 mobile / 12 desktop for dense grids; 6 mobile / 10 desktop for stream cards
- Wrap everything in an `init()` function; call it on load and on `astro:after-swap`

## Where used

Homepage stream, library page.
