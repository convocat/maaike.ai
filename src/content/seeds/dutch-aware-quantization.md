---
title: Dutch-aware quantization
date: 2026-03-14
updated: 2026-03-15
maturity: draft
tags:
  - ai
  - knowledge-management
description: Standard quantization damages non-English languages disproportionately. A Dutch-first approach to model compression shows there's a better way.
draft: false
ai: co-created
---

Spotted on [LinkedIn](https://www.linkedin.com/posts/mbuisman_michielbuismangranite-40-micro-dutch-calibrated-gguf-activity-7437203711959035905-F5jK): Michiel Buisman quantized IBM Granite 4 micro dense using Dutch as the calibration language instead of English. The results are worth paying attention to.

## The problem

When you make an AI model smaller ("quantization") so it fits on a regular computer, you're deciding which parts of the model to simplify. Standard quantization tools use English text as the reference for what to keep and what to compress. That means non-English languages take the biggest quality hit, because the process doesn't know what matters for Dutch, German, or any other language.

## The approach

Two steps:

1. **Dutch calibration data**: used the Leesplank corpus (5.4 million Dutch texts, clustered by complexity level) as the reference for quantization. This way the process knows which model components matter most for Dutch
2. **Vulnerability mapping**: Unsloth AI had already computed which specific model components are most fragile during quantization. That data was buried in their published files. Combining it with the Dutch reference produced a quantization that protects both the model's general capabilities and its Dutch performance

The claim: this combination (language-specific calibration + component-level vulnerability data) hasn't been done before.

## Why this matters for the garden

The [[knowledge-graph-for-the-garden|knowledge graph project]] uses embedding models that run locally via Ollama. Those models are quantized too. If standard quantization hurts non-English languages, our Dutch content may be getting worse embeddings than our English content, and we wouldn't know without testing.

The Leesplank corpus itself could be useful for evaluating Dutch embedding quality: it has semantic clusters and complexity layers that make it more than just a pile of text.

## The bigger picture

If we want AI to work well in Dutch, on local hardware, without cloud APIs, then the quantization step is where quality gets silently lost. This work suggests there's a systematic way to prevent that loss, and the method is transferable to other models.

## Links

- [LinkedIn post by Michiel Buisman](https://www.linkedin.com/posts/mbuisman_michielbuismangranite-40-micro-dutch-calibrated-gguf-activity-7437203711959035905-F5jK)
- [Leesplank corpus on Hugging Face](https://huggingface.co/datasets/MichielBuisman/Leesplank-vloeiend-nl-curriculum-cp2)
- [Dutch-calibrated Granite 4 model on Hugging Face](https://huggingface.co/MichielBuisman/granite-4.0-micro-dutch-calibrated-gguf)

## Related

- [[setting-up-local-embedding-models|Setting up local embedding models]]
