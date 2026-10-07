"""Upload the decision-eval test sets to Langfuse as datasets.

Each file in `datasets/` becomes one Langfuse dataset:

- `datasets/generic.json`  -> `decision-eval-generic`
- `datasets/chatbot.json`  -> `decision-eval-chatbot`

Each item gets:

- input:            text, question id, instructions, options (canonical order)
- expected_output:  gold label, plus acceptable alternatives for ambiguous items
- metadata:         difficulty, language, note
- id:               `decision-eval-<set>-<item id>`, so running this again
                    updates items in place instead of duplicating them

Items that were removed from the JSON are archived in Langfuse, not deleted.

Keys: LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST (default
https://cloud.langfuse.com), from the environment, tools/decision-eval/.env
or tools/karpathy-wiki/.env.

Usage:

    python tools/decision-eval/sync_datasets_to_langfuse.py --dry-run
    python tools/decision-eval/sync_datasets_to_langfuse.py
    python tools/decision-eval/sync_datasets_to_langfuse.py --only chatbot
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATASETS = HERE / "datasets"
PREFIX = "decision-eval"

for _env_file in (HERE / ".env", HERE.parent / "karpathy-wiki" / ".env"):
    if _env_file.exists():
        for _line in _env_file.read_text(encoding="utf-8").splitlines():
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _v = _line.split("=", 1)
                _k, _v = _k.strip(), _v.strip().strip('"').strip("'")
                if not os.environ.get(_k):
                    os.environ[_k] = _v


def build(set_name: str, data: dict) -> tuple[dict, list[dict]]:
    """Return (dataset definition, item payloads) for one JSON test set."""
    questions = data["questions"]
    dataset = {
        "name": f"{PREFIX}-{set_name}",
        "description": data.get("description", ""),
        "metadata": {
            "title": data.get("name", set_name),
            "source": f"tools/decision-eval/datasets/{set_name}.json",
            "mode": "choice",
            "questions": {qid: q["instructions"] for qid, q in questions.items()},
        },
    }
    items = []
    for it in data["items"]:
        q = questions[it["question"]]
        items.append({
            "id": f"{PREFIX}-{set_name}-{it['id']}",
            "input": {
                "text": it["input"],
                "question": it["question"],
                "instructions": q["instructions"],
                "options": q["options"],
            },
            "expected_output": {
                "choice": it["gold"],
                "acceptable": [it["gold"], *it.get("acceptable", [])],
            },
            "metadata": {
                "item_id": it["id"],
                "question": it["question"],
                "difficulty": it.get("difficulty", "clear"),
                "lang": it.get("lang", "en"),
                **({"note": it["note"]} if it.get("note") else {}),
            },
        })
    return dataset, items


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Upload decision-eval test sets to Langfuse datasets.")
    ap.add_argument("--dry-run", action="store_true", help="show what would be uploaded, call nothing")
    ap.add_argument("--only", help="one set name, e.g. generic or chatbot")
    args = ap.parse_args(argv)

    files = sorted(DATASETS.glob("*.json"))
    if args.only:
        files = [f for f in files if f.stem == args.only]
        if not files:
            print(f"No dataset named '{args.only}' in {DATASETS}", file=sys.stderr)
            return 1

    plans = [build(f.stem, json.loads(f.read_text(encoding="utf-8"))) for f in files]

    if args.dry_run:
        for ds, items in plans:
            print(f"{ds['name']}: {len(items)} items")
            for i in items[:2]:
                print("  " + json.dumps(i, ensure_ascii=False)[:300])
            print("  ...")
        return 0

    if not (os.environ.get("LANGFUSE_PUBLIC_KEY") and os.environ.get("LANGFUSE_SECRET_KEY")):
        print("LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY not set.", file=sys.stderr)
        return 1
    try:
        from langfuse import Langfuse
    except ImportError as e:
        print(f"langfuse SDK not installed ({e}). pip install 'langfuse>=3.0.0'", file=sys.stderr)
        return 1

    client = Langfuse(
        public_key=os.environ["LANGFUSE_PUBLIC_KEY"],
        secret_key=os.environ["LANGFUSE_SECRET_KEY"],
        host=os.environ.get("LANGFUSE_HOST", "https://cloud.langfuse.com"),
    )

    for ds, items in plans:
        # Creating a dataset that already exists updates its description and metadata.
        client.create_dataset(name=ds["name"], description=ds["description"], metadata=ds["metadata"])
        for it in items:
            client.create_dataset_item(dataset_name=ds["name"], status="ACTIVE", **it)

        wanted = {it["id"] for it in items}
        archived = 0
        for existing in client.get_dataset(ds["name"]).items:
            if existing.id not in wanted and existing.status != "ARCHIVED":
                # Resend the content: an upsert with only id + status could blank it.
                client.create_dataset_item(
                    dataset_name=ds["name"], id=existing.id, status="ARCHIVED",
                    input=existing.input, expected_output=existing.expected_output,
                    metadata=existing.metadata,
                )
                archived += 1
        print(f"{ds['name']}: {len(items)} items upserted" + (f", {archived} archived" if archived else ""))

    client.flush()
    return 0


if __name__ == "__main__":
    sys.exit(main())
