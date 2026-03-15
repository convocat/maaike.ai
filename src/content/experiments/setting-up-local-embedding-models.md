---
title: Setting up local embedding models
date: 2026-03-14
maturity: developing
tags:
  - knowledge-graph
  - ai
  - digital-gardens
description: How to install and run embedding models locally using Ollama, compare three models on garden content, and run a full-scale embedding pass.
ai: co-created
---

Part of the [[knowledge-graph-for-the-garden|knowledge graph project]]. This experiment documents how to run embedding models locally and includes the code for both the 10-item comparison and the full-scale embedding run.

## Setting up Ollama

[Ollama](https://ollama.com) lets you run AI models on your own computer. It works as a local server: you start it once, and any script on your machine can ask it to process text. No accounts, no API keys, no data leaving your machine.

1. Download and install from [ollama.com](https://ollama.com)
2. Verify it's running:

```
ollama --version
```

3. Pull the three embedding models:

```
ollama pull nomic-embed-text
ollama pull bge-m3
ollama pull embeddinggemma:300m
```

| Model | Size | Dimensions | Good at |
|---|---|---|---|
| nomic-embed-text | 274 MB | 768 | Long context, fully open-source |
| bge-m3 | 1.2 GB | 1024 | Multilingual, discriminating scores |
| embeddinggemma:300m | 621 MB | 768 | Small, Matryoshka support |

All three run on a regular laptop CPU. Total disk space: about 2.1 GB.

## Quick test

```
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": "A digital garden is a personal knowledge base"
}'
```

Returns a JSON response with a list of 768 numbers: the embedding vector.

## Experiment 1: compare three models on 10 items

Compares all three models on 10 garden items across five collections, running each model twice: once with body text only, once with metadata (title + description + tags) prepended.

For the write-up of findings and model selection, see [[embedding-models-for-the-garden|the model survey]].

Run with: `python scripts/embedding-experiment.py`

```python
"""
Embedding experiment: compare three local models on 10 garden items.

Run 1: body text only
Run 2: title + description + tags + body text (metadata-enriched)

Outputs full similarity matrices as raw data.
"""

import json
import urllib.request
import math
import re
import os
import yaml

GARDEN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(GARDEN, "src", "content")

ITEMS = [
    ("articles/an-evening-with-chatgpt.md", "An evening with ChatGPT"),
    ("articles/de-biassing-dall-e.md", "De-biassing Dall-e"),
    ("articles/a-digital-garden-as-central-space.md", "A digital garden as central space"),
    ("articles/context-engineering-lets-call-it-design.md", "Context engineering? Let's call it design"),
    ("seeds/knowledge-gardens-and-serendipity.md", "Knowledge gardens and serendipity"),
    ("seeds/the-disappearance-of-authentic-voice-online.md", "The disappearance of authentic voice online"),
    ("seeds/chatbots-without-ai.md", "Chatbots without AI"),
    ("library/alone-together.md", "Alone together (Sherry Turkle)"),
    ("videos/designing-for-doubt.md", "Designing for doubt"),
    ("field-notes/reading-notes-saga-knowledge-graph.md", "Reading notes: Saga knowledge graph"),
]

SHORT = ["ChatGPT", "Dall-e", "Garden", "Context", "Serendip", "Voice", "NoBots", "Alone", "Doubt", "Saga"]

MODELS = ["nomic-embed-text", "bge-m3", "embeddinggemma:300m"]


def parse_frontmatter(text):
    if text.startswith("---"):
        end = text.find("---", 3)
        if end != -1:
            try:
                fm = yaml.safe_load(text[3:end].strip())
            except Exception:
                fm = {}
            return fm, text[end + 3:].strip()
    return {}, text


def clean_body(body):
    body = re.sub(r"!\[.*?\]\(.*?\)", "", body)
    body = re.sub(r"\[\[.*?\|(.*?)\]\]", r"\1", body)
    body = re.sub(r"\[\[(.*?)\]\]", r"\1", body)
    return body.strip()


def read_items():
    body_only = []
    with_meta = []
    for path, title in ITEMS:
        with open(os.path.join(CONTENT, path), "r", encoding="utf-8") as f:
            raw = f.read()
        fm, body = parse_frontmatter(raw)
        body = clean_body(body)
        body_only.append((title, body))
        meta_parts = [f"Title: {fm.get('title', title)}"]
        if fm.get("description"):
            meta_parts.append(f"Description: {fm['description']}")
        if fm.get("tags"):
            meta_parts.append(f"Tags: {', '.join(fm['tags'])}")
        if fm.get("author"):
            meta_parts.append(f"Author: {fm['author']}")
        with_meta.append((title, ". ".join(meta_parts) + ".\n\n" + body))
    return body_only, with_meta


def embed(model, text):
    text = text.replace("\x00", "")
    words = text.split()
    if len(words) > 800:
        text = " ".join(words[:800])
    data = json.dumps({"model": model, "input": text}, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request("http://localhost:11434/api/embed", data=data,
                                headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))["embeddings"][0]


def cosine_similarity(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    return dot / (mag_a * mag_b) if mag_a and mag_b else 0.0


def print_matrix(embeddings, short_labels):
    n = len(embeddings)
    print(f"\n  {'':>10}", end="")
    for label in short_labels:
        print(f" {label:>8}", end="")
    print()
    print(f"  {'':>10}" + " --------" * n)
    for i in range(n):
        print(f"  {short_labels[i]:>10}", end="")
        for j in range(n):
            if i == j:
                print(f" {'--':>8}", end="")
            else:
                print(f" {cosine_similarity(embeddings[i], embeddings[j]):>8.4f}", end="")
        print()


def run_model(model, items, short_labels):
    print(f"\n  Embedding {len(items)} items...")
    embeddings = []
    for title, body in items:
        vec = embed(model, body)
        embeddings.append(vec)
        print(f"    {title} ({len(body.split())} words -> {len(vec)} dims)")

    print(f"\n  SIMILARITY MATRIX:")
    print_matrix(embeddings, short_labels)

    pairs = []
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            pairs.append((cosine_similarity(embeddings[i], embeddings[j]), items[i][0], items[j][0]))
    pairs.sort(reverse=True)

    print(f"\n  TOP 10 most similar:")
    for sim, a, b in pairs[:10]:
        print(f"    {sim:.4f}  {a}  <->  {b}")
    print(f"\n  BOTTOM 5 least similar:")
    for sim, a, b in pairs[-5:]:
        print(f"    {sim:.4f}  {a}  <->  {b}")

    print(f"\n  CLOSEST MATCH per item:")
    for i, (title, _) in enumerate(items):
        best_sim, best_match = -1, ""
        for j, (other_title, _) in enumerate(items):
            if i != j:
                sim = cosine_similarity(embeddings[i], embeddings[j])
                if sim > best_sim:
                    best_sim, best_match = sim, other_title
        print(f"    {title:<50} -> {best_match} ({best_sim:.4f})")


def run_experiment():
    print("Reading 10 garden items...")
    body_only, with_meta = read_items()
    print(f"  Read {len(body_only)} items")
    print(f"\n  WORD COUNTS:")
    for (title, body), (_, meta_body) in zip(body_only, with_meta):
        print(f"    {title:<50} body: {len(body.split()):>5} | with meta: {len(meta_body.split()):>5}")

    for model in MODELS:
        print(f"\n{'=' * 80}")
        print(f"MODEL: {model}")
        print(f"{'=' * 80}")
        print(f"\n--- RUN 1: Body text only ---")
        run_model(model, body_only, SHORT)
        print(f"\n--- RUN 2: With metadata (title + description + tags) ---")
        run_model(model, with_meta, SHORT)
    print()


if __name__ == "__main__":
    run_experiment()
```

## Experiment 2: full-scale embedding run

Embeds all 157 non-draft garden items with bge-m3, extracts existing wiki-links as ground truth, and identifies confirmed links, surprising misses, and candidate discoveries. Saves embeddings to `scripts/embeddings-bge-m3.json` for reuse.

For the analysis of the 2,771 candidates and threshold strategies, see [[tuning-the-similarity-threshold|threshold tuning]].

Run with: `python scripts/full-scale-embeddings.py` (requires Ollama running with bge-m3 pulled)

```python
"""
Full-scale embedding run: all garden items with bge-m3.

Embeds every non-draft content item (metadata-enriched), extracts existing
wiki-links as ground truth, and compares embedding-based similarity against
manual links.

Outputs:
  - Confirmed links (high similarity + existing wiki-link)
  - Candidate discoveries (high similarity, no wiki-link)
  - Surprising misses (wiki-link exists but low similarity)
  - Per-item top 5 suggestions
  - Saved embeddings JSON for later reuse
"""

import json
import urllib.request
import math
import re
import os
import yaml
from pathlib import Path

GARDEN = Path(__file__).resolve().parent.parent
CONTENT = GARDEN / "src" / "content"
MODEL = "bge-m3"
TOP_N = 5
CANDIDATE_THRESHOLD = 0.55
OUTPUT_DIR = GARDEN / "scripts"

COLLECTIONS = [
    "articles", "field-notes", "seeds", "weblinks",
    "videos", "library", "experiments", "principles",
]


def parse_frontmatter(text):
    if text.startswith("---"):
        end = text.find("---", 3)
        if end != -1:
            try:
                fm = yaml.safe_load(text[3:end].strip())
            except Exception:
                fm = {}
            return fm, text[end + 3:].strip()
    return {}, text


def extract_wiki_links(body):
    """Extract wiki-link targets before cleaning the body."""
    targets = set()
    for match in re.finditer(r"\[\[([^\]]+)\]\]", body):
        raw = match.group(1)
        slug = raw.split("|")[0].replace(" ", "-").lower()
        targets.add(slug)
    return targets


def clean_body(body):
    body = re.sub(r"!\[.*?\]\(.*?\)", "", body)
    body = re.sub(r"\[\[.*?\|(.*?)\]\]", r"\1", body)
    body = re.sub(r"\[\[(.*?)\]\]", r"\1", body)
    return body.strip()


def scan_all_items():
    """Walk all collections, return list of item dicts."""
    items = []
    for collection in COLLECTIONS:
        coll_dir = CONTENT / collection
        if not coll_dir.exists():
            continue
        for md_file in sorted(coll_dir.glob("*.md")):
            raw = md_file.read_text(encoding="utf-8")
            fm, body = parse_frontmatter(raw)

            if fm.get("draft", False):
                continue

            slug = md_file.stem
            wiki_links = extract_wiki_links(body)
            body_clean = clean_body(body)

            # Build metadata-enriched text
            meta_parts = [f"Title: {fm.get('title', slug)}"]
            if fm.get("description"):
                meta_parts.append(f"Description: {fm['description']}")
            if fm.get("tags"):
                meta_parts.append(f"Tags: {', '.join(fm['tags'])}")
            if fm.get("author"):
                meta_parts.append(f"Author: {fm['author']}")
            enriched = ". ".join(meta_parts) + ".\n\n" + body_clean

            items.append({
                "slug": slug,
                "title": fm.get("title", slug),
                "collection": collection,
                "word_count": len(body_clean.split()),
                "wiki_links": wiki_links,
                "text": enriched,
            })
    return items


def embed(text):
    text = text.replace("\x00", "")
    words = text.split()
    if len(words) > 800:
        text = " ".join(words[:800])
    data = json.dumps({"model": MODEL, "input": text}, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        "http://localhost:11434/api/embed", data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))["embeddings"][0]


def cosine_similarity(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    return dot / (mag_a * mag_b) if mag_a and mag_b else 0.0


def build_slug_index(items):
    """Map slugs to item indices for wiki-link lookup."""
    return {item["slug"]: i for i, item in enumerate(items)}


def run():
    print("Scanning all garden content...")
    items = scan_all_items()
    print(f"Found {len(items)} non-draft items across {len(COLLECTIONS)} collections\n")

    # Show collection breakdown
    by_coll = {}
    for item in items:
        by_coll.setdefault(item["collection"], []).append(item)
    for coll in COLLECTIONS:
        if coll in by_coll:
            print(f"  {coll}: {len(by_coll[coll])} items")

    # Count wiki-links
    all_links = set()
    for item in items:
        for target in item["wiki_links"]:
            all_links.add((item["slug"], target))
    print(f"\n  Total wiki-links found: {len(all_links)}")

    # Embed all items
    print(f"\nEmbedding {len(items)} items with {MODEL}...")
    embeddings = []
    for i, item in enumerate(items):
        vec = embed(item["text"])
        embeddings.append(vec)
        if (i + 1) % 10 == 0 or i == len(items) - 1:
            print(f"  {i + 1}/{len(items)} done")

    # Save embeddings for reuse
    embed_data = {
        "model": MODEL,
        "items": [
            {"slug": item["slug"], "title": item["title"],
             "collection": item["collection"]}
            for item in items
        ],
        "embeddings": embeddings,
    }
    embed_path = OUTPUT_DIR / "embeddings-bge-m3.json"
    with open(embed_path, "w", encoding="utf-8") as f:
        json.dump(embed_data, f)
    print(f"\nEmbeddings saved to {embed_path.name}")

    # Build slug index
    slug_idx = build_slug_index(items)

    # Compute all pairwise similarities
    n = len(items)
    sim_matrix = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1, n):
            s = cosine_similarity(embeddings[i], embeddings[j])
            sim_matrix[i][j] = s
            sim_matrix[j][i] = s

    # Per-item top N suggestions
    print(f"\n{'=' * 80}")
    print(f"TOP {TOP_N} SUGGESTIONS PER ITEM")
    print(f"{'=' * 80}\n")

    for i, item in enumerate(items):
        scored = []
        for j in range(n):
            if i != j:
                scored.append((sim_matrix[i][j], j))
        scored.sort(reverse=True)

        print(f"  {item['title']} [{item['collection']}]")
        for sim, j in scored[:TOP_N]:
            other = items[j]
            has_link = other["slug"] in item["wiki_links"]
            marker = " [linked]" if has_link else ""
            print(f"    {sim:.4f}  {other['title']}{marker}")
        print()

    # Compare against wiki-links
    print(f"\n{'=' * 80}")
    print("WIKI-LINK COMPARISON")
    print(f"{'=' * 80}")

    confirmed = []
    misses = []

    for item in items:
        i = slug_idx[item["slug"]]
        for target_slug in item["wiki_links"]:
            if target_slug not in slug_idx:
                continue  # link to something outside our index
            j = slug_idx[target_slug]
            sim = sim_matrix[i][j]
            pair = {
                "source": item["title"],
                "target": items[j]["title"],
                "similarity": sim,
            }
            if sim >= CANDIDATE_THRESHOLD:
                confirmed.append(pair)
            else:
                misses.append(pair)

    confirmed.sort(key=lambda x: x["similarity"], reverse=True)
    misses.sort(key=lambda x: x["similarity"])

    print(f"\n  CONFIRMED ({len(confirmed)} links with similarity >= {CANDIDATE_THRESHOLD}):\n")
    for p in confirmed:
        print(f"    {p['similarity']:.4f}  {p['source']}  ->  {p['target']}")

    print(f"\n  SURPRISING MISSES ({len(misses)} links with similarity < {CANDIDATE_THRESHOLD}):\n")
    for p in misses:
        print(f"    {p['similarity']:.4f}  {p['source']}  ->  {p['target']}")

    # Candidate discoveries: high similarity pairs with no wiki-link in either direction
    print(f"\n{'=' * 80}")
    print(f"CANDIDATE DISCOVERIES (similarity >= {CANDIDATE_THRESHOLD}, no wiki-link)")
    print(f"{'=' * 80}\n")

    candidates = []
    for i in range(n):
        for j in range(i + 1, n):
            if sim_matrix[i][j] >= CANDIDATE_THRESHOLD:
                a_links_b = items[j]["slug"] in items[i]["wiki_links"]
                b_links_a = items[i]["slug"] in items[j]["wiki_links"]
                if not a_links_b and not b_links_a:
                    candidates.append({
                        "a": items[i]["title"],
                        "b": items[j]["title"],
                        "similarity": sim_matrix[i][j],
                        "a_coll": items[i]["collection"],
                        "b_coll": items[j]["collection"],
                    })

    candidates.sort(key=lambda x: x["similarity"], reverse=True)
    print(f"  Found {len(candidates)} candidate pairs\n")
    for c in candidates[:50]:
        print(f"    {c['similarity']:.4f}  {c['a']} [{c['a_coll']}]  <->  {c['b']} [{c['b_coll']}]")
    if len(candidates) > 50:
        print(f"\n    ... and {len(candidates) - 50} more")

    # Summary stats
    print(f"\n{'=' * 80}")
    print("SUMMARY")
    print(f"{'=' * 80}")
    all_sims = [sim_matrix[i][j] for i in range(n) for j in range(i + 1, n)]
    all_sims.sort()
    print(f"  Items: {n}")
    print(f"  Total pairs: {len(all_sims)}")
    print(f"  Similarity range: {all_sims[0]:.4f} - {all_sims[-1]:.4f}")
    print(f"  Median similarity: {all_sims[len(all_sims)//2]:.4f}")
    print(f"  Mean similarity: {sum(all_sims)/len(all_sims):.4f}")
    print(f"  Wiki-links resolved: {len(confirmed) + len(misses)} of {len(all_links)}")
    print(f"  Confirmed by embeddings: {len(confirmed)}")
    print(f"  Surprising misses: {len(misses)}")
    print(f"  Candidate discoveries: {len(candidates)}")
    print()


if __name__ == "__main__":
    run()
```
