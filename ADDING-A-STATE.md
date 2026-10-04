# Adding a state

No UI changes are needed. A state appears automatically once its file exists and passes validation.

## 1. Find the official sources

Only these count as primary sources:

- The state's official driver handbook or manual (agency website or PDF)
- Official agency pages about the knowledge test, permits and licensing
- Official sample/practice tests (for reference — do not copy questions)

Write down each URL. All of them must be on the state's `.gov` domain(s).

## 2. Verify the test format

From the official source, record only what it actually states:

- Number of questions
- Number correct or percentage to pass
- Any section rules (e.g. a road-sign minimum or a separate signs test)
- Time limit (only if stated)

Anything not stated stays `null`.

## 3. Create the file

Copy an existing file as a template, e.g. `content/states/wisconsin.json`, to `content/states/<slug>.json`. The slug must match `content/roster.json`.

Set `stateCode`, `stateName`, `slug`, `agencyShortName`, `officialSource`, `officialDomains`, `lastReviewed`, `resources` (must include `agency` and `handbook`), `intro`, `testTypes`.

## 4. Write questions from the handbook

For each fact you read in the handbook:

1. Write an original question that tests exactly that fact.
2. Write the correct answer and 2–3 plausible wrong answers.
3. Write a short explanation paraphrasing the source.
4. Fill `sourceTitle`, `sourceUrl`, `sourceSection` (the real heading in the source), `lastVerified` (today), `status: "approved"`.
5. Add `"tags": ["road-sign"]` to questions about sign shapes, colors and meanings.

Use IDs like `tx-c-001`. Aim for at least 30–50 good questions before launch; 8 is the technical minimum.

Use `"status": "draft"` for anything not yet double-checked. Drafts are never served.

## 5. Add mock presets

Add a `mockPresets` entry that mirrors the official format. If your bank is smaller than the official count, the mock automatically uses what's available and scores at the official rate, telling the user so.

## 6. Add FAQ and common mistakes

Every answer must be backed by an official URL.

## 7. Validate

```bash
npm run validate-content
```

Fix every error. The build will refuse to run until the file is valid.

## 8. Check it locally

```bash
npm run dev
```

Open `/dmv/<slug>`, run a practice session and a mock test, and click several "View official source" links to confirm they open the right section.

## 9. Update the roster (optional)

If the state was `priority: true` with an `agency` entry, you can leave it — the state file takes over. Deploy, and the state page, practice pages and sitemap entries appear automatically.
