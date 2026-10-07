# Decision eval: Jev vs OpenAI Decisions API

Compares two decision models in **choice mode** on the same items:

- **Jev** (TypeSafe AI), `POST https://api.typesafe.ai/v1/systemone`, model `jev-latest`
- **OpenAI Decisions API** (public beta since 6 October 2026), `POST https://api.openai.com/v1/decisions`, model `gpt-6-luna`

Main question: **does shifting the order of the options change the probabilities?**

## Run

```bash
# keys: environment or tools/decision-eval/.env (gitignored)
#   TYPESAFE_API_KEY=...
#   OPENAI_API_KEY=...

python tools/decision-eval/decision_eval.py run --dataset generic --limit 3   # smoke test first
python tools/decision-eval/decision_eval.py run --dataset generic
python tools/decision-eval/decision_eval.py run --dataset chatbot

python tools/decision-eval/decision_eval.py run --dataset generic --providers mock   # offline, no keys
python tools/decision-eval/decision_eval.py report tools/decision-eval/results/<folder>   # re-analyse
```

Stdlib only. Each run writes `results/<timestamp>-<dataset>/` with `raw.jsonl` (every call), `summary.json` and `report.md`. Add `--keep-raw` to store the full API responses, `--providers jev` or `--providers openai` to run one side.

Cost: with the defaults (cyclic shifts + reversed + 3 repeats) the generic set is about 236 calls per provider and the chatbot set about 314. Both APIs charge input tokens only, so a full run is a matter of cents.

## The two sets

| Set | File | Items | Questions |
|---|---|---|---|
| Generic | `datasets/generic.json` | 30 | sentiment, news topic, language ID, support routing, factual multiple choice (A to D), capital city (7 named options) |
| Chatbots and conversation design | `datasets/chatbot.json` | 38 | intent, dialogue act, next move (clarify, confirm, hand off...), user state, main flaw in a bot reply, conversation outcome |

Every item has a `gold` label and a `difficulty` (`clear` or `ambiguous`). Ambiguous items may list `acceptable` alternatives. A few chatbot items are in Dutch (`"lang": "nl"`). To add items, append to `items`; the loader checks that every label exists as an option.

## Langfuse

The test sets can be uploaded as Langfuse datasets (`decision-eval-generic`, `decision-eval-chatbot`):

```bash
python tools/decision-eval/sync_datasets_to_langfuse.py --dry-run
python tools/decision-eval/sync_datasets_to_langfuse.py
```

Uses `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` and `LANGFUSE_HOST` from the environment, `tools/decision-eval/.env` or `tools/karpathy-wiki/.env`. Each item keeps a fixed id, so running it again after editing the JSON updates items in place; items removed from the JSON are archived. The JSON files stay the source of truth: edit there, then sync.

## How order is varied

For each item the same question is asked with the options in several orders:

- **all cyclic shifts** (A B C D, B C D A, C D A B, D A B C): every option sits in every position exactly once, which separates position bias from label preference
- **the reversed list**
- **the canonical order 3 times** as a noise baseline

Jev receives options as a JSON object (`criteria`), OpenAI as an array (`choices`). For Jev the key order in the JSON body is the order that is varied. If Jev turns out completely order-insensitive, that may mean it ignores key order or normalises it internally; the report cannot tell those apart.

The `factual` question uses fixed letters (A to D) whose answers are written in the input. Shuffling there only moves the labels in the option list, not the answers in the text: a test of label order, not content order. `factual_named` puts the actual answers in the options.

## What the report shows

**Accuracy**
- canonical order, averaged over all orders, and **order-marginalised** (average the probabilities over all orders, then take the top choice: what you would get if you debiased by asking every order)
- macro precision, recall and F1 per question

**Precision of the probabilities**
- mean probability on the gold label, Brier score, log loss
- expected calibration error (ECE) of the reported `confidence`: does 0.9 confidence mean right 90% of the time?

**Order sensitivity**
- flip rate: share of items whose top choice differs between orders, next to the flip rate on plain repeats
- total variation distance (TVD) of each order's distribution from the item's average, next to the same on repeats. Order only matters where it exceeds repeat noise.
- range of the gold-label probability across orders
- **position effect**: how much probability an option gains or loses in the first, middle or last slot compared with its own average. 0 means no position bias, `+0.05` means five percentage points extra just for being first.
- a list of every item that flipped, with the answer per order

All rates have 95% bootstrap intervals over items. With 30 to 38 items the intervals are wide: treat small differences as noise.

## Caveats

- The OpenAI request and response shapes come from the `openai` Python SDK v3.26.0 (`openai/types/decision*.py`). The Jev shapes come from TypeSafe's published examples. If either API changes, `JevProvider.decide` and `OpenAIDecisionsProvider.decide` are the only places to update. Run with `--limit 3 --keep-raw` first and check `raw.jsonl`.
- Gold labels were drafted by Claude and need Maaike's review before results are published, especially the `ambiguous` items.
- One question per request, so multi-question effects are not measured.
