---
title: Chat panel
date: 2026-05-07
maturity: solid
tags: [design, components, ai-tools, chatbot]
description: The Ask drawer for grounded conversation with the garden, plus the serendipitous follow-up chips that suggest the next move.
category: design
section: Components
ai: co-created
---

A floating "Ask" button in the bottom-right opens a slide-in drawer. The drawer talks to a streaming endpoint that has access to the current page and the wider garden as context. Per-page conversation, persisted across navigation.

## Layout

- **Toggle**: pill-shaped button bottom-right, accent-2 colored, casts a soft shadow. Hides itself when the drawer is open.
- **Drawer**: fixed right edge, default 420px, resizable from a draggable left edge (pointer + arrow keys), maximizable via header button.
- **Header**: title, context pill ("Talking about X"), reset / maximize / close icons.
- **History**: scrollable region with assistant + user bubbles, each prefixed by a 32px circular avatar. Assistant avatar is a watercolor leaf; user avatar is a small SVG silhouette.
- **Form**: textarea + Send button, with a one-line disclaimer ("The Garden can be wrong. Check the page.").

## Mobile rules

- ≤800px: drawer goes full-width (`width: 100vw`), the resize handle is hidden.
- Tapping any internal link inside the chat closes the drawer so the destination page is visible. External links (`target="_blank"`) leave the drawer open.
- The input is never auto-focused on mobile. Keyboard only appears when the user explicitly taps the textarea. On desktop, focus behavior is unchanged (focus on open / reset / after streaming finishes).

## Follow-up chips

After every assistant turn, three serendipitous follow-up chips render below the bubble. They invite the user to keep tapping instead of typing.

Design intent: organic, hand-drawn, slightly playful. Not the standard rounded pill.

- **Shape**: each chip uses a different irregular `border-radius` (e.g. `30% 70% 60% 40% / 50% 40% 60% 50%`) so the three feel like pebbles or leaves, not buttons.
- **Color**: rotates through three earth tones, sand `#E8D9B8`, clay `#D9B89A`, sage `#C5D9C0`. Dark-mode equivalents are deeper warm browns and a forest green.
- **Tilt**: slight per-chip rotation (`-1.5°`, `+1.2°`, `-0.6°`) using `nth-child(3n+1/2/3)`. On hover or focus, the chip straightens (`rotate(0)`) and lifts.
- **Filter**: the global `#sketchy` SVG filter (a low-amplitude `feTurbulence` displacement) is applied to give the edge a hand-drawn wobble. The filter is removed on hover so the chip looks crisp when targeted.

The prompt bank lives in `src/scripts/chat-panel.ts` as `SERENDIPITY_PROMPTS`. `pickSerendipityChips(3)` draws three without replacement per turn. Examples: "Find a strange neighbour", "Where does this break?", "Take me somewhere unexpected", "Surprise me", "What is the quiet idea?". Add or edit prompts there.

## Behavior

- Chips render after a successful assistant message and after restoring a conversation from sessionStorage where the last message is from the assistant.
- `clearFollowups()` runs at the start of every send so stale chips never linger past the new question.
- Clicking a chip fills the input with the chip text and submits the form. The submit path is identical to typing the text manually.

## Persistence

Conversation lives in `sessionStorage` under `garden-chat-v1` so it survives Astro ViewTransitions. Pane width and maximize state live in `localStorage` under `garden-chat-pane-v1`.

## Files

- `src/components/ChatPanel.astro`, markup + all CSS (global)
- `src/scripts/chat-panel.ts`, init, rendering, streaming, chip logic
- `src/components/SketchyFilter.astro`, the `#sketchy` SVG filter, included by `PageLayout`
