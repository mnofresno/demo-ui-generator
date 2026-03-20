---
name: demo-ui-generator
description: Generate local email-like demo UIs from JSON input with deterministic structural caching. Use this skill when you need a reusable demo inbox UI that reuses the same structure for identical ui_type, features, and style while injecting fresh runtime email data.
---

# Demo UI Generator

## Overview

Use this skill to generate a local, ready-to-run email-style demo UI from JSON input. The skill caches UI structure by normalized `ui_type`, `features`, and `style`, then injects runtime data into `data.json` so repeated requests with the same structure avoid regeneration.

## Workflow

1. Read the input JSON and normalize `ui_type`, `features`, and `style`.
2. Compute a deterministic cache key from structure only. Ignore dynamic email content.
3. Reuse `/cache/<ui_type>/<hash>/` when it exists; otherwise seed the cache from `templates/email-ui-base`.
4. Copy the selected template into `generated-project/`.
5. Write runtime data into `generated-project/data.json`.
6. Return the generated project path and cache status.

## Inputs

Expected JSON shape:

```json
{
  "ui_type": "email",
  "emails": [],
  "features": {},
  "style": "minimal"
}
```

## Output Contract

- `generated-project/` contains runnable app files plus `data.json`.
- The browser UI loads `data.json` dynamically.
- The page exposes `window.demoAPI` with:
  - `addEmail(email)`
  - `clearEmails()`
  - `setOTP(code)`
  - `reloadData()`

## Files To Use

- Main generator: `scripts/generate.js`
- Base structure template: `templates/email-ui-base/`
- Structural cache: `cache/email/<hash>/`
- Verification: `tests/run-self-test.js`

## Notes

- This skill is intentionally local-only and backend-free.
- The cache key is based on structure, not email content.
- If you need to change the structural HTML/CSS/JS for email UIs, update `templates/email-ui-base/` and let new hashes create new cache entries.
