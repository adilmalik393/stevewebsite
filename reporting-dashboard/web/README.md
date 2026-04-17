# EDM Signal — Reporting Dashboard

Web app for Steve (EDM Media) to generate branded post-campaign reports for microcap clients.

## Quick start

```bash
cd reporting-dashboard/web
npm install
```

### Environment

Create `.env` in `reporting-dashboard/web/`:

```env
BETTER_AUTH_SECRET=Gh0svP42WAymBeIXRPgrD6PnmwlhnHLKHjVHd8wS2dw=
BETTER_AUTH_URL=http://localhost:3000
# Optional: base URL Playwright uses to open `/r/{slug}?pdf=1` when generating PDFs (defaults to BETTER_AUTH_URL or http://127.0.0.1:3000)
# PDF_BASE_URL=http://localhost:3000
```

### Database setup (first time only)

```bash
echo "y" | npx @better-auth/cli migrate
```

This creates `data/app.db` with the auth tables (user, session, account, verification).
The app auto-creates client/report/asset tables on first run.

### Run

```bash
npm run dev
# → http://localhost:3000
```

## Test credentials

| Field    | Value              |
|----------|--------------------|
| Email    | `steve@edm.media`  |
| Password | `edmsignal2026`    |

To create this user (if starting from a fresh DB):

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Steve","email":"steve@edm.media","password":"edmsignal2026"}'
```

Or just use the `/register` page in the browser.

## Routes

| Route | Auth | Purpose |
|---|---|---|
| `/login` | public | Sign in |
| `/register` | public | Create account |
| `/dashboard` | protected | Client list + add client |
| `/dashboard/clients/[id]` | protected | Client detail — create/list/publish/duplicate/delete reports |
| `/dashboard/clients/[id]/reports/[reportId]` | protected | Report editor (all fields) |
| `/r/[slug]` | **public** | Branded 12-slide report for clients (no login, no dashboard branding) |
| `GET /api/reports/[slug]/pdf` | **public** | Server-generated PDF (Playwright) for **published** reports only — PRD §6.6 filename |

### Server PDF (PRD §14)

1. Install deps: `npm install` (includes `playwright`).
2. Install Chromium once: `npx playwright install chromium` (needs ~400MB free disk).
3. Run the app (`npm run dev` or `npm start`). PDF generation opens `PDF_BASE_URL` or `BETTER_AUTH_URL` + `/r/{slug}?pdf=1` in headless Chromium, then returns the PDF file.
4. **Production:** set `PDF_BASE_URL` to the public origin the server can reach (often same as the deployed site URL).

**Note:** Heavy serverless hosts (e.g. small Vercel functions) may hit size or time limits with Playwright. For production PDFs at scale, run this app on a **Node server / container** with enough RAM, or offload PDF generation to a dedicated worker.

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **Better Auth** (email + password, SQLite-backed)
- **SQLite** via better-sqlite3 (`data/app.db`)
- **Tailwind CSS** with EDM brand kit
- **Playwright** (headless Chromium) for `/api/reports/[slug]/pdf`
- **TypeScript**

## Key files

```
reporting-dashboard/
├── conversation.md          # WhatsApp chat log with Steve (Apr 8–15)
├── requirements.md          # Raw scope extracted from Steve
├── prd.md                   # Full PRD — personas, user stories, data model, tech rec
├── documents/               # Steve's reference assets
│   ├── EDM Signal Deck.docx
│   ├── EDM Signal Report System.docx
│   └── EDM Client Report - NXPL.pdf
└── web/                     # Next.js app
    ├── lib/
    │   ├── auth.ts          # Better Auth server config
    │   ├── auth-client.ts   # Better Auth client
    │   └── db.ts            # SQLite schema + all CRUD functions
    ├── app/
    │   ├── dashboard/       # Protected admin pages
    │   │   ├── actions.ts   # Server actions (client/report CRUD)
    │   │   └── clients/     # Client + report management
    │   └── r/[slug]/        # Public report viewer
    ├── proxy.ts             # Auth middleware (Next.js 16 convention)
    └── data/app.db          # SQLite DB (gitignored)
```

## Brand kit (from Steve's spec)

| Token | Value |
|---|---|
| Background | `#0B0F14` |
| Primary (Signal Cyan) | `#00E5FF` |
| Accent (Electric Purple) | `#7B61FF` |
| Positive | `#00FF9D` |
| Negative | `#FF4D4D` |
| Text | `#FFFFFF` / `#A0AEC0` |
| Headers font | Montserrat Bold |
| Body font | Inter Regular |

## Notes for developer

- Report form **auto-saves** on every edit (1.5s debounce). No manual save needed.
- **Publish** generates a unique slug and copies the public URL.
- **Duplicate** clones all report data for the next campaign.
- PPC and Influencer sections are toggleable — hidden from the public report when off.
- Market Impact slide is **qualitative only** — no stock-price claims (compliance).
- Next.js 16 uses `proxy.ts` instead of `middleware.ts` — don't rename it.
- Read `prd.md` for the full spec including open questions for Steve, phased delivery plan, and acceptance checklist.
