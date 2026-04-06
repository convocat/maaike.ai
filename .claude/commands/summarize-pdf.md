# /summarize-pdf

Extract and return the key concepts and principles from a PDF. Precision over conciseness. No opinions, no editorial framing, no evaluation of the content.

## Input

A path to a PDF file, e.g.:
`/summarize-pdf public/pdfs/Clark__HH___Brennan__SE__Grounding_in_communic_260406_113953.pdf`

## Steps

### Step 1: Extract text

Run the following Python to extract the full text:

```python
from pypdf import PdfReader

reader = PdfReader("<path>")
for i, page in enumerate(reader.pages):
    print(f"=== PAGE {i+1} ===")
    print(page.extract_text())
```

If pypdf is not installed: `pip install pypdf`

Read the full output, including all pages.

### Step 2: Extract structured content

From the text, extract:

- **Core concepts**: named constructs, definitions, typologies, frameworks, models. Use the paper's own terms and definitions, not paraphrases.
- **Principles**: named or numbered rules or laws stated in the paper.
- **Classifications and taxonomies**: any numbered lists, enumerations, or tables of types.
- **Empirical claims**: findings stated as fact or backed by data or examples in the text.
- **Argument structure**: what the paper argues against (prior positions) and what it proposes instead, if applicable.

Do not include:
- Background motivation or framing not essential to the concepts themselves.
- Biographical or methodological details unless central to the argument.
- References to other works unless the paper defines a concept in relation to them.
- Opinions, assessments, or evaluations of the paper's quality or relevance.

### Step 3: Format the output

Output as structured Markdown with bold section headers matching the paper's own structure where possible. Use the paper's own terminology throughout.

For lists of types, constraints, costs, or states: enumerate them exactly as the paper does, with the paper's own labels.

### Step 4: Save to post body

Append the summary below the existing body content under a `## Summary` heading. Do not ask — always save to body.

### Step 5: Run auto-tag

After saving, run `/auto-tag` on the same file. Use topics as tags in addition to the standard tag suggestions.

## Conventions

- Sentence case for all headings
- Never use em-dashes
- No preamble ("This paper argues...", "The authors propose...")
- Start directly with the first concept
