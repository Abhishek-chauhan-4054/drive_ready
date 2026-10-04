# SEO

## Routes

| Route | Generated for | Indexed |
|---|---|---|
| `/` | — | yes |
| `/dmv` | — | yes |
| `/dmv/[state]` | all 50 states | yes for available and test-guide states; **noindex** for in-verification and coming-soon |
| `/dmv/[state]/practice-test` | available states | yes |
| `/dmv/[state]/mock-test` | available states with mock presets | yes |
| `/dmv/[state]/road-signs` | available states with ≥ 5 sign/signal questions | yes |
| `/about`, `/contact`, `/disclaimer`, `/privacy`, `/terms` | — | yes |

`/permit-test` and `/driving-test` sub-routes are intentionally **not** created yet: they would duplicate the state hub without new verified content. Add them once there is distinct, useful material (e.g. a verified road-test guide).

## Metadata

Every page uses `pageMetadata()` in `lib/seo.ts`: unique title, description, canonical URL, Open Graph and Twitter tags.

State hub title pattern: `California DMV Practice Test — Free California Permit Test`.

## Sitemap and robots

- `app/sitemap.ts` lists only published, useful pages (available + test-guide states and their sub-pages). Coming-soon pages are excluded.
- `app/robots.ts` allows everything and points to the sitemap.
- Set `NEXT_PUBLIC_SITE_URL` in production so URLs use your domain.

## Structured data

- `WebSite` — every page (root layout)
- `BreadcrumbList` — directory, state hubs, practice/mock/road-sign pages
- `FAQPage` — homepage and state hubs, only from real FAQ content

No review, rating or aggregate-rating schema is used.

## Internal linking

- Directory page has crawlable plain links to every live state.
- Footer links every live state.
- State hubs link to practice, mock, road-signs and back to the directory.
- Coming-soon pages link to available states.

## Launch checklist

1. Deploy, set `NEXT_PUBLIC_SITE_URL`.
2. Verify the domain in Google Search Console and Bing Webmaster Tools.
3. Submit `/sitemap.xml`.
4. Use URL Inspection on the state hubs to request indexing.
5. Each time a state goes live, its URLs enter the sitemap automatically — resubmit or let crawlers pick it up.
