# Setup

## Requirements

- Node.js 20.9 or newer (22 recommended)
- npm

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build   # runs validate-content first; the build fails if content is invalid
npm start
```

## Environment variables (all optional)

Copy `.env.example` to `.env.local` and set what you need.

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, robots | `VERCEL_PROJECT_PRODUCTION_URL` on Vercel, else `http://localhost:3000` |
| `NEXT_PUBLIC_COMPANY_URL` | Pytron Digital link in header/footer/About/Contact | `https://digital.pytron.io` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact email | `business@pytron.io` |
| `NEXT_PUBLIC_GA4_ID` | Loads Google Analytics 4 and sends app events | off |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` | `none`, `console`, `gtag`, `plausible` | `gtag` when GA4 ID is set, else `none` |
| `CONTENT_PROVIDER` | Data source | `local` |

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project → Import** the repository. Framework preset: **Next.js** (auto-detected).
3. Under **Environment Variables**, set `NEXT_PUBLIC_SITE_URL` to your final domain (e.g. `https://driveready.pytron.in`). You can skip this until you attach a custom domain.
4. Deploy. Every page is statically generated, so no server configuration is needed.
5. After attaching your domain, submit `https://your-domain/sitemap.xml` in Google Search Console.
6. **Link it from the Pytron Digital website:** in the Pytron Digital repo, open `content/links.ts` and paste this app's URL into `productLinks.driveReady.url`. The DriveReady card switches from *Coming Soon* to *Live* + *Try It Free →*.

CLI alternative:

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

## Fonts

Geist loads from Google Fonts at runtime with system-font fallbacks, so builds never depend on network access.

## Analytics

Events: `state_selected`, `practice_started`, `practice_completed`, `mock_test_started`, `mock_test_completed`, `question_answered`, `road_sign_practice`, `returning_user`.

- **Plausible:** add their `<script>` to `app/layout.tsx` and set `NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible`.
- **GA4:** just set `NEXT_PUBLIC_GA4_ID` (e.g. `G-XXXXXXXXXX`). The script loads automatically and `/privacy` names GA4.
