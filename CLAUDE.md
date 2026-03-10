# Maai & AI - Digital Garden

Personal digital garden for Maaike, deployed at **maaike.ai**. Built with Astro 5, static output, GitHub Pages.

## Quick start

```
npm install
npm run dev        # → localhost:4321
npm run build      # → dist/
```

Dev server config lives in `.claude/launch.json` (name: "digital-garden", port 4321).

## Architecture

Astro static site with 7 content collections, wiki-style cross-linking, and dual light/dark theme.

### Content collections (src/content/)

| Collection | Slug | Extra fields |
|---|---|---|
| Articles | `articles` | `pruning` (optional) |
| Field Notes | `field-notes` | - |
| Sparks | `sparks` | - |
| Weblinks | `weblinks` | `url` (required) |
| Videos | `videos` | `url` (required) |
| Library | `library` | `author`, `cover`, `status` (reading/read/to-read) |
| Principles | `principles` | - |

All collections share: `title`, `date`, `updated`, `maturity` (draft/developing/solid/complete), `tags[]`, `description`, `draft`.

Content files are Markdown with YAML frontmatter. Draft items (`draft: true`) are filtered out at build time.

### Maturity system

4 stages visualized with plant emojis: 🌱 draft → 🌿 developing → 🪴 solid → 🌳 complete. Shown as an interactive track in PostLayout.

### Wiki links

`[[Page Title]]` syntax links across all collections. Configured in `astro.config.mjs` with remark-wiki-link. Hover previews show title + description (WikiLinkPreview component). Backlinks are computed and shown in post footers.

### Layouts

- **BaseLayout** → global CSS, ViewTransitions, dark mode persistence (`data-theme` on `<html>`)
- **PageLayout** → BaseLayout + Header + SketchyFilter + Footer + container
- **PostLayout** → PageLayout + post header (tags, collection label, title, maturity track) + prose content + backlinks

### Key directories

```
src/components/    Astro components
src/content/       Markdown content per collection
src/data/          settings.json (site titles, descriptions)
src/layouts/       BaseLayout, PageLayout, PostLayout
src/pages/         Route files ([...slug].astro per collection)
src/styles/        tokens.css (design tokens), global.css, fonts.css, utilities.css
src/utils/         collections.ts, backlinks.ts
```

## Design system

### Colors (src/styles/tokens.css)

- **Primary accent: `#D6006C` (hot pink)**. This is Maaike's company color. Do not change it.
- Secondary accent: `#0D7C66` (teal), dark mode: `#2DD4A8`
- Dark mode accent: `#FF4DA6` (bright pink variant of company color)
- Background: white (`#FFFFFF`) / dark (`#111111`)

### Typography

- Headings: Lora (serif), self-hosted variable font
- Body: Roboto (sans-serif), self-hosted variable font
- Code: JetBrains Mono

### Collection icons

Hand-drawn SVG icons per collection with earthy pastel stroke colors and a feTurbulence wobble filter (`SketchyFilter.astro`). Managed in `CollectionIcon.astro`. Each icon has light and dark mode stroke variants. Icons appear in:
- Homepage section headings
- Collection index page headings
- Post detail headers (as collection label)

Icon stroke palette (light): articles=#9e7c6b, field-notes=#7a9a7e, sparks=#c4956a, weblinks=#a08872, videos=#8e7a8a, library=#7d7068, principles=#7a8a6e.

### Spacing tokens

`--space-xs` (0.25rem) through `--space-3xl` (4rem). Max width: 65rem, content width: 42rem.

## Deployment

- Push to `main` triggers GitHub Actions → builds → deploys to GitHub Pages
- `publish.bat` is a convenience script for local git-add-commit-push
- GitHub workflow `share-link.yml` allows quick weblink creation via manual dispatch

## Adding content

```
npm run new    # interactive content creation script
```

Or create a `.md` file directly in the appropriate `src/content/<collection>/` folder with the required frontmatter.

## Preferences

- Keep the hot pink (`#D6006C`). It's the company brand color
- Icons should feel hand-drawn and organic, not polished or geometric
- The site aesthetic is warm and personal, not corporate
- Maaike works in Dutch and English; site content is English
- **Never use em-dashes** (—) in content. Use colons, commas, or periods instead
