# Content model & engine

## Files

```
content/roster.json        50 states: code, name, slug, priority (first-20 roadmap), agency (optional)
content/categories.json    Global topics and their groups (signs / laws / safety)
content/states/<slug>.json One file per state with verified content
```

A state's status is **computed**, never hand-set:

| Condition | Status |
|---|---|
| State file exists, an `available` test type, ≥ 8 approved questions | `available` |
| State file exists, fewer questions or no available test type | `study-hub` (test guide) |
| No state file, `priority: true` in roster | `in-review` |
| No state file | `coming-soon` |

The threshold lives in `lib/site.ts` (`minQuestionsForPractice`).

## State file

```jsonc
{
  "stateCode": "NY",
  "stateName": "New York",           // must match roster
  "slug": "new-york",                // must match roster and file name
  "agencyShortName": "NY DMV",
  "officialSource": { "name": "...", "url": "https://dmv.ny.gov/" },
  "officialDomains": ["dmv.ny.gov"], // every URL in this file must be on one of these (.gov only)
  "lastReviewed": "2026-10-04",
  "resources": [ { "kind": "agency|handbook|sample-test|licensing", "title": "...", "url": "..." } ],
  "intro": "One or two verified sentences.",
  "testTypes": [ /* see below */ ],
  "categories": ["signs-signals", "licensing"],   // subset of content/categories.json
  "commonMistakes": [ { "text": "...", "sourceUrl": "...", "sourceSection": "..." } ],
  "faq": [ { "q": "...", "a": "...", "sourceUrl": "..." } ],
  "questions": [ /* see below */ ]
}
```

### Test types and mock presets

```jsonc
{
  "id": "class-d",
  "name": "Operator / Junior Operator (Class D / DJ)",
  "shortName": "Class D",
  "available": true,
  "description": "...",
  "testRules": {
    "officialQuestionCount": 20,      // null if not verified
    "officialPassingCorrect": 14,     // null if not verified
    "officialPassingPercent": null,   // null if not verified
    "timeLimitMinutes": null,         // only set if the source states a time limit
    "sectionRequirements": [ { "tag": "road-sign", "label": "Road sign questions", "questionCount": 4, "minCorrect": 2 } ],
    "notes": ["..."],
    "source": { "title": "...", "url": "...", "section": "..." }   // required
  },
  "mockPresets": [
    {
      "id": "knowledge", "label": "Full 20-question mock", "description": "...",
      "questionCount": 20, "passingCorrect": 14, "passingPercent": null,
      "isOfficialFormat": true,
      "sectionRequirements": [ ... ],   // optional
      "includeTags": ["road-sign"],     // optional — e.g. a separate signs test
      "excludeTags": ["road-sign"]      // optional
    }
  ]
}
```

Never fill a test-rule field you have not verified. Leave it `null`; the UI then says the rule isn't published and scores against a clearly labeled 80% **readiness target**.

### Question

```jsonc
{
  "id": "ny-d-018",                // unique across all states
  "state": "NY",
  "licenseType": "class-d",        // a test type id in this state
  "contentType": "PRACTICE",       // or OFFICIAL_REFERENCE (needs officialUsageNote)
  "category": "licensing",
  "difficulty": "easy",            // easy | medium | hard
  "question": "...",
  "options": ["...", "...", "...", "..."],
  "correctAnswer": "...",          // must exactly equal one option
  "explanation": "...",            // paraphrase of the source
  "sourceTitle": "New York State Driver's Manual",
  "sourceUrl": "https://dmv.ny.gov/...",
  "sourceSection": "Chapter 1: Driver Licenses — Vision and Knowledge Tests",
  "lastVerified": "2026-10-04",
  "status": "approved",            // approved | draft | retired — only approved is served
  "tags": ["road-sign"],           // optional; drives section rules and signs tests
  "lockOptionOrder": false         // optional; true keeps option order fixed
}
```

## The question engine (`lib/engine`)

Pure TypeScript, no framework or storage dependencies.

- `filterPool(pool, filter, history)` — by category, group, difficulty, tags, explicit ids, or history (`unseen`, `incorrect`, `answered`).
- `selectQuestions(pool, { count, balanceTopics, preferUnseen, sectionRequirements, rng })` — fills required sections first (e.g. NY's 4 sign questions), then fills the rest round-robin across topics, then shuffles.
- `prepareQuestion(q)` — shuffles answers unless order matters ("All of the above", or `lockOptionOrder`).
- `computeResult(questions, answers, rule)` — score, pass/fail against the official rule (scaled if the test is shorter than official), section checks, topic stats, weak topics.
- `PRACTICE_MODES` — every practice mode is a configuration of the same engine.
- `seededRng(seed)` — reproducible tests if needed.

## Migrating to Supabase later

The UI only calls `getContent()` from `lib/repositories`, which returns a `ContentProvider` (`states`, `questions`, `tests`).

1. Create tables mirroring the JSON shapes (`states`, `test_types`, `mock_presets`, `questions`, `resources`, `faq`). Import the JSON files as seed data.
2. Implement `SupabaseContentProvider` with the same interface in `lib/repositories/supabase.ts`.
3. Add a `"supabase"` case in `lib/repositories/index.ts` and set `CONTENT_PROVIDER=supabase`.
4. Keep `scripts/validate-content.mjs` as the gate for content entering the database (run it on exports, or port the rules to a DB check).

User progress (`lib/progress.ts`) uses the same shape a `user_progress` table would; syncing is a straight copy once accounts exist.
