# DriveReady — DMV Permit Practice by Pytron Digital

**DriveReady** is a state-by-state DMV knowledge-test practice platform built by [Pytron Digital](https://digital.pytron.io). Users pick their state, practice with instant explanations, take mock tests in the state's official format, and review their mistakes. Every question links to the official handbook section it came from.

> Independent educational platform — not affiliated with or endorsed by any DMV or government agency.

## What's in this build

| Area | Status |
|---|---|
| Frontend (Next.js 16, App Router, static generation) | Done |
| Question engine: random, topic, difficulty, unseen, incorrect, topic-balanced, section rules | Done |
| 9 practice modes + state-configured mock tests | Done |
| Results: score ring, pass/needs-practice, topic bars, weak topics, mistake review | Done |
| Repository abstraction (`LocalContentProvider`, ready for Supabase) | Done |
| Content validator (fails the build on bad content) | Done |
| SEO: per-state metadata, sitemap, robots, BreadcrumbList / FAQPage / WebSite JSON-LD | Done |
| PWA: manifest, icons, service worker | Done |
| Analytics hooks (provider-agnostic, off by default) | Done |
| Backend, Supabase, accounts, payments, ads | Intentionally not built |

## Content status (verified 2026-10-04)

All 50 states appear in the directory. Status is computed automatically from `/content`.

| Status | States | Meaning |
|---|---|---|
| **Available** | California (37), New York (44), Pennsylvania (67), Oregon (66), Wisconsin (57), Indiana (49), Washington (47), Michigan (23), Tennessee (14) — **404 questions** | Verified question bank, practice + mock tests live |
| **Test guide** | Florida | Official test format verified (50 Q, 40 to pass); question bank not yet verified |
| **Verification in progress** | TX, IL, OH, GA, NC, NJ, VA, AZ, MA, MD, MO | On the roadmap; agency link shown; no rules published yet |
| **Coming soon** | Remaining states | Not started |

Official formats used by the mock tests: New York 20 Q / 14 to pass (+2 of 4 signs), Pennsylvania 18 / 15, Oregon 35 / 28, Washington 40 / 32, Indiana 80% per section, California and Wisconsin per their files. Michigan and Tennessee use a clearly labeled 80% readiness target until their official rules are verified.

**Why some big states aren't live yet:** several official sites (e.g. Texas DPS, Illinois SOS, the Florida handbook PDF) block automated reading, so their handbooks could not be verified during this build. Per the "no fake data" rule, they are not filled with unverified content. Follow [ADDING-A-STATE.md](ADDING-A-STATE.md) to add them after reading the handbook yourself.

## Quick start

```bash
npm install
npm run dev               # http://localhost:3000
npm run validate-content  # check all content
npm run build && npm start
```

No environment variables are required. See [SETUP.md](SETUP.md).

## Docs

- [SETUP.md](SETUP.md) — local setup and Vercel deployment
- [CONTENT.md](CONTENT.md) — content model, engine, Supabase migration path
- [ADDING-A-STATE.md](ADDING-A-STATE.md) — step-by-step for a new state
- [SOURCE-VERIFICATION.md](SOURCE-VERIFICATION.md) — the verification standard
- [SEO.md](SEO.md) — routes, metadata, sitemap, structured data

## Project structure

```
app/                     Routes (App Router)
  dmv/[state]/           State hub + practice-test, mock-test, road-signs
  sitemap.ts robots.ts manifest.ts
components/              UI (quiz/ holds the client-side test experience)
content/
  roster.json            All 50 states + roadmap flags
  categories.json        Global topic taxonomy
  states/*.json          One file per verified state (source of truth)
lib/
  engine/                Question selection, scoring, practice modes (pure, framework-free)
  repositories/          Data-access interfaces + LocalContentProvider
  progress.ts            Browser progress store (localStorage)
  analytics.ts           Provider-agnostic event tracking
scripts/validate-content.mjs
```
