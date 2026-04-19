# Ingest log

Append-only log. One entry per raw file processed. Format: `[date] [collection/slug] — key concepts identified`.

---

## 2026-04-12 — Bootstrap (Step 1)

Sources: `raw/taxonomy.json`, `raw/triples.json`, `raw/themes.json`

Created 88 wiki pages from structured data:
- 63 concept pages (all in `wiki/concepts/`)
- 18 people pages (all in `wiki/people/`)
- 7 entity pages (all in `wiki/entities/`)

Key predicates used: attributed-to, coined-by, counters, instance-of, breaks-down-for, better-fits, leads-to, lacks, causes, metaphor-for, inaccessible-via, characterised-as, demonstrates, exhibits, violates, presupposes, contrasted-with, reinforces, incompatible-with, structured-as.

---

## 2026-04-12 — Articles (Step 2)

### articles/why-chatgpt-is-bullshit-and-why-we-should-design-for-that
Key concepts: bullshit (Frankfurt), indifference-to-truth, cognitive-laziness, cooperative-principle, grices-maxim-of-quality, designing-for-doubt, anthropomorphism.
Pages updated: bullshit, designing-for-doubt, conversational-grounding, cognitive-laziness, cooperative-principle.

### articles/is-conversation-still-a-useful-metaphor
Key concepts: conversation-metaphor, conversational-grounding, delegation-metaphor, note-taking-metaphor, inner-dialog-metaphor, metacognition, anthropomorphism, situated-action.
Research papers cited: Clark & Brennan (grounding), Grice (cooperative principle), Suchman (situated action), Shaikh/Yang/Jurafsky (grounding gap), Rodemann (emotional labor).
Pages updated: conversation-metaphor, conversational-grounding, delegation-metaphor.

### articles/llm-hallucinations-knowledge-as-missing-fundamental
Key concepts: llm-hallucinations, confabulation, missing-fundamental, ground-truth, probabilistic-word-prediction.
Pages updated: llm-hallucinations, missing-fundamental, confabulation.

### articles/context-engineering-lets-call-it-design
Key concepts: context-design, context-engineering, semantic-information-types, information-architecture, instructional-design, technical-authoring, information-mapping, topic-based-writing.
Karpathy quote on context engineering as the new prompt engineering.
Pages updated: context-design, context-engineering, semantic-information-types.

### articles/conversational-interfaces-are-not-easy
Key concepts: accordion-editing, apple-picking, articulation-barrier (Nielsen/g), direct-manipulation, cognitive-load, voice-design.
Case study: Jasper.ai experience.
Pages updated: articulation-barrier, accordion-editing, apple-picking, conversational-interface.

### articles/garden-as-metaphor
Key concepts: digital-garden, stream-metaphor, maturity-system, thinking-in-public, genai, creative-longevity.
Four environments: Typora, website, mycelium, repo.
Pages updated: digital-garden, stream-metaphor, maturity-system.

### articles/bye-bye-alpaca-knowledge-as-the-missing-fundamental
Key concepts: missing-fundamental, llm-hallucinations, ground-truth.
Context: Stanford Alpaca shutdown.
Pages updated: missing-fundamental.

### articles/putting-the-design-in-prompt-design
Key concepts: context-design, semantic-information-types, building-as-specification, direct-manipulation.
DITA (Darwin Information Typing Architecture) referenced.
Pages updated: context-design, semantic-information-types.

### articles/a-digital-garden-as-central-space
Key concepts: digital-garden, thinking-in-public, claude-code, maggie-appleton.
Origin story: Geocities nostalgia, Maggie Appleton discovery.
Pages updated: digital-garden.

### articles/what-happens-when-ai-has-read-everything
Key concepts: llms, genai, anthropomorphism.
Nick Cave critique referenced. Data shortage discussion.
Pages updated: llms.

