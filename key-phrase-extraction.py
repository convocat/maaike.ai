"""
Key phrase extraction: LLM vs YAKE on all garden items.
Run from the digital-garden project root:
    python key-phrase-extraction.py
    python key-phrase-extraction.py --sample 10   # prototype on 10 items
"""

import json
import os
import re
import sys
import time
import requests

CONTENT_DIR = "src/content"
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma3:4b"
ALL_COLLECTIONS = ["field-notes", "articles", "seeds", "experiments",
                   "weblinks", "videos", "library", "principles"]

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


def load_all_items():
    """Load all markdown items across all collections."""
    items = []
    for collection in ALL_COLLECTIONS:
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
                        "slug": fname.replace(".md", ""),
                        "collection": collection,
                        "title": title,
                        "body": body,
                    })
    return items


def pick_sample(items, n=10):
    """Pick n items spread across the full list."""
    step = max(1, len(items) // n)
    return items[::step][:n]


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
    sample_n = None
    if "--sample" in sys.argv:
        idx = sys.argv.index("--sample")
        sample_n = int(sys.argv[idx + 1]) if idx + 1 < len(sys.argv) else 10

    all_items = load_all_items()
    items = pick_sample(all_items, sample_n) if sample_n else all_items
    total = len(items)

    print(f"Processing {total} items from {len(all_items)} total")
    print(f"Model: {MODEL} | Temperature: 0.1 | Max phrases: 8\n")

    results = []
    start_total = time.time()

    for i, item in enumerate(items, 1):
        start_item = time.time()
        print(f"[{i}/{total}] {item['title']}")
        print(f"  Collection: {item['collection']} | Words: {len(item['body'].split())}")

        llm_phrases = extract_keyphrases_llm(item["title"], item["body"])
        llm_time = time.time() - start_item

        print(f"  LLM ({llm_time:.1f}s): {llm_phrases}")
        print()

        results.append({
            "title": item["title"],
            "slug": item["slug"],
            "collection": item["collection"],
            "word_count": len(item["body"].split()),
            "llm_phrases": llm_phrases,
            "llm_time_seconds": round(llm_time, 1),
        })

    elapsed = time.time() - start_total

    # Save results
    output = {
        "model": MODEL,
        "temperature": 0.1,
        "max_phrases": 8,
        "total_items": total,
        "total_time_seconds": round(elapsed, 1),
        "avg_time_per_item": round(elapsed / total, 1),
        "items": results,
    }
    with open("keyphrase-results.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"Results saved to keyphrase-results.json")

    # Summary stats
    avg_llm = sum(len(r["llm_phrases"]) for r in results) / total
    avg_time = sum(r["llm_time_seconds"] for r in results) / total
    print(f"\nSummary ({total} items in {elapsed:.0f}s):")
    print(f"  Avg LLM phrases:    {avg_llm:.1f}")
    print(f"  Avg LLM time/item:  {avg_time:.1f}s")


if __name__ == "__main__":
    main()
