---
title: Chat panel
date: 2026-05-07
maturity: solid
tags: [design, components, ai-tools, chatbot]
description: The Ask drawer for grounded conversation with the garden, plus the contextual follow-up chips and system-prompt picker.
category: design
section: Components
ai: co-created
---

A floating "Ask" button in the bottom-right opens a slide-in drawer. The drawer talks to a streaming endpoint that has access to the current page and the wider garden as context. Per-page conversation, persisted across navigation.

## Layout

- **Toggle**: pill-shaped button bottom-right, accent-2 colored, casts a soft shadow. Hides itself when the drawer is open.
- **Drawer**: fixed right edge, default 420px, resizable from a draggable left edge (pointer + arrow keys), maximizable via header button.
- **Header**: title, context pill ("Talking about X"), settings cogwheel + reset / maximize / close icons.
- **History**: scrollable region with assistant + user bubbles, each prefixed by an avatar. Assistant avatar is the watercolor leaf at 32px (circular crop); user avatar is the watercolor acorn at 34px (no crop, full painted shape, transparent background).
- **User bubble**: sand-colored background (`--chat-tag-bg: #ECE2CE` light, `#352E25` dark), scoped to the drawer so the wider site's tag-bg can stay distinct.
- **Input**: there is no separate textarea. The fourth pebble in the chips area IS the input. Type into it, press Enter to send. The original `<textarea>` and Send button still exist in the DOM for accessibility / programmatic submit, but are hidden via `display: none` (the chip click and input-pebble Enter both fill the hidden textarea and call `form.requestSubmit()` so streaming logic stays untouched).
- A small disclaimer line below the chips: "The Garden can be wrong. Check the page."

## Wide-view mycelium (prototype)

When the drawer is at least 700px wide (typically: maximised, or a manually-widened drawer on a roomy desktop), the right half of the drawer is a `chat-mycelium` pane. It is hidden in narrow / mobile layouts.

The pane is an SVG canvas that re-renders on every conversation change. Each turn becomes a node:
- User question → small watercolor acorn at a calculated point on a meandering path
- Bot reply → small watercolor leaf at the next point
- Cursive (Cedarville) caption to the side of each node, flipped to the other side past the canvas midline so labels don't run off

Faint dashed sage threads connect each node to the previous one in conversation order, drawn as quadratic Bezier curves with alternating control-point bias so the threads gently meander.

Cited posts are detected by parsing markdown links of the form `[Title](/collection/slug/)` from assistant messages. Each becomes a small painted card (collection-coloured strip + Lora title) anchored near the bot turn that mentioned it, with its own thread back to the node.

Status: prototype. The visualisation is read-only for now. Ideas worth trying next: hover a node to highlight its threads, click a citation card to scroll the underlying page, recurring concept detection so the second mention of "stream" links back to the first.

Toggling: `is-wide` class added to `.chat-drawer` when its `getBoundingClientRect().width >= 700`. A `ResizeObserver` watches the drawer; the class flips automatically on resize, maximise, or window changes.

Files: `src/components/ChatPanel.astro` (markup + CSS), `src/scripts/chat-panel.ts` (`renderMycelium` function + ResizeObserver wiring).

## Cedarville Cursive (chat-only spidery accent)

Several short, secondary, decorative texts in the chat use **Cedarville Cursive** (self-hosted at `public/fonts/cedarville-400-latin.woff2`) for a handwritten "margin note" feel. Specifically:

- The follow-up chip text
- The header context pill ("Talking about *Page Title*")
- The role labels above each bubble ("You" / "The Garden")
- The settings popover header ("System prompt")
- The input field's placeholder ("Ask about this page, or anything in the garden…")

What stays in the body font (Nunito / current picker choice): bubble text, send button, settings dropdown options, the small disclaimer line, the drawer title.

Rule of thumb: Cedarville for short, annotational, decorative text. Body sans for anything the user reads as content or interacts with directly.

## Mobile rules

