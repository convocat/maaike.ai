# Truth and verification in the wiki Q&A

A short report on how this system distinguishes grounded answers from hallucinations, what was built to help, and what still isn't prevented.

---

## 1. The problem

When a user asks the wiki a question, the server retrieves articles from Maaike's garden and sends them to Claude, which synthesises an answer. The natural question is: **how do we know the answer is true?**

The honest answer used to be *we don't*. Three soft layers were all that stood between the user and hallucination:

1. **Retrieval** — hopefully pulled the right articles, so Claude had material to draw from.
2. **System prompt** — told Claude to stick to the sources and refuse if it didn't know.
3. **Source attribution** — listed the retrieved articles, not the ones the answer actually used.

Each layer can fail silently. Claude can invent content and cite any article; the UI doesn't know the difference. For Maaike's garden — where the whole point is "this is what Maaike says" — confabulation is the single worst failure mode.

---

## 2. What was built

Three additions. Two prevent or flag hallucination at runtime. One evaluates the whole system offline.

### Defense A — Refuse when retrieval is weak
**File:** `tools/karpathy-wiki/tools/serve.py`, `_build_ask_request`

Before Claude is even called, the server checks the retrieval result. If **zero topics matched**, **zero articles were retrieved**, and **zero themes hit any keywords**, the server returns a canned refusal without making an API call:

> "I don't have material on this in Maaike's garden. The knowledge graph didn't surface any relevant articles…"

This catches the worst hallucination mode: Claude free-styling on its training data when Maaike's corpus has nothing relevant. Cost: zero tokens, zero latency penalty. Visible in the dashboard as a green **"Defense A: retrieval refused"** banner above the evaluation panel.

The threshold is intentionally conservative — it only fires when the graph is completely empty. If *any* theme keyword matched, the LLM still gets called. This avoids over-refusal on plausible questions where retrieval is partial.

### Defense B — Verify claims after the answer
**Files:** `serve.py` (`/api/verify`, `handle_verify_api`), `eval.html` (verify button, render panel)

After an answer is produced, a second Claude call (the "judge") reads the original source articles and classifies every factual claim in the answer into one of three buckets:

| Bucket | Meaning | Dashboard colour |
|---|---|---|
| **verified** | Directly supported by source material, with a supporting quote | Green |
| **inferred** | Reasonable inference from sources, not explicit | Amber |
| **unverified** | No basis in the sources — possible hallucination | Red |

Output is structured JSON with an overall verdict: `grounded` (≥80 % verified), `mixed`, or `hallucinating`.

The dashboard shows a compact summary (counts per bucket + verdict badge) followed by every claim, colour-coded, with its supporting quote when available.

**This doesn't suppress the answer** — the user still sees everything — but it makes hallucination visible per-claim. Transparency over suppression.

### Phase 1 — LLM-as-judge evaluation
**File:** `eval.html` (Verify all button, Report aggregation)

Verification isn't only for individual answers. A **Verify all** button runs the judge across every question in the golden test set. The report view then aggregates:

- Verified claim rate across the corpus
- Unverified claim rate (the actual hallucination metric)
- Per-category breakdown (relevant / ambiguous / adversarial)
- Specific unverified claims, so failures are inspectable

This turns the 55-question test set from "vibes" into a real quality metric that drifts measurably when the system changes.

---

## 3. How the three work together

```
User question
      │
      ▼
┌─────────────────────────────────┐
│   Retrieval (graph + themes)    │
└──────────┬──────────────────────┘
           │
           ▼
   ┌───────────────┐  nothing matched  ┌──────────────────┐
   │   Defense A   │ ────────────────▶ │  Canned refusal  │
   │ check strength│                   │  (no LLM call)   │
   └───────┬───────┘                   └──────────────────┘
           │ retrieval OK
           ▼
┌─────────────────────────────────┐
│   Claude generates answer       │
│   streamed to user              │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│   Defense B — judge pass        │
│   classifies every claim        │
│   (verified/inferred/unverified)│
└──────────┬──────────────────────┘
           │
           ▼
User sees answer + per-claim grounding overlay
```

Offline: run Verify-all over the 55-question test set → aggregate metrics → track over time.

---

## 4. How to use it

### Everyday
1. `bash scripts/eval-dev.sh` — starts everything.
2. Open http://localhost:8782/eval.html.
3. Run a question. If Defense A kicks in, you'll see the green banner and no LLM cost.
4. Click **Verify claims** in the right panel. The Evaluation panel grows a claim-verification section.
5. Score by hand as before — the automated checks are a cross-reference, not a replacement.

### Baseline → improvement → regression
1. Run all 55 questions, score them, click **Verify all**.
2. Export JSON — this is your baseline.
3. Change something (prompt, triples, taxonomy).
4. Clear localStorage, re-run all 55, re-verify.
5. Compare unverified-claim rate between runs.
6. If regression — pin the specific question, inspect the claim list.

### Canonical commands
```bash
bash scripts/eval-dev.sh          # start
bash scripts/eval-dev.sh --stop   # stop
bash scripts/eval-dev.sh --check  # is it running?
bash scripts/eval-smoke-test.sh   # 7 checks, all should be green
```

---

## 5. What is still not prevented

These defenses help but don't close every gap. Worth naming explicitly:

- **Plausible-but-wrong paraphrase.** If Claude paraphrases Maaike accurately the judge will say "verified"; if it paraphrases in a way that subtly shifts meaning, the judge may miss it too. Both models have the same blind spots.
- **Missing-source confabulation.** If retrieval returns article A but the answer actually draws from Claude's training data about article B, the judge — seeing only A — might flag a claim as "unverified" even when it's factually correct elsewhere. This is a feature: we want groundedness in Maaike's garden, not general knowledge.
- **Meta-statements and tone.** "This is an important question" is not a factual claim; the judge classifies these as "inferred". That's mostly fine, but it means style drift (answers becoming generic-chatbot-y) isn't caught here — that's what the HITL rubric is for.
- **Strategic hallucination.** A determined adversary can craft prompts that induce the LLM to produce content that looks sourced but isn't. The adversarial test questions (45–55) exist partly to probe this.

Further steps, if those gaps matter more later:

- **Citation-per-claim at generation time.** Force Claude to inline `[cite: slug]` after each claim; verify in post-processing. Stricter, more invasive.
- **Strict mode toggle.** For high-stakes uses: buffer the answer, run the judge, and replace with "not confident" if unverified claims exceed a threshold. Costs latency and UX.
- **Dual-judge consensus.** Run verification twice with different prompts; disagreements get surfaced to the human for review.

None of those are needed today. They're on the shelf if the current defenses prove insufficient.

---

## 6. One-line summary

**The system cannot guarantee truth, but it can now make hallucination visible, measurable, and refusable when evidence is thin.**
