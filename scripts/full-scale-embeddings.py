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
