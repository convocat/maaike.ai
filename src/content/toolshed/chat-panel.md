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
- **Form**: textarea + Send button, with a one-line disclaimer ("The Garden can be wrong. Check the page.").

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

Design intent: organic, hand-drawn, slightly playful. Not the standard rounded pill.

- **Shape**: each chip uses a different irregular `border-radius` (e.g. `30% 70% 60% 40% / 50% 40% 60% 50%`) so the three feel like pebbles or leaves, not buttons.
- **Color**: rotates through three earth tones, sand `#E8D9B8`, clay `#D9B89A`, sage `#C5D9C0`. Dark-mode equivalents are deeper warm browns and a forest green.
- **Tilt**: slight per-chip rotation (`-1.5°`, `+1.2°`, `-0.6°`) using `nth-child(3n+1/2/3)`. On hover or focus, the chip straightens (`rotate(0)`) and lifts.
- **Filter**: the global `#sketchy` SVG filter (a low-amplitude `feTurbulence` displacement) is applied to give the edge a hand-drawn wobble. The filter is removed on hover so the chip looks crisp when targeted.

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
