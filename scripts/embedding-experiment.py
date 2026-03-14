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
