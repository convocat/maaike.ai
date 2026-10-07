"""
Decision model eval: Jev (TypeSafe) vs the OpenAI Decisions API, choice mode.

What it measures
----------------
1. Accuracy:    does the top choice match the gold label?
2. Precision:   macro precision / recall / F1 per question, plus calibration
                (Brier score, log loss, expected calibration error on the
                `confidence` field each API returns).
3. Order bias:  every item is asked several times with the options in a
                different order (all cyclic shifts plus the reversed list).
                Cyclic shifts put every option in every position exactly once,
                so position effects can be separated from label preferences.
                The canonical order is also repeated, which gives a noise
                baseline: if a shuffled order changes the answer more than a
                plain repeat does, the order is doing it.

Usage
-----
    python tools/decision-eval/decision_eval.py run --dataset generic
    python tools/decision-eval/decision_eval.py run --dataset chatbot
    python tools/decision-eval/decision_eval.py run --dataset generic --providers mock   # offline dry run
    python tools/decision-eval/decision_eval.py report results/<run-folder>               # re-analyse saved raw calls

Keys come from the environment or tools/decision-eval/.env:
    TYPESAFE_API_KEY   for Jev        (POST https://api.typesafe.ai/v1/systemone)
    OPENAI_API_KEY     for Decisions  (POST https://api.openai.com/v1/decisions)

Stdlib only, no extra packages needed.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import random
import statistics
import sys
import time
import urllib.error
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATASETS = HERE / "datasets"
RESULTS = HERE / "results"

JEV_URL = "https://api.typesafe.ai/v1/systemone"
OPENAI_URL = "https://api.openai.com/v1/decisions"


# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------

def load_env() -> None:
    env_file = HERE / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k, v = k.strip(), v.strip().strip('"').strip("'")
        if not os.environ.get(k):
            os.environ[k] = v


# ---------------------------------------------------------------------------
# Dataset
# ---------------------------------------------------------------------------

def load_dataset(name_or_path: str) -> dict:
    p = Path(name_or_path)
    if not p.exists():
        p = DATASETS / f"{name_or_path}.json"
    data = json.loads(p.read_text(encoding="utf-8"))
    questions = data["questions"]
    for item in data["items"]:
        q = questions[item["question"]]
        values = [o["value"] for o in q["options"]]
        for label in [item["gold"], *item.get("acceptable", [])]:
            if label not in values:
                raise ValueError(f"{item['id']}: label '{label}' is not an option of '{item['question']}'")
    data["_path"] = str(p)
    return data


def orderings(n: int, strategy: str, n_random: int, rng: random.Random) -> list[tuple[int, ...]]:
    """Index orders to ask. The canonical order is always first."""
    canonical = tuple(range(n))
    out = [canonical]
    if strategy in ("cyclic", "cyclic+reverse"):
        out += [tuple((i + s) % n for i in range(n)) for s in range(1, n)]
    if strategy in ("reverse", "cyclic+reverse"):
        out.append(tuple(reversed(canonical)))
    if strategy == "random":
        for _ in range(n_random):
            perm = list(canonical)
            rng.shuffle(perm)
            out.append(tuple(perm))
    seen, unique = set(), []
    for o in out:
        if o not in seen:
            seen.add(o)
            unique.append(o)
    return unique


# ---------------------------------------------------------------------------
# Providers. Each returns a normalised answer:
#   {"choice": str|None, "probabilities": {value: p}, "confidence": float|None,
#    "refused": bool, "model": str|None, "raw": <response json>}
# ---------------------------------------------------------------------------

class ProviderError(Exception):
    pass


def _post_json(url: str, payload: dict, api_key: str, timeout: float = 60, retries: int = 4) -> dict:
    body = json.dumps(payload).encode("utf-8")
    delay = 2.0
    for attempt in range(retries + 1):
        req = urllib.request.Request(
            url,
            data=body,
            method="POST",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", errors="replace")[:500]
            if e.code in (429, 500, 502, 503, 504) and attempt < retries:
                time.sleep(delay)
                delay *= 2
                continue
            raise ProviderError(f"HTTP {e.code}: {detail}") from e
        except (urllib.error.URLError, TimeoutError) as e:
            if attempt < retries:
                time.sleep(delay)
                delay *= 2
                continue
            raise ProviderError(str(e)) from e
    raise ProviderError("unreachable")


class JevProvider:
    name = "jev"

    def __init__(self, model: str):
        self.model = model
        self.key = os.environ.get("TYPESAFE_API_KEY", "")
        if not self.key:
            raise SystemExit("TYPESAFE_API_KEY is not set (environment or tools/decision-eval/.env)")

    def decide(self, text: str, instructions: str, options: list[dict]) -> dict:
        # Jev takes options as a JSON object: label -> description. Python dicts
        # and json.dumps keep insertion order, so the order we build is the order sent.
        criteria = {o["value"]: o.get("description") or o["value"] for o in options}
        payload = {
            "model": self.model,
            "state": text,
            "questions": {"q": {"type": "choice", "instructions": instructions, "criteria": criteria}},
        }
        raw = _post_json(JEV_URL, payload, self.key)
        ans = (raw.get("answers") or {}).get("q") or {}
        if ans.get("type") != "choice":
            return {"choice": None, "probabilities": {}, "confidence": None, "refused": True,
                    "model": raw.get("model"), "raw": raw}
        return {
            "choice": ans.get("choice"),
            "probabilities": {str(k): float(v) for k, v in (ans.get("probabilities") or {}).items()},
            "confidence": ans.get("confidence"),
            "refused": False,
            "model": raw.get("model"),
            "raw": raw,
        }


class OpenAIDecisionsProvider:
    name = "openai"

    def __init__(self, model: str):
        self.model = model
        self.key = os.environ.get("OPENAI_API_KEY", "")
        if not self.key:
            raise SystemExit("OPENAI_API_KEY is not set (environment or tools/decision-eval/.env)")

    def decide(self, text: str, instructions: str, options: list[dict]) -> dict:
        choices = []
        for o in options:
            c = {"value": o["value"]}
            if o.get("description"):
                c["description"] = o["description"]
            choices.append(c)
        payload = {
            "model": self.model,
            "input": text,
            "questions": [{"type": "choice", "name": "q", "instructions": instructions, "choices": choices}],
        }
        raw = _post_json(OPENAI_URL, payload, self.key)
        answers = raw.get("answers") or []
        ans = next((a for a in answers if a.get("name") == "q"), answers[0] if answers else {})
        if ans.get("type") != "choice":
            return {"choice": None, "probabilities": {}, "confidence": None, "refused": True,
                    "model": raw.get("model"), "raw": raw}
        return {
            "choice": str(ans.get("choice")),
            "probabilities": {str(p["value"]): float(p["probability"]) for p in ans.get("probabilities") or []},
            "confidence": ans.get("confidence"),
            "refused": False,
            "model": raw.get("model"),
            "raw": raw,
        }


class MockProvider:
    """Offline stand-in with a built-in first-position bias, to test the pipeline and metrics."""

    name = "mock"

    def __init__(self, model: str = "mock", first_bias: float = 0.6, noise: float = 0.3, seed: int = 0):
        self.model = model
        self.first_bias = first_bias
        self.noise = noise
        self.rng = random.Random(seed)
        self.gold_lookup: dict[str, str] = {}

    def decide(self, text: str, instructions: str, options: list[dict]) -> dict:
        gold = self.gold_lookup.get(text)
        logits = []
        for i, o in enumerate(options):
            z = self.rng.gauss(0, self.noise)
            if o["value"] == gold:
                z += 2.0
            if i == 0:
                z += self.first_bias
            logits.append(z)
        m = max(logits)
        exps = [math.exp(z - m) for z in logits]
        s = sum(exps)
        probs = {o["value"]: e / s for o, e in zip(options, exps)}
        choice = max(probs, key=probs.get)
        return {"choice": choice, "probabilities": probs, "confidence": probs[choice],
                "refused": False, "model": self.model, "raw": None}


def make_provider(name: str, args) -> object:
    if name == "jev":
        return JevProvider(args.jev_model)
    if name == "openai":
        return OpenAIDecisionsProvider(args.openai_model)
    if name == "mock":
        return MockProvider()
    raise SystemExit(f"Unknown provider: {name}")


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

def build_jobs(data: dict, strategy: str, n_random: int, repeats: int, seed: int) -> list[dict]:
    rng = random.Random(seed)
    jobs = []
    for item in data["items"]:
        q = data["questions"][item["question"]]
        n = len(q["options"])
        for oi, order in enumerate(orderings(n, strategy, n_random, rng)):
            jobs.append({"item": item["id"], "order": list(order), "order_idx": oi, "repeat": 0})
        for r in range(1, repeats):
            jobs.append({"item": item["id"], "order": list(range(n)), "order_idx": 0, "repeat": r})
    return jobs


def run(args) -> Path:
    load_env()
    data = load_dataset(args.dataset)
    items = {it["id"]: it for it in data["items"]}
    if args.limit:
        keep = [it["id"] for it in data["items"]][: args.limit]
        items = {k: items[k] for k in keep}
        data["items"] = [items[k] for k in keep]

    providers = [make_provider(p.strip(), args) for p in args.providers.split(",") if p.strip()]
    for p in providers:
        if isinstance(p, MockProvider):
            p.gold_lookup = {it["input"]: it["gold"] for it in data["items"]}

    jobs = build_jobs(data, args.orders, args.random_orders, args.repeats, args.seed)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    out_dir = Path(args.out) if args.out else RESULTS / f"{stamp}-{Path(data['_path']).stem}"
    out_dir.mkdir(parents=True, exist_ok=True)
    raw_path = out_dir / "raw.jsonl"

    total = len(jobs) * len(providers)
    print(f"Dataset: {data['_path']}  items: {len(items)}  calls: {total}  -> {out_dir}")

    def call(provider, job):
        item = items[job["item"]]
        q = data["questions"][item["question"]]
        opts = [q["options"][i] for i in job["order"]]
        t0 = time.perf_counter()
        try:
            res = provider.decide(item["input"], q["instructions"], opts)
            err = None
        except ProviderError as e:
            res, err = {"choice": None, "probabilities": {}, "confidence": None, "refused": False,
                        "model": None, "raw": None}, str(e)
        return {
            "provider": provider.name,
            "item": job["item"],
            "question": item["question"],
            "order": [q["options"][i]["value"] for i in job["order"]],
            "order_idx": job["order_idx"],
            "repeat": job["repeat"],
            "latency_ms": round((time.perf_counter() - t0) * 1000, 1),
            "error": err,
            **{k: v for k, v in res.items() if k != "raw" or args.keep_raw},
        }

    done = 0
    with raw_path.open("w", encoding="utf-8") as fh, ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        futures = [pool.submit(call, p, j) for p in providers for j in jobs]
        for fut in as_completed(futures):
            rec = fut.result()
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
            done += 1
            if done % 25 == 0 or done == total:
                print(f"  {done}/{total}", flush=True)

    (out_dir / "config.json").write_text(json.dumps({
        "dataset": data["_path"], "providers": args.providers, "orders": args.orders,
        "random_orders": args.random_orders, "repeats": args.repeats, "seed": args.seed,
        "jev_model": args.jev_model, "openai_model": args.openai_model, "started": stamp,
    }, indent=2), encoding="utf-8")
    report(out_dir, data)
    return out_dir


# ---------------------------------------------------------------------------
# Analysis
# ---------------------------------------------------------------------------

def _argmax(probs: dict) -> str | None:
    return max(probs, key=probs.get) if probs else None


def _tvd(a: dict, b: dict) -> float:
    keys = set(a) | set(b)
    return 0.5 * sum(abs(a.get(k, 0.0) - b.get(k, 0.0)) for k in keys)


def _mean(xs):
    xs = [x for x in xs if x is not None]
    return sum(xs) / len(xs) if xs else None


def _bootstrap_ci(per_item: dict, stat, n_boot: int = 2000, seed: int = 0):
    """95% CI by resampling items. per_item: item id -> list of values."""
    ids = list(per_item)
    if len(ids) < 2:
        return None
    rng = random.Random(seed)
    vals = []
    for _ in range(n_boot):
        sample = [rng.choice(ids) for _ in ids]
        pooled = [v for i in sample for v in per_item[i]]
        if pooled:
            vals.append(stat(pooled))
    vals.sort()
    return vals[int(0.025 * len(vals))], vals[int(0.975 * len(vals)) - 1]


def _ece(pairs: list[tuple[float, bool]], bins: int = 10) -> float | None:
    if not pairs:
        return None
    buckets = defaultdict(list)
    for conf, correct in pairs:
        buckets[min(int(conf * bins), bins - 1)].append((conf, correct))
    n = len(pairs)
    return sum(len(b) / n * abs(_mean([c for c, _ in b]) - _mean([1.0 if k else 0.0 for _, k in b]))
               for b in buckets.values())


def analyse(records: list[dict], data: dict) -> dict:
    items = {it["id"]: it for it in data["items"]}
    questions = data["questions"]
    by_provider = defaultdict(list)
    for r in records:
        if r["item"] in items:
            by_provider[r["provider"]].append(r)

    out = {}
    for prov, recs in by_provider.items():
        ok = [r for r in recs if not r["error"] and not r["refused"] and r["probabilities"]]
        errors = [r for r in recs if r["error"]]
        refusals = [r for r in recs if r["refused"]]

        # Schema sanity
        anomalies = defaultdict(int)
        for r in ok:
            opts = {o["value"] for o in questions[r["question"]]["options"]}
            if abs(sum(r["probabilities"].values()) - 1.0) > 0.02:
                anomalies["probabilities do not sum to 1"] += 1
            if set(r["probabilities"]) != opts:
                anomalies["probability keys differ from options"] += 1
            if r["choice"] != _argmax(r["probabilities"]):
                anomalies["choice is not the argmax"] += 1
            if r["choice"] not in opts:
                anomalies["choice outside options"] += 1

        per_item = defaultdict(list)
        for r in ok:
            per_item[r["item"]].append(r)

        def is_correct(item_id, label):
            it = items[item_id]
            return label == it["gold"]

        def is_acceptable(item_id, label):
            it = items[item_id]
            return label == it["gold"] or label in it.get("acceptable", [])

        acc_canon, acc_all, acc_marg, acc_accept = {}, defaultdict(list), {}, defaultdict(list)
        brier, logloss, goldp = defaultdict(list), defaultdict(list), defaultdict(list)
        conf_pairs, maxp_pairs = [], []
        flips, noise_flips = {}, {}
        order_tvd, noise_tvd, gold_range = {}, {}, {}
        position_effect = defaultdict(lambda: defaultdict(list))  # bucket -> item -> deltas
        first_wins = defaultdict(list)

        for item_id, rs in per_item.items():
            it = items[item_id]
            opts = [o["value"] for o in questions[it["question"]]["options"]]
            n = len(opts)
            primary = [r for r in rs if r["repeat"] == 0]
            repeats = [r for r in rs if r["order_idx"] == 0]
            canon = next((r for r in primary if r["order_idx"] == 0), None)

            if canon:
                acc_canon[item_id] = [1.0 if is_correct(item_id, canon["choice"]) else 0.0]
            for r in primary:
                c = is_correct(item_id, r["choice"])
                acc_all[item_id].append(1.0 if c else 0.0)
                acc_accept[item_id].append(1.0 if is_acceptable(item_id, r["choice"]) else 0.0)
                p = r["probabilities"]
                brier[item_id].append(sum((p.get(o, 0.0) - (1.0 if o == it["gold"] else 0.0)) ** 2 for o in opts))
                logloss[item_id].append(-math.log(max(p.get(it["gold"], 0.0), 1e-6)))
                goldp[item_id].append(p.get(it["gold"], 0.0))
                if r["confidence"] is not None:
                    conf_pairs.append((float(r["confidence"]), c))
                maxp_pairs.append((max(p.values()), c))
                first_wins[item_id].append(1.0 if r["choice"] == r["order"][0] else 0.0)

            # Order-marginalised distribution (mean over orders)
            if primary:
                mean_dist = {o: _mean([r["probabilities"].get(o, 0.0) for r in primary]) for o in opts}
                acc_marg[item_id] = [1.0 if is_correct(item_id, _argmax(mean_dist)) else 0.0]
                if len(primary) > 1:
                    flips[item_id] = [1.0 if len({r["choice"] for r in primary}) > 1 else 0.0]
                    order_tvd[item_id] = [_tvd(r["probabilities"], mean_dist) for r in primary]
                    gps = [r["probabilities"].get(it["gold"], 0.0) for r in primary]
                    gold_range[item_id] = [max(gps) - min(gps)]
                # Position effect: how much more probability an option gets at a
                # position than its own average across orders.
                for r in primary:
                    for pos, val in enumerate(r["order"]):
                        bucket = "first" if pos == 0 else "last" if pos == n - 1 else "middle"
                        position_effect[bucket][item_id].append(r["probabilities"].get(val, 0.0) - mean_dist[val])

            if len(repeats) > 1:
                noise_flips[item_id] = [1.0 if len({r["choice"] for r in repeats}) > 1 else 0.0]
                rep_mean = {o: _mean([r["probabilities"].get(o, 0.0) for r in repeats]) for o in opts}
                noise_tvd[item_id] = [_tvd(r["probabilities"], rep_mean) for r in repeats]

        def summ(per):
            flat = [v for vs in per.values() for v in vs]
            if not flat:
                return None
            ci = _bootstrap_ci(per, statistics.fmean)
            return {"mean": round(statistics.fmean(flat), 4), "ci95": [round(c, 4) for c in ci] if ci else None,
                    "n_items": len(per)}

        # Per-label precision / recall / F1 per question (all orders pooled)
        prf = {}
        for qid, q in questions.items():
            labels = [o["value"] for o in q["options"]]
            rows = [(items[r["item"]]["gold"], r["choice"]) for r in ok if r["question"] == qid and r["repeat"] == 0]
            if not rows:
                continue
            per_label = {}
            for lab in labels:
                tp = sum(1 for g, c in rows if g == lab and c == lab)
                fp = sum(1 for g, c in rows if g != lab and c == lab)
                fn = sum(1 for g, c in rows if g == lab and c != lab)
                support = sum(1 for g, _ in rows if g == lab)
                prec = tp / (tp + fp) if tp + fp else None
                rec = tp / (tp + fn) if tp + fn else None
                f1 = 2 * prec * rec / (prec + rec) if prec and rec else (0.0 if support else None)
                per_label[lab] = {"precision": prec, "recall": rec, "f1": f1, "support": support,
                                  "predicted": tp + fp}
            supported = [v for v in per_label.values() if v["support"]]
            prf[qid] = {
                "accuracy": round(_mean([1.0 if g == c else 0.0 for g, c in rows]), 4),
                "macro_precision": round(_mean([v["precision"] or 0.0 for v in supported]), 4) if supported else None,
                "macro_recall": round(_mean([v["recall"] or 0.0 for v in supported]), 4) if supported else None,
                "macro_f1": round(_mean([v["f1"] or 0.0 for v in supported]), 4) if supported else None,
                "per_label": per_label,
            }

        # Breakdown by difficulty
        by_diff = {}
        for diff in sorted({it.get("difficulty", "clear") for it in items.values()}):
            ids = [i for i in per_item if items[i].get("difficulty", "clear") == diff]
            by_diff[diff] = {
                "items": len(ids),
                "accuracy_all_orders": summ({i: acc_all[i] for i in ids if i in acc_all}),
                "flip_rate": summ({i: flips[i] for i in ids if i in flips}),
                "order_tvd": summ({i: order_tvd[i] for i in ids if i in order_tvd}),
            }

        expected_first = _mean([1 / len(questions[items[i]["question"]]["options"]) for i in first_wins])
        latencies = sorted(r["latency_ms"] for r in recs if not r["error"])
        out[prov] = {
            "calls": len(recs),
            "errors": len(errors),
            "refusals": len(refusals),
            "error_samples": [e["error"] for e in errors[:3]],
            "models_seen": sorted({r["model"] for r in ok if r.get("model")}),
            "schema_anomalies": dict(anomalies),
            "latency_ms": {"median": statistics.median(latencies) if latencies else None,
                           "p95": latencies[int(0.95 * (len(latencies) - 1))] if latencies else None},
            "accuracy": {
                "canonical_order": summ(acc_canon),
                "all_orders": summ(acc_all),
                "order_marginalised": summ(acc_marg),
                "acceptable_labels_all_orders": summ(acc_accept),
            },
            "probabilistic": {
                "gold_probability": summ(goldp),
                "brier": summ(brier),
                "log_loss": summ(logloss),
                "ece_confidence": round(_ece(conf_pairs), 4) if conf_pairs else None,
                "ece_max_probability": round(_ece(maxp_pairs), 4) if maxp_pairs else None,
                "mean_confidence": round(_mean([c for c, _ in conf_pairs]), 4) if conf_pairs else None,
            },
            "order_sensitivity": {
                "flip_rate": summ(flips),
                "noise_flip_rate": summ(noise_flips),
                "order_tvd": summ(order_tvd),
                "noise_tvd": summ(noise_tvd),
                "gold_probability_range": summ(gold_range),
                "first_option_win_rate": summ(first_wins),
                "first_option_expected_if_uniform": round(expected_first, 4) if expected_first else None,
                "position_effect": {b: summ(per) for b, per in position_effect.items()},
            },
            "by_question": prf,
            "by_difficulty": by_diff,
            "unstable_items": sorted(
                [{"item": i, "question": items[i]["question"], "gold": items[i]["gold"],
                  "answers": [{"order": r["order"], "choice": r["choice"],
                               "p_gold": round(r["probabilities"].get(items[i]["gold"], 0.0), 3)}
                              for r in per_item[i] if r["repeat"] == 0]}
                 for i, v in flips.items() if v[0] == 1.0],
                key=lambda x: x["item"]),
        }
    return out


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

def _fmt(s, pct=False, digits=3):
    if s is None:
        return "n/a"
    if isinstance(s, dict):
        m = s["mean"]
        ci = s.get("ci95")
        if pct:
            base = f"{m * 100:.1f}%"
            return base + (f" ({ci[0] * 100:.1f} to {ci[1] * 100:.1f})" if ci else "")
        base = f"{m:+.{digits}f}" if digits == 4 else f"{m:.{digits}f}"
        return base + (f" ({ci[0]:.{digits}f} to {ci[1]:.{digits}f})" if ci else "")
    return f"{s * 100:.1f}%" if pct else f"{s:.{digits}f}"


def render_markdown(summary: dict, data: dict, config: dict) -> str:
    provs = list(summary)
    L = []
    L.append(f"# Decision eval: {data.get('name', Path(data['_path']).stem)}")
    L.append("")
    L.append(data.get("description", ""))
    L.append("")
    L.append(f"Order strategy: `{config.get('orders')}`, repeats of canonical order: {config.get('repeats')}, "
             f"items: {len(data['items'])}. Ranges in brackets are 95% bootstrap intervals over items.")
    L.append("")

    def row(label, key_fn, **kw):
        return "| " + label + " | " + " | ".join(_fmt(key_fn(summary[p]), **kw) for p in provs) + " |"

    head = "| Metric | " + " | ".join(provs) + " |"
    sep = "|---|" + "---|" * len(provs)

    L += ["## Accuracy", "", head, sep,
          row("Accuracy, canonical order", lambda s: s["accuracy"]["canonical_order"], pct=True),
          row("Accuracy, all orders", lambda s: s["accuracy"]["all_orders"], pct=True),
          row("Accuracy, order-marginalised", lambda s: s["accuracy"]["order_marginalised"], pct=True),
          row("Accuracy incl. acceptable labels", lambda s: s["accuracy"]["acceptable_labels_all_orders"], pct=True),
          ""]
    L += ["## Precision and calibration", "", head, sep,
          row("Mean probability on gold label", lambda s: s["probabilistic"]["gold_probability"]),
          row("Brier score (lower is better)", lambda s: s["probabilistic"]["brier"]),
          row("Log loss (lower is better)", lambda s: s["probabilistic"]["log_loss"]),
          row("Mean reported confidence", lambda s: s["probabilistic"]["mean_confidence"]),
          row("ECE of confidence (lower is better)", lambda s: s["probabilistic"]["ece_confidence"]),
          row("ECE of top probability", lambda s: s["probabilistic"]["ece_max_probability"]),
          ""]
    L += ["### Macro F1 per question (all orders pooled)", "",
          "| Question | " + " | ".join(f"{p} acc / P / R / F1" for p in provs) + " |",
          "|---|" + "---|" * len(provs)]
    for qid in data["questions"]:
        cells = []
        for p in provs:
            q = summary[p]["by_question"].get(qid)
            cells.append("n/a" if not q else
                         f"{q['accuracy']:.2f} / {q['macro_precision']:.2f} / {q['macro_recall']:.2f} / {q['macro_f1']:.2f}")
        L.append(f"| {qid} | " + " | ".join(cells) + " |")
    L.append("")

    L += ["## Order sensitivity", "",
          "A flip means the top choice was not the same for every option order. "
          "The noise rows repeat the canonical order unchanged: order effects only count where they exceed noise. "
          "Position effect is the extra probability an option receives in that position, compared with its own "
          "average over all orders (0 means no position bias).", "",
          head, sep,
          row("Items whose answer flips with order", lambda s: s["order_sensitivity"]["flip_rate"], pct=True),
          row("Items whose answer flips on plain repeat", lambda s: s["order_sensitivity"]["noise_flip_rate"], pct=True),
          row("Mean distribution shift by order (TVD)", lambda s: s["order_sensitivity"]["order_tvd"]),
          row("Mean distribution shift on repeat (TVD)", lambda s: s["order_sensitivity"]["noise_tvd"]),
          row("Range of gold probability across orders", lambda s: s["order_sensitivity"]["gold_probability_range"]),
          row("First option chosen", lambda s: s["order_sensitivity"]["first_option_win_rate"], pct=True),
          row("First option, if position did not matter*", lambda s: s["order_sensitivity"]["first_option_expected_if_uniform"], pct=True),
          row("Position effect: first", lambda s: s["order_sensitivity"]["position_effect"].get("first"), digits=4),
          row("Position effect: middle", lambda s: s["order_sensitivity"]["position_effect"].get("middle"), digits=4),
          row("Position effect: last", lambda s: s["order_sensitivity"]["position_effect"].get("last"), digits=4),
          "",
          "*With cyclic shifts every option sits in the first slot once, so an unbiased model that always picks the "
          "gold label picks the first option exactly 1/n of the time.", ""]

    L += ["### By difficulty", "", "| Difficulty | " + " | ".join(f"{p} acc / flips / TVD" for p in provs) + " |",
          "|---|" + "---|" * len(provs)]
    diffs = sorted({d for p in provs for d in summary[p]["by_difficulty"]})
    for d in diffs:
        cells = []
        for p in provs:
            b = summary[p]["by_difficulty"].get(d)
            if not b:
                cells.append("n/a")
                continue
            a, f, t = b["accuracy_all_orders"], b["flip_rate"], b["order_tvd"]
            cells.append(f"{_fmt(a, pct=True).split(' ')[0]} / {_fmt(f, pct=True).split(' ')[0]} / {_fmt(t).split(' ')[0]}")
        L.append(f"| {d} ({summary[provs[0]]['by_difficulty'].get(d, {}).get('items', '?')} items) | " + " | ".join(cells) + " |")
    L.append("")

    L += ["## Items that flip with option order", ""]
    for p in provs:
        L.append(f"### {p}")
        L.append("")
        unstable = summary[p]["unstable_items"]
        if not unstable:
            L.append("None.")
        for u in unstable:
            L.append(f"- **{u['item']}** ({u['question']}, gold: `{u['gold']}`)")
            for a in u["answers"]:
                L.append(f"  - order {', '.join(a['order'])} -> `{a['choice']}` (p gold {a['p_gold']})")
        L.append("")

    L += ["## Health", "", head, sep]
    L.append("| Calls | " + " | ".join(str(summary[p]["calls"]) for p in provs) + " |")
    L.append("| Errors | " + " | ".join(str(summary[p]["errors"]) for p in provs) + " |")
    L.append("| Refusals | " + " | ".join(str(summary[p]["refusals"]) for p in provs) + " |")
    L.append("| Schema anomalies | " + " | ".join(
        ", ".join(f"{k}: {v}" for k, v in summary[p]["schema_anomalies"].items()) or "none" for p in provs) + " |")
    L.append("| Models reported | " + " | ".join(", ".join(summary[p]["models_seen"]) or "n/a" for p in provs) + " |")
    L.append("| Latency median / p95 (ms) | " + " | ".join(
        f"{summary[p]['latency_ms']['median']} / {summary[p]['latency_ms']['p95']}" for p in provs) + " |")
    for p in provs:
        if summary[p]["error_samples"]:
            L.append("")
            L.append(f"Sample errors for {p}: " + " / ".join(f"`{e[:200]}`" for e in summary[p]["error_samples"]))
    L.append("")
    return "\n".join(L)


def report(out_dir: Path, data: dict | None = None) -> None:
    out_dir = Path(out_dir)
    config = json.loads((out_dir / "config.json").read_text(encoding="utf-8")) if (out_dir / "config.json").exists() else {}
    if data is None:
        data = load_dataset(config.get("dataset") or "generic")
    records = [json.loads(l) for l in (out_dir / "raw.jsonl").read_text(encoding="utf-8").splitlines() if l.strip()]
    summary = analyse(records, data)
    (out_dir / "summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    md = render_markdown(summary, data, config)
    (out_dir / "report.md").write_text(md, encoding="utf-8")
    print(f"Report: {out_dir / 'report.md'}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("run", help="call the APIs and write raw.jsonl + report.md")
    r.add_argument("--dataset", default="generic", help="generic, chatbot, or a path to a dataset json")
    r.add_argument("--providers", default="jev,openai", help="comma list of: jev, openai, mock")
    r.add_argument("--orders", default="cyclic+reverse", choices=["cyclic", "reverse", "cyclic+reverse", "random"])
    r.add_argument("--random-orders", type=int, default=5, help="number of shuffles when --orders random")
    r.add_argument("--repeats", type=int, default=3, help="times the canonical order is asked (noise baseline)")
    r.add_argument("--seed", type=int, default=42)
    r.add_argument("--limit", type=int, default=0, help="only the first N items (smoke test)")
    r.add_argument("--concurrency", type=int, default=4)
    r.add_argument("--jev-model", default="jev-latest")
    r.add_argument("--openai-model", default="gpt-6-luna")
    r.add_argument("--keep-raw", action="store_true", help="store full API responses in raw.jsonl")
    r.add_argument("--out", help="output folder (default: results/<timestamp>-<dataset>)")

    rep = sub.add_parser("report", help="re-analyse an existing results folder")
    rep.add_argument("folder")

    args = ap.parse_args(argv)
    if args.cmd == "run":
        run(args)
    else:
        report(Path(args.folder))


if __name__ == "__main__":
    sys.exit(main())
