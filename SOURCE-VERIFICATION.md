# Source verification standard

## The rule

**No fact is published unless it was read in an official source.** If it can't be verified, the state shows "Coming soon" or the field stays `null`.

## Workflow

```
Official DMV / DOT / handbook source
  → read the handbook or official page
  → extract one specific, checkable fact
  → write an ORIGINAL practice question
  → verify the answer against the source text
  → record sourceTitle, sourceUrl, sourceSection, lastVerified
  → npm run validate-content
  → publish
```

Never: generate a question, then go looking for a source to justify it.

## What counts as a source

| Allowed as the source of truth | Not allowed |
|---|---|
| Official state driver handbook / manual | Third-party practice-test sites |
| Official DMV / DOT / DPS / BMV / MVA web pages | Blogs, forums, AI output |
| Official sample tests (reference only) | "Generic US rules" applied to a state |

Third-party sites may be used for market research only.

## Writing rules

- Questions are **original wording**. Do not reproduce official test questions or long passages from handbooks.
- Explanations **paraphrase** the source.
- `sourceSection` must be a real heading in the source. Never invent section names.
- Never say "Official DMV question". Practice items are labeled "Practice question based on the official driver handbook."
- Use `OFFICIAL_REFERENCE` only for material genuinely from an official source that you are permitted to show; it requires an `officialUsageNote`.

## Automated checks (`scripts/validate-content.mjs`)

Errors (build fails):

- Missing required field on any question
- Duplicate question IDs (across all states) or duplicate question text
- `correctAnswer` not exactly one of `options`; duplicate options
- Invalid category, difficulty, status or content type
- Source URL not `https`, or not on the state's declared `.gov` domains
- `lastVerified` not a date, or in the future
- State not in roster; slug or name mismatch
- Missing official `agency` or `handbook` resource
- Test rules without an official source; inconsistent passing rules

Warnings: `lastVerified` older than 365 days — re-verify.

## Re-verification

Handbooks change. At least yearly, and whenever an agency publishes a new edition:

1. Re-open each `sourceUrl`.
2. Confirm the fact still holds; update the question or set `status: "retired"`.
3. Update `lastVerified` and the state's `lastReviewed`.

## Verification log for this release (2026-10-04)

| State | Sources read |
|---|---|
| California | DMV Handbook Section 7 and Section 7 (Continued) online; Learner's Permits page |
| New York | Driver's Manual Chapters 1, 4 and 8 (online) |
| Wisconsin | Motorists' Handbook BDS126 (2026 PDF, full text) |
| Tennessee | Comprehensive Driver License Manual PDF, Section A (manual states information current as of July 1, 2022) |
| Florida | FLHSMV Class E Knowledge Exam page (test format only) |

Known gaps:

- California's official question count is not stated on the verified pages, so the CA mock uses a practice length scored at the stated 80%.
- Tennessee's official question count and passing score were not verified; the TN mock uses a labeled readiness target.
- Texas, Illinois and the Florida handbook PDF could not be read by automated tools during this build and need manual verification.
