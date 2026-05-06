# Nightly enrichment log

Date-stamped log of the `nightly-inbox-enrichment` scheduled task. Newest entries at the bottom.

Each run appends one block. Format:

```
## YYYY-MM-DD
- enriched: slug-1, slug-2 (N total)
- skipped: slug-3 (reason), slug-4 (reason)
```

Reasons: `pdf-skipped`, `webfetch-failed`, `validation-failed`, `push-failed`, `no drafts`.

Maaike scans this in the morning before opening the dashboard.

---
