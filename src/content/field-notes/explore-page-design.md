---
title: "Explore page: a visual browsing UI for the garden"
date: 2026-03-15
maturity: developing
tags:
  - about
  - digital-gardens
  - knowledge-graph
hub: true
develops: knowledge-graph-for-the-garden
description: Design document for an /explore page that lets visitors walk through the garden visually, using semantic maps, serendipity, and trails.
ai: co-created
---

## The idea

What if visitors could explore the garden not just through lists and links, but by *walking through it*? A dedicated `/explore` page that makes the garden's structure visible and browsable, using the embeddings and key phrases we've already computed.

Three modes of exploration, all sharing the same spatial map:

### 1. The garden map

A 2D map where every item is positioned by semantic similarity. Items that are about related topics cluster together. Items on unrelated topics sit far apart. You see the shape of the garden at a glance: where the conversation design cluster is, where the AI explorations live, where the book reviews gather.

**Visual language:**
- Items rendered as Rough.js circles (hand-drawn, matching the garden's sketchy icon style and feTurbulence wobble filter)
- Size reflects maturity: seeds are small, solid articles are larger
- Color follows the existing collection palette (WCAG AA compliant: #7A5A48 for articles, #4A7A50 for field notes, #A07030 for seeds, etc.)
- Hover shows title + description in a tooltip
- Click navigates to the item
- Pan and zoom via mouse/touch
- Cluster labels auto-generated from shared key phrases ("conversation design", "digital gardens", "embedding models")

**Data pipeline:** Project the 1024-dim bge-m3 embeddings to 2D using UMAP (via umap-js, client-side). Pre-compute at build time and ship as a static JSON file with x,y coordinates per item.

### 2. Wander

A serendipity mode. Not pure randomness: *constrained* randomness that surfaces undervisited or sparsely connected items.

**How it works:**
- A "Wander" button picks a random item, weighted toward items with fewer inbound links
- The map smoothly pans to that item's location
- A sketchy circle highlights the item and its 3-4 nearest neighbors on the map
- A small card appears: "While you're here..." with the item title, description, and its neighbors as suggestions

**Visual language:**
- The highlighted area could look like a hand-drawn magnifying glass or a garden bed outline
- Neighbors connected by faint sketchy lines (Rough.js paths)

**Design principle:** Serendipity requires both unexpectedness and value ([IJDesign research](https://www.ijdesign.org/index.php/IJDesign/article/view/1059/402)). Weighting toward under-linked items provides unexpectedness. Showing neighbors provides value: you don't just land on a random page, you land in a *neighborhood*.

### 3. Garden paths (trails)

Curated or auto-generated sequences through the garden. A path connects items in an order that tells a story or follows a theme.

**Types of paths:**
- **Auto-generated:** Shortest semantic path between two items. "How do you get from 'Crew Resource Management' to 'Digital Gardens vs Blogs'?" The algorithm finds intermediate items that bridge the semantic gap.
- **Curated:** Hand-picked sequences for specific themes. "The AI conversation design journey" or "How this garden was built."

**Visual language:**
- Paths drawn as Rough.js curved lines across the map, like hand-drawn garden paths
- Active path highlighted in hot pink (#D6006C), other paths in muted earthy tones
- Current position on the path shown as a marker
- Path list in a sidebar or overlay: click a path to activate it

**Inspiration:** Vannevar Bush's Memex trails (1945) proposed paths through linked knowledge that strengthen with use and fade without it. Mozilla's experimental [Trails browser](https://medium.com/free-code-camp/lossless-web-navigation-with-trails-9cd48c0abb56) replaced tabs with horizontal reading paths.

## Visual design principles

The explore page should feel like looking at a hand-drawn map of an actual garden. Not a data visualization. Not a dashboard.

- **[Rough.js](https://roughjs.com/)** for all shapes and lines (organic, imperfect, warm)
- **Earthy tones** from the existing collection palette, not bright data-viz colors
- **No grid, no axes.** This is a landscape, not a chart
- **Labels use Lora** (the garden's heading font) for a handwritten quality
- **Dark mode support** via the existing token palette
- **The [roughViz](https://github.com/jwilber/roughViz) philosophy**: "Use these charts where the goal is to show intent or generality, not absolute precision"

## Technical approach

| Component | Library | Notes |
|---|---|---|
| 2D projection | umap-js (Google PAIR) | Pre-compute at build time, ship as static JSON |
| Rendering | D3.js + Rough.js | 157 items is well within SVG capacity |
| Pan/zoom | d3-zoom | Standard, well-tested |
| Hand-drawn shapes | Rough.js (<9KB) | Matches existing garden aesthetic |
| Trails | D3 path generators + Rough.js | Curved lines between waypoints |
| Hosting | Astro page (`/explore`) | Static, ships with the site |

The page loads a pre-computed JSON with item metadata + 2D coordinates. No runtime ML, no server needed.

## Status

- [x] v0 prototype: interactive layout designed in Vercel v0, then rebuilt as vanilla JS for Astro
- [x] UMAP spatial map: 162 items projected from bge-m3 embeddings via umap-js (`scripts/build-explore-data.cjs`)
- [x] Rough.js rendering: hand-drawn circles, connection lines, cluster labels
- [x] Three interaction modes: Map (pan/zoom), Wander (serendipity), Paths (trails)
- [x] Wander card with "While you are here..." neighborhood suggestions
- [x] Trail sidebar with curated path cards
- [x] Legend (collapsible, collection colors + maturity sizes)
- [x] Tooltip with maturity bar and collection indicator
- [x] WCAG AA color palette: all collection colors ≥3:1 contrast in both light and dark mode
- [x] Design system documentation ([[design-system-and-content-guidelines|design system field note]])
- [x] Added to main navigation
- [x] Auto-generated trails from hub/develops project structure
- [x] Named territories: semantic regions named by dominant tags, rendered as subtle italic labels
- [x] Topographic contour lines: KDE density iso-contours as faint hand-drawn background terrain
- [x] Organic trail paths: smooth Catmull-Rom curves through stops (rough.js curve) instead of straight lines
- [x] Stable map positions: pinned in `map-roots.json`, `--recompute` flag for full reset ([[stable-map-positions|field note]])
- [x] Manual position overrides: move items to a target territory via `map-roots.json`
- [x] Library noise filter: fiction and unconnected books excluded from map
- [x] Enriched embeddings: keyphrases + reason fields for more accurate positioning
- [ ] Wiki-link graph as positioning signal: nudge linked items toward each other
- [ ] Keyboard navigation on the map
- [ ] Mobile layout polish

## Answered questions

- Full-screen layout with header, not embedded in a container
- Overlapping circles handled by hover-to-front + tooltip offset
- Trails stored as static data in explore-data.json (not a content type)
- Explore link lives in the main navigation

## References

- [Nomic Atlas](https://atlas.nomic.ai/): embedding-based 2D maps with auto-labels
- [PixPlot (Yale DHLab)](https://dhlab.yale.edu/projects/pixplot/): UMAP-positioned museum collections
- [Heritage Connector](https://thesciencemuseum.github.io/heritageconnector/post/2021/03/11/imagining-interfaces/): thematic browsing for museum collections
- [Generous Interfaces](https://firstmonday.org/ojs/index.php/fm/article/download/6984/6090): designing for "just looking around"
- Vannevar Bush, "As We May Think" (1945): trails through linked knowledge
- [umap-js](https://github.com/PAIR-code/umap-js): client-side UMAP in JavaScript