### articles/stay-calm-and-keep-thinking-for-yourself
Key concepts: bullshit, designing-for-doubt, epistemic-bias, conviction.
Frankfurt's "On Bullshit" and "On Truth" cited together.
Pages updated: designing-for-doubt.

### articles/an-evening-with-chatgpt
Key concepts: chatgpt, llm-hallucinations, conversation-metaphor.
Direct interaction log. First encounter with ChatGPT.
Pages updated: chatgpt.

### articles/an-evening-with-chatgpt-2
Key concepts: chatgpt, confabulation, articulation-barrier.
Second interaction log.
Pages updated: chatgpt.

### articles/an-evening-with-chatgpt-3
Key concepts: chatgpt, conversational-grounding.
Third interaction log.
Pages updated: chatgpt.

### articles/an-evening-with-chatgpt-september-2023
Key concepts: chatgpt, conversation-metaphor.
Fourth interaction log; revisiting earlier analysis.
Pages updated: chatgpt.

### articles/chatgpt-presentation-prep
Key concepts: chatgpt, voice-design, metacognition.
Voice mode for non-linear thinking in presentation prep.
Pages updated: chatgpt, voice-design.

### articles/saturday-design-thoughts
Key concepts: negative-space, designing-for-doubt.
Negative space as design concept. Silence as design element.
NEW pages created: negative-space.
Pages updated: designing-for-doubt.

### articles/air-canadas-bot-mishap-pre-dates-chatgpt
Key concepts: single-sourcing, chatbots, content lifecycle management.
Air Canada bot giving outdated policy; framed as content strategy failure.
NEW pages created: single-sourcing.

### articles/de-biassing-dall-e
Key concepts: ai-bias, genai, anthropomorphism.
DALL-E prompt rewrites adding Dutch stereotypes. De-biasing as bias-introducing.
NEW pages created: ai-bias.

### articles/microsoft-youre-using-bing-wrong
Key concepts: chatgpt, anthropomorphism, conversation-metaphor, conversational-grounding.
Sydney/Venom persona collapse. N.J. Enfield's "How We Talk" cited.
Pages updated: anthropomorphism, conversation-metaphor.

### articles/blender-turned-rogue
Key concepts: bot-persona, anthropomorphism, conversation-metaphor.
Blender chatbot case. Persona as ethical constraint.
NEW pages created: bot-persona.
Pages updated: anthropomorphism.

### articles/thematic-analysis-approach-a-fresh (field note used as article)
Key concepts: thematic-analysis, digital-garden, knowledge-graph.
Seven themes identified: quest for truth, voice of the maker, community as infrastructure, garden as epistemology, design is not engineering, bilingual practitioner, knowledge graph as research program.
NEW pages created: thematic-analysis.

### articles/7-new-skills-for-conversation-designers-2022
Key concepts: skill-based-work, role-based-collaboration, conversation-design.
Pages updated: skill-based-work, conversation-design.

### articles/2-years-and-700-members-insights-from-convoclub
Key concepts: conversation-design, community.
Pages noted: conversation-design.

### articles/hoe-word-ik-conversation-designer / how-do-i-become-a-conversation-designer
Key concepts: conversation-design, skill-based-work.
Dutch and English language versions.

### articles/convo-question-should-i-learn-programming
Key concepts: skill-based-work, building-as-specification.

### articles/hey-chatgpt-whos-the-boss
Key concepts: chatgpt, agentic-ai.
Pages noted: agentic-ai.

### articles/an-evening-with-youchat-and-chatsonic
Key concepts: llms, llm-hallucinations.

### articles/european-chatbot-conference-10-talks
Key concepts: chatbots, conversation-design.

### articles/corona-is-spreading-and-so-are-the-bots
Key concepts: chatbots, conversation-design.

### articles/fingers-crossed-is-a-figure-of-speech-dall-e
Key concepts: ai-bias, genai.
DALL-E literal interpretation of idiom.

### articles/online-prompt-workshop-de-biasing-dall-e
Key concepts: ai-bias, genai.