- ≤800px: drawer goes full-width (`width: 100vw`), the resize handle is hidden.
- Tapping any internal link inside the chat closes the drawer so the destination page is visible. External links (`target="_blank"`) leave the drawer open.
- The input is never auto-focused on mobile. Keyboard only appears when the user explicitly taps the textarea. On desktop, focus behavior is unchanged (focus on open / reset / after streaming finishes).

## Follow-up chips

After every assistant turn, three follow-up chips render below the bubble. They invite the user to keep tapping instead of typing. The empty state (chat just opened, no messages yet) uses the same chip layout for its starter suggestions.

Design intent: scattered watercolor stones, like pebbles tossed on a beach. Each chip is a small painted pebble (~100×36) with a soft drop-shadow and its caption written below in Cedarville. The chip set always renders four pebbles: three follow-up suggestions plus a fourth "input pebble" the visitor can type into directly.

- **Pebble PNGs**: `/images/watercolor-pebble-1/2/3.png`, used as background-image on a small `.chip-pebble` element above the caption (variant F: pebble as a layer, not a stretched fill).
- **Caption font**: Cedarville Cursive, the chat-only spidery accent.
- **Input pebble (4th chip)**: same pebble shape, contains an `<input>` instead of a static caption. Pressing Enter submits the typed text exactly as if a chip had been clicked.

### Desktop: heap layout

On viewports wider than 800px the chips area is a 150px-tall `position: relative` box, and each chip is `position: absolute` at its own `left` / `top` plus a tilt. The four pebbles overlap into a small pile. Captions are hidden until interaction. Hovering, focusing, or focus-within on a chip lifts it (`translateY(-8px) rotate(0deg) scale(1.04)`), bumps z-index, and fades the caption in. The input pebble's `<input>` field becomes interactive on hover/focus (`opacity: 0` → `1`, `pointer-events: none` → `auto`).

### Mobile: flat row

At ≤800px the heap CSS is overridden: chips return to `position: relative`, the followups container becomes `display: flex; flex-wrap: wrap`, and captions stay always visible (no hover on touch). Per-chip translate offsets give a casually-scattered look without the overlap.

### No SVG filter

Earlier versions used the global `#sketchy` `feTurbulence` displacement filter on chip borders. The watercolor pebble PNGs already carry the hand-painted wobble, so the filter is no longer applied.

### Source: contextual, model-generated (v0.2 prompt)

The chip-driven flow is scoped to the v0.2 garden system prompt. v0.1 still has the original in-prose handoff design. The settings cogwheel lets visitors flip between them. When v0.2 is active, the model is instructed to append a single line at the very end of every reply:

```
<<CHIPS:["question one","question two","wander question"]>>
```

The backend stream parser watches for this marker, suppresses everything from `<<CHIPS:` onward in the visible token stream, and once the closing `>>` arrives, parses the JSON and emits a separate `{type:"chips",items:[...]}` event. The marker text never reaches the user's screen.

The model is told to make item 1 and item 2 close-context (rooted in the just-given answer + page) and item 3 a "wander" chip — an unexpected connection elsewhere in the garden. Chips replace on every turn.

If the marker is missing or malformed, the frontend falls back to `pickSerendipityChips(3)`, which draws from the static `SERENDIPITY_PROMPTS` pool in `src/scripts/chat-panel.ts` (examples: "Find a strange neighbour", "Surprise me", "Where does this break?"). The static pool is the safety net, not the primary path.

## System-prompt picker (settings cogwheel)

The header has a small cogwheel icon. Clicking it opens a popover anchored to the gear with a `<select>` listing the active and draft prompts wired to `bot_id: garden` (read from `src/content/prompts/`). Switching prompt mid-conversation prompts a confirm dialog and clears the conversation on accept.

The popover is hidden by default and reveals only on click. The gear itself stays hidden until `/api/prompts` returns more than one option, so single-prompt deployments don't show the affordance at all.

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
