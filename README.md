# Maai & AI: a digital garden

> **[maaike.ai](https://maaike.ai)**

## Why this exists

> *100% Maai: fully written by Maaike, no AI*

One thing that I really miss doing lately, is writing longer pieces that require a bit of thinking, mulling and reordering. I typically resort to videos nowadays, and Claude is a pretty mean writing assistant for factual, functional texts. But I really miss sitting in front of a screen that doesn't talk back, doesn't distract and just offers me space for my own head.

My content lives in so many places now: a Youtube channel, a Substack, a Medium, a Notion library, and various link collections. I wanted one place that works the way my head works: non-linear, associative, with room for ideas that aren't fully formed yet.

I've always longed for a way to express that in writing:

- Non-linear, associative
- Not every idea is fully formed yet. Some are fleeting thoughts, others keep surfacing for longer periods of time.
- All my stuff in one place
- Serendipity as an organising principle
- *Ambachtelijk* is the Dutch word for "artisanal". It's what I always enjoyed in writing and blogging pre-algorithm: the sense that you're crafting something.

## What's in the garden

> *Co-created: written by AI based on Maaike's ideas and direction*

The garden organises content into seven collections:

| Collection | What's in it |
|---|---|
| **Articles** | Longer thinking pieces, often migrated from Substack |
| **Field notes** | Shorter observations and notes from the field |
| **Sparks** | Quick ideas, fragments, things that caught my attention |
| **Weblinks** | Links worth saving, with my notes on why |
| **Videos** | Video content, mostly from my YouTube channel |
| **Library** | Books I'm reading, have read, or want to read |
| **Principles** | Things I believe in and try to work by |

Every post has a **maturity level**, because not everything needs to be finished to be worth sharing:

🌱 draft · 🌿 developing · 🪴 solid · 🌳 complete

Posts link to each other using `[[wiki links]]`, with backlinks computed automatically. The idea is that connections emerge organically over time, not through rigid categories.

## How it's built

> *Co-created: written by AI based on Maaike's ideas and direction*

Static site built with [Astro](https://astro.build/), deployed on GitHub Pages. Content is Markdown with YAML frontmatter, so it's easy to write in any editor. No CMS required, though [Sveltia CMS](https://github.com/sveltia/sveltia-cms) is available for a visual editing experience.

Design choices: warm serif headings (Lora), clean sans-serif body text (Roboto), hand-drawn SVG collection icons with a sketchy wobble filter, and a light/dark theme. The primary accent color is `#D6006C`, because hot pink is non-negotiable.

Every post can carry an **AI transparency indicator** showing how much AI was involved in writing it: from "100% Maai" (no AI at all) to "generated" (fully AI-generated, reviewed by Maaike). Because transparency about this matters.

## Running locally

```
npm install
npm run dev        # localhost:4321
npm run build      # static output in dist/
```

## License

Content is copyright Maaike Groenewege. The code is available for reference and inspiration.