### articles/visual-notes-brian-roemmele
Key concepts: voice-design.

### articles/onthaast-je-voice-action-met-ssml
Key concepts: voice-design, conversational-interface.

### articles/understanding-speech-part-1 / understanding-speech-part-2
Key concepts: voice-design, conversational-interface.

### articles/prompt-thought-summaries
Key concepts: context-design, llms.

### articles/scrum-for-conversational-teams
Key concepts: skill-based-work, role-based-collaboration.

### articles/the-lone-convo-designer
Key concepts: conversation-design, skill-based-work.

### articles/the-long-and-winding-road
Key concepts: creative-longevity, digital-garden.

### articles/how-to-create-your-own-content-quality-audit
Key concepts: single-sourcing, semantic-information-types.

### articles/off-to-a-good-start
Key concepts: digital-garden, thinking-in-public.

### articles/online-uitgeput-pak-een-kruk
Key concepts: cognitive-load.

### articles/nieuwe-editie-voicelunch / convoclub-clubhouse
Key concepts: conversation-design, community.

### articles/hildegard-von-bingen
Key concepts: creative-longevity.

### articles/youre-not-married-to-your-texts
Key concepts: ai-writing-partner, creative-longevity.

---

## 2026-04-12 — Field Notes (Step 3a)

### field-notes/building-this-garden
Key concepts: digital-garden, claude-code, maturity-system.
Pages updated: digital-garden, maturity-system.

### field-notes/digital-gardens-vs-blogs
Key concepts: digital-garden, stream-metaphor, thinking-in-public.
Pages updated: digital-garden, stream-metaphor.

### field-notes/thinking-in-public
Key concepts: thinking-in-public, digital-garden.
Pages updated: thinking-in-public.

### field-notes/knowledge-graph-for-the-garden
Key concepts: knowledge-graph, digital-garden, serendipity, typed-relations.
NEW pages created: knowledge-graph.
Pages updated: digital-garden.

### field-notes/thematic-tao-three-pass-method
Key concepts: thematic-analysis, metacognition.
Three-pass method documented.
Pages updated: thematic-analysis.

### field-notes/typed-relations-as-garden-infrastructure
Key concepts: typed-relations, knowledge-graph.
NEW pages created: typed-relations.

### field-notes/thematic-analysis-approach-a-fresh
Key concepts: thematic-analysis, knowledge-graph, digital-garden.
Seven themes enumerated.
Pages updated: thematic-analysis.

### field-notes/thematic-analysis-approach-b-graph-augmented
Key concepts: thematic-analysis, knowledge-graph.
Graph-augmented variant.

### field-notes/experiment-2-thematic-analysis-with-1m-context
Key concepts: thematic-analysis, llms, context-window.

### field-notes/experiment-1-scheduled-garden-health-check
Key concepts: digital-garden, agentic-ai.

### field-notes/garden-lifecycle-greenhouse-compost
Key concepts: digital-garden, maturity-system, stream-metaphor.

### field-notes/book-recommender
Key concepts: digital-garden, knowledge-graph.

### field-notes/claude-md-project-memory
Key concepts: context-design, system-prompt, claude-code.

### field-notes/content-chunk-size-and-embeddings
Key concepts: knowledge-graph, semantic-information-types.

### field-notes/explore-page-design
Key concepts: digital-garden, information-architecture.

### field-notes/garden-user-manual
Key concepts: digital-garden, context-design.

### field-notes/external-content-discovery
Key concepts: digital-garden, knowledge-graph.

### field-notes/stable-map-positions
Key concepts: knowledge-graph, information-architecture.

### field-notes/key-phrase-extraction-for-the-garden
Key concepts: knowledge-graph, semantic-information-types.

### field-notes/reading-notes-saga-knowledge-graph
Key concepts: knowledge-graph.

### field-notes/testing-strategy
Key concepts: digital-garden, building-as-specification.

