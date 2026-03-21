# Garden health report
Date: 2026-03-21

---

## 1. Broken wiki links

**1 real broken link:**

| Link | File | Notes |
|---|---|---|
| `[[ai-feedback-loops]]` | `articles/chatgpt-presentation-prep.md:37` | Used in article body, no matching content file |

**5 in documentation/code context (not real broken links):**

| Link | File | Context |
|---|---|---|
| `[[Page Title]]` | `field-notes/design-system-and-content-guidelines.md:26` | Syntax example in table |
| `[[linked-experiment]]` | `field-notes/design-system-and-content-guidelines.md:95` | Checklist example/template |
| `[[double bracket]]` | `field-notes/building-this-garden.md:33` | Feature description |
| `[[slug]]` | `field-notes/building-this-garden.md:73` | Documentation prose |
| `[[target]]` | `experiments/key-phrase-extraction-prototype.md:87` | In code comment |

---

## 2. Empty or stub content

No real stubs found. 23 files under `src/content/tags/` have body-only frontmatter — this is expected for the tags collection (title-only entries by design).

---

## 3. Tag issues

### Single-use tags (not library genres)
These are used only once in non-library content and may be worth consolidating:

- `embeddings` (1x) — possibly merge with `knowledge-graph` or `natural-language-processing`
- `generative-ai-design` (1x) — overlap with `design` + `ai`
- `human-machine-interface` (1x) — near-duplicate with `human-machine-interface-design` (1x)
- `non-linear-thinking` (1x) — single use, broad concept
- `personal-web` (1x) — single use
- `role-of-ai` (1x) — overlap with `ai` (48x)
- `testing` (1x) — very generic
- `user-interfaces` (1x) — overlap with `voice-user-interfaces` (3x)

### Notable near-duplicates

| Tag A | Count | Tag B | Count | Issue |
|---|---|---|---|---|
| `human-machine-interface` | 1 | `human-machine-interface-design` | 1 | Same concept |
| `voice-ux` | 1 | `voice-design` | 5 | Fragmented voice tags |
| `voice-user-interface-design` | 1 | `voice-user-interfaces` | 3 | Fragmented voice tags |
| `voice` | 5 | `voice-design` | 5 | Fragmented voice tags |
| `llm` | 1 | `ai` | 48 | Redundant |
| `human-behavior` | 1 | `psychology` | 5 | Overlap |
| `chatbots` | 1 | `conversational-ai` | 13 | Overlap |

Many other single-use tags are library genre tags (e.g., `romance`, `fantasy`, `thriller`, `kinderboek`) — these are expected and appropriate for the library collection.

---

## 4. Missing frontmatter

### `description` field missing from all library entries

97 files in `src/content/library/` are missing the `description` field. All other required fields (`title`, `date`, `maturity`, `tags`) are present. This appears to be a systematic gap — library entries typically have no descriptive body text either. Worth addressing if descriptions are displayed in the UI.

All other collections have complete frontmatter for non-draft files.

---

## 5. Git status

Active uncommitted changes — work in progress:

**Modified (7 files):**
- `src/content/articles/context-engineering-lets-call-it-design.md`
- `src/content/articles/how-to-make-chatgpt-more-conversational.md`
- `src/content/articles/prompt-thought-summaries.md`
- `src/content/articles/putting-the-design-in-prompt-design.md`
- `src/content/field-notes/design-system-and-content-guidelines.md`
- `src/content/videos/episode-1-types-of-prompting.md`

**Deleted (staged for removal):**
- `src/content/field-notes/prompt-scaffolding.md`

**Untracked (new files, not yet committed):**
- `.claude/settings.local.json`
- `src/content/field-notes/claude-code-whats-new-for-the-garden.md`
- `src/content/seeds/thematic-analysis-as-interaction-model-and-research-method.md`

---

Garden health: **10 issues found across 242 files checked.**

*(1 broken wiki link, 7 notable tag near-duplicates/fragmentation issues, 97 library files missing description, 1 deleted + 2 new untracked content files uncommitted)*
