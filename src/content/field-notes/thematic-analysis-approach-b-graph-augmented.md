---
title: "Thematic analysis of the garden: graph-augmented"
date: 2026-03-21
maturity: developing
tags:
  - thematic-analysis
  - digital-gardens
  - 1m-context
  - knowledge-graph
description: "What happens when you start from embeddings instead of reading? Comparing cluster-based discovery against the fresh thematic analysis."
ai: co-created
develops: experiment-2-thematic-analysis-with-1m-context
---

Part of [[experiment-2-thematic-analysis-with-1m-context]].

**Method:** Loaded all 213 non-draft items' bge-m3 embeddings (1024 dimensions), ran k-means clustering (k=10), then named clusters by examining their members. No raw text reading; structure comes entirely from the embedding space.

## The 10 clusters

| Cluster | Size | Label | Character |
|---|---|---|---|
| 1 | 28 | AI and philosophy (library) | Format-driven: 22 of 28 are library entries |
| 2 | 10 | Writing, language, content strategy | Eclectic, weakly cohesive |
| 3 | 12 | The ChatGPT exploration series | Topic-focused: all articles about ChatGPT encounters |
| 4 | 37 | Fiction, personal reading, miscellaneous | Junk drawer: items that don't fit elsewhere |
| 5 | 15 | Building the garden (meta) | Clear: garden infrastructure, design system, meta-content |
| 6 | 14 | Knowledge graph research | Tight: embeddings, Saga papers, key phrases, thresholds |
| 7 | 22 | Videos and tutorials | Format-driven: 15 of 22 are videos regardless of topic |
| 8 | 37 | Design, learning, prompting | Broad: design thinking, prompt design, instructional design |
| 9 | 3 | Outliers | Noise: three items with no clear shared theme |
| 10 | 35 | Conversation design profession | Very clear: career, community, tools, CxD practice |

## What the embeddings confirm

Three of the [[thematic-analysis-approach-a-fresh|fresh reading themes]] map almost directly to embedding clusters:

- **Theme 7** (knowledge graph as personal research program) = Cluster 6. The tightest match: the same 14 items form a cohesive group in both analyses.
- **Theme 3** (community as infrastructure) lives inside Cluster 10, which captures the broader conversation design profession. The community articles are there, but embedded within a larger professional context.
- **Theme 5** (design is not engineering) maps to Cluster 8. The design-focused articles and books cluster together, though the cluster is broader than the theme.

## What the embeddings miss

### The non-linear mind
The emerging theme from Approach A -- Maaike as a non-linear thinker, the garden as a medium for a non-linear head -- is completely invisible to embeddings. The evidence is scattered across clusters 4 (book recommender), 5 (garden building), and 10 (freelance journey). Embeddings can't see this pattern because it's expressed in personal anecdotes and autobiographical asides, not topical keywords.

### The bilingual practitioner
Dutch content is sprinkled across clusters: DALL-E debiasing in Cluster 8, SSML tutorials in Cluster 7, Dutch books in Cluster 4. But the fresh reading's insight -- that being non-English-default in an English-default AI world is a *critique position* that reveals hidden biases -- is invisible. Embeddings see language similarity; they don't see epistemological stance.

### Truth as a coherent thread
The fresh reading identified a single theme running from Frankfurt's bullshit to Grice's maxims to fake hyperlinks to the designing-for-doubt concept. The embeddings split this across three clusters: Cluster 3 (ChatGPT articles), Cluster 8 (DALL-E/prompting), and Cluster 1 (philosophy books). Each cluster sees the surface topic; none sees the underlying concern about truth and trust in AI interfaces.

### The voice of the maker
Authorship and authenticity as a theme is scattered across Cluster 1 (AI philosophy books), Cluster 2 (writing), and Cluster 5 (the garden's AI transparency system). The connection between Nick Cave's critique, the "100% Maai" label, and the friction of accordion editing requires reading, not vectors.

## What the embeddings see that reading didn't emphasize

### Format contamination (Cluster 7)
15 of 22 items in Cluster 7 are videos. The embeddings cluster by content type, not topic. A video about designing for doubt and an article about the same concept end up in different clusters because video descriptions are short and share stylistic patterns. This confirms the known [[content-chunk-size-and-embeddings|chunk size problem]]: embeddings encode format alongside meaning.

### The junk drawer (Cluster 4)
37 items that don't belong anywhere else: fiction, personal books, miscellaneous videos, even one infrastructure field note (typed relations). When embeddings can't find a strong topic signal, items fall into a catch-all cluster. This is where the model gives up.

## Conclusion

The fear was right: starting from embeddings constrains discovery. The clusters confirm existing topical structure (knowledge graph research, conversation design profession, garden building) but miss cross-cutting themes that require understanding *stance*, *autobiography*, and *argument structure* rather than topic similarity.

The fresh reading found themes about truth, authenticity, non-linearity, and bilingual critique -- none of which live in a single topical cluster. These are the themes that *only* emerge from holding the entire garden in context simultaneously.

That said, the embeddings are not useless for thematic analysis. They are excellent at confirming obvious structure and identifying format contamination. A combined approach might work best: embeddings to map the topical landscape, then full-context reading to find the threads that run across it.