### field-notes/full-scale-key-phrase-extraction
Key concepts: knowledge-graph, semantic-information-types.

### field-notes/embedding-models-for-the-garden
Key concepts: knowledge-graph, serendipity.

### field-notes/tuning-the-similarity-threshold
Key concepts: knowledge-graph, serendipity.

### field-notes/claude-code-whats-new-for-the-garden
Key concepts: claude-code, agentic-ai, context-design.

---

## 2026-04-12 — Seeds (Step 3b)

### seeds/principles-behind-this-garden
Key concepts: digital-garden, thinking-in-public, maturity-system.
Pages updated: thinking-in-public, maturity-system.

### seeds/ai-as-writing-partner
Key concepts: ai-writing-partner, thinking-in-public, creative-longevity.
NEW pages created: ai-writing-partner.

### seeds/the-disappearance-of-authentic-voice-online
Key concepts: ai-writing-partner, creative-longevity, thinking-in-public.

### seeds/ai-transparency-in-content
Key concepts: ai-bias, designing-for-doubt, anthropomorphism.

### seeds/dutch-aware-quantization
Key concepts: llms, ai-bias.

### seeds/style-guide-for-ai
Key concepts: context-design, semantic-information-types, bot-persona.

### seeds/writing-as-a-conversation-with-yourself
Key concepts: inner-dialog-metaphor, thinking-in-public, ai-writing-partner.
Pages updated: inner-dialog-metaphor.

### seeds/chatbots-without-ai
Key concepts: chatbots, conversation-design, articulation-barrier.
Pages updated: chatbots.

### seeds/crew-resource-management
Content: empty. No concepts extracted.

### seeds/the-return-of-the-button
Key concepts: direct-manipulation, conversational-interface, negative-space.

### seeds/thematic-analysis-as-interaction-model-and-research-method
Key concepts: thematic-analysis, conversation-metaphor, metacognition.
Thematic analysis proposed as interaction model alternative to conversation.
Pages updated: thematic-analysis.

### seeds/knowledge-gardens-and-serendipity
Key concepts: serendipity, digital-garden, information-architecture.
NEW pages created: serendipity.
Pages updated: digital-garden.

### seeds/embeddings-for-knowledge-gardens-research-gap
Key concepts: knowledge-graph, serendipity.
Research gap: no academic papers on embeddings for personal knowledge management.
Pages updated: knowledge-graph, serendipity.

### seeds/garden-to-do-list
Key concepts: digital-garden, serendipity.

### seeds/how-to-build-a-digital-garden
Key concepts: digital-garden.

### seeds/my-changing-role-in-an-ultrasmall-development-team
Key concepts: skill-based-work, role-based-collaboration, claude-code, building-as-specification.
Real-life example: UX review via Claude Code, joint team decision on editorial clearance.
Pages updated: skill-based-work.

### seeds/a-reading-log-for-bacteria-to-ai
Content: stub. No concepts extracted.

### seeds/reading-notes-bacteria-to-ai
Key concepts: nonconscious-cognition, cognitive-assemblage.
Pages updated: nonconscious-cognition.

---

## Step 4: Index and log creation — 2026-04-12

- Created `wiki/index.md` — full catalog with 99 entries organized by type and theme cluster
- Created `wiki/_log.md` — this file

### New pages created during ingest (not in bootstrap):
- `wiki/concepts/negative-space.md`
- `wiki/concepts/single-sourcing.md`
- `wiki/concepts/thematic-analysis.md`
- `wiki/concepts/serendipity.md`
- `wiki/concepts/ai-bias.md`
- `wiki/concepts/knowledge-graph.md`
- `wiki/concepts/typed-relations.md`
- `wiki/concepts/bot-persona.md`
- `wiki/concepts/voice-design.md`
- `wiki/concepts/ai-writing-partner.md`
- `wiki/entities/chatbots.md`

### Final count:
- Concepts: 73
- People: 18
- Entities: 8
- Total: 99 pages
