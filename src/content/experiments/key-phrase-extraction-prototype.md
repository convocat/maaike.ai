---
title: "Key phrase extraction prototype"
date: 2026-03-15
maturity: draft
tags:
  - knowledge-graph
  - ai
  - digital-gardens
description: Extract key phrases from 10 garden items using Ollama, compare LLM-based extraction with YAKE.
ai: co-created
---

Prototype key phrase extraction on 10 garden items, comparing two approaches from the [[key-phrase-extraction-for-the-garden|write-up]]: LLM-based extraction via Ollama and statistical extraction via YAKE.

## Model and settings

- **Model**: `gemma3:4b` (Google Gemma 3, 4B parameter variant) via Ollama
- **Temperature**: 0.1 (near-deterministic, minimizing randomness)
- **Max input**: body text truncated to 1,500 words
- **Max output**: 8 phrases per item

### Prompt used

```
Extract 8 key phrases from this text.
Key phrases are specific concepts or topics (2-4 words each) that capture what the text is about.
Return ONLY the phrases, one per line. No numbering, no explanation.

Title: {title}

{body}
```

The prompt is deliberately simple: no few-shot examples, no role assignment. This is the baseline. Future iterations could test more structured prompts or include examples of good/bad phrases.

### YAKE settings

- Language: `en`
- Max phrase length: 3 words (`n=3`)
- Deduplication threshold: 0.7
- No model needed, purely statistical

## Prerequisites

- Ollama running locally (`ollama serve`)
- A generative model pulled: `ollama pull gemma3:4b`
- Python with requests: `pip install requests`
- For YAKE comparison: `pip install yake`

## The code

```python
"""
Key phrase extraction prototype: LLM vs YAKE on 10 garden items.
Run from the digital-garden project root:
    python key-phrase-extraction.py
"""

import json
import os
import re
import requests

CONTENT_DIR = "src/content"
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma3:4b"

# --- Helpers ---

def load_markdown(path):
    """Read a markdown file, strip frontmatter, return (title, body)."""
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    # Strip YAML frontmatter
    title = ""
    if text.startswith("---"):
        end = text.find("---", 3)
        if end != -1:
            front = text[3:end]
            title_match = re.search(r'title:\s*"?([^"\n]+)"?', front)
            if title_match:
                title = title_match.group(1).strip()
            text = text[end + 3:].strip()

    # Strip wiki-links: [[target|display]] -> display, [[target]] -> target
    text = re.sub(r'\[\[([^]|]+)\|([^]]+)\]\]', r'\2', text)
    text = re.sub(r'\[\[([^]]+)\]\]', r'\1', text)

    return title, text


def pick_items(n=10):
    """Pick n items across collections, preferring variety."""
    items = []
    for collection in ["field-notes", "articles", "seeds", "experiments", "weblinks"]:
        folder = os.path.join(CONTENT_DIR, collection)
        if not os.path.isdir(folder):
            continue
        for fname in sorted(os.listdir(folder)):
            if fname.endswith(".md"):
                path = os.path.join(folder, fname)
                title, body = load_markdown(path)
                if len(body) > 50:  # skip very short items
                    items.append({
                        "path": path,
                        "collection": collection,
                        "title": title,
                        "body": body,
                    })
    # Take a spread: pick every nth item
    step = max(1, len(items) // n)
    selected = items[::step][:n]
    print(f"Selected {len(selected)} items from {len(items)} total\n")
    return selected


# --- LLM extraction ---

def extract_keyphrases_llm(title, body, max_phrases=8):
    """Use Ollama to extract key phrases from a garden item."""
    # Truncate very long texts to ~1500 words
    words = body.split()
    if len(words) > 1500:
        body = " ".join(words[:1500])

    prompt = f"""Extract {max_phrases} key phrases from this text.
Key phrases are specific concepts or topics (2-4 words each) that capture what the text is about.
Return ONLY the phrases, one per line. No numbering, no explanation.

Title: {title}

{body}"""

    response = requests.post(OLLAMA_URL, json={
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.1}
    })
    response.raise_for_status()
    result = response.json()["response"].strip()

    # Parse: one phrase per line, clean up
    phrases = []
    for line in result.split("\n"):
        line = line.strip().strip("-•*").strip()
        if line and len(line) < 80:
            phrases.append(line.lower())
    return phrases[:max_phrases]


# --- YAKE extraction ---

def extract_keyphrases_yake(body, max_phrases=8):
    """Use YAKE for statistical key phrase extraction."""
    try:
        import yake
    except ImportError:
        return ["(yake not installed)"]

    kw_extractor = yake.KeywordExtractor(
        lan="en",
        n=3,           # max phrase length
        dedupLim=0.7,  # deduplication threshold
        top=max_phrases,
    )
    keywords = kw_extractor.extract_keywords(body)
    return [kw.lower() for kw, score in keywords]


# --- Main ---

def main():
    items = pick_items(10)

    results = []
    for item in items:
        print(f"Processing: {item['title']}")
        print(f"  Collection: {item['collection']}")
        print(f"  Words: {len(item['body'].split())}")

        llm_phrases = extract_keyphrases_llm(item["title"], item["body"])
        yake_phrases = extract_keyphrases_yake(item["body"])

        print(f"  LLM phrases:  {llm_phrases}")
        print(f"  YAKE phrases: {yake_phrases}")

        # Find overlap
        llm_set = set(llm_phrases)
        yake_set = set(yake_phrases)
        overlap = llm_set & yake_set
        if overlap:
            print(f"  Overlap: {overlap}")
        print()

        results.append({
            "title": item["title"],
            "collection": item["collection"],
            "word_count": len(item["body"].split()),
            "llm_phrases": llm_phrases,
            "yake_phrases": yake_phrases,
            "overlap": list(overlap),
        })

    # Save results
    with open("keyphrase-results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Results saved to keyphrase-results.json")

    # Summary stats
    avg_llm = sum(len(r["llm_phrases"]) for r in results) / len(results)
    avg_yake = sum(len(r["yake_phrases"]) for r in results) / len(results)
    avg_overlap = sum(len(r["overlap"]) for r in results) / len(results)
    print(f"\nSummary:")
    print(f"  Avg LLM phrases:  {avg_llm:.1f}")
    print(f"  Avg YAKE phrases: {avg_yake:.1f}")
    print(f"  Avg overlap:      {avg_overlap:.1f}")


if __name__ == "__main__":
    main()
```

## How to run

1. Make sure Ollama is running: `ollama serve`
2. Pull a generative model if needed: `ollama pull gemma3:4b`
3. Install dependencies: `pip install requests yake`
4. Run from the project root: `python key-phrase-extraction.py`

The script picks 10 items spread across collections, runs both extractors, and saves results to `keyphrase-results.json`.

## What to look for

- Do LLM phrases capture the actual topic better than YAKE?
- How does quality differ for short items (under 100 words) vs longer ones?
- Are there useful phrases that both methods agree on?
- How long does LLM extraction take per item?

Analysis of results goes in a linked field note.
