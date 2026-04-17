# PRD — EDM Signal Reporting Dashboard

**Owner:** Adil Malik (Autometa) · **Client:** Steve, EDM Media · **Status:** Draft v0.1 · **Date:** 2026-04-17

**Companion docs in this folder:**
- [`requirements.md`](./requirements.md) — raw scope extracted from client
- [`conversation.md`](./conversation.md) — source chat log
- [`documents/EDM Signal Report System.docx`](./documents/EDM%20Signal%20Report%20System.docx) — authoritative visual spec
- [`documents/EDM Client Report - NXPL.pdf`](./documents/EDM%20Client%20Report%20-%20NXPL.pdf) — filled-in content reference
- [`documents/EDM Signal Deck.docx`](./documents/EDM%20Signal%20Deck.docx) — sales deck (side-deliverable, §13)

---

## 1. Overview

EDM Signal runs post-press-release amplification campaigns for microcap public companies. After each campaign, Steve needs to show the client **what was done, how it performed, and why it moved the needle** — in a format premium enough to justify the $7.5K–$15K+ campaign price and drive retention onto the $30K/mo retainer.

Today Steve hand-builds each report in Canva from scratch. That doesn't scale and slows down sales (the report is also a de-facto upsell artefact).

**The Reporting Dashboard** is a web application where Steve enters campaign data via a form and the system generates a branded, client-facing report with a shareable link and PDF export.

---

## 2. Goals

1. **Reduce per-report time** from ~hours to **under 15 minutes** (form-fill only).
2. **Enforce brand consistency** — every report matches the EDM Signal visual system (no Canva drift).
3. **Client-facing polish** — the link must look institutional (justifies pricing; compares favourably to a Bloomberg-style tearsheet).
4. **Repeatable per campaign** — duplicate prior report for the same client as a starting point.
5. **PDF-exportable** — a client must be able to email the report internally.

## Non-goals (v1)

- ❌ Auto-scraping Brand24, social platforms, or any external source.
- ❌ Generating content (post copy, script) inside the dashboard.
- ❌ Letting clients edit or comment on reports.
- ❌ A sales CRM, pipeline tracker, invoicing, or any commercial workflow.
- ❌ Replacing the sales deck or merging with it.
- ❌ Multi-tenant SaaS for other agencies — this is Steve's internal tool.

## 3. Success metrics

| Metric | Target (4 weeks post-launch) |
|---|---|
| Time to generate a new report | < 15 min from login to shareable link |
| Reports generated per week | ≥ 3 (signals real usage) |
| Steve's NPS on the tool | ≥ 9 / 10 (informal check) |
| Reports shared with clients | ≥ 80% of campaigns (vs. ad-hoc Canva) |
| Zero brand-consistency bugs reported | No per-report visual regressions |

---

## 4. Target users & personas

### Primary — Steve (operator)
- Runs EDM Media from Dallas, TX. Not technical ("office out of a shed, trying to look like Trump's office").
- Workflow: closes client → runs campaign → pulls data from Brand24 + his own tracking → **writes the report**.
- Pain: doing the same Canva work repeatedly, inconsistently.
- Mac user, casual with cloud tools (ChatGPT, Canva, Google Sheets). Email-centric.

### Secondary — Steve's associates (future, not v1)
- Sales guys who may help prep reports if volume grows. V1 is single-user; design the data model so multi-user is trivial later.

### Tertiary — EDM's clients (report viewers)
- Microcap company IR / marketing contacts. Receive a link, view on mobile or desktop. No login. Read-only. May save/print the PDF.

---

## 5. User stories

**Steve (operator):**
1. *As Steve, I can log in and see all reports I've created, grouped by client.*
2. *As Steve, I can start a new report by picking a client (or creating one) and a campaign name.*
3. *As Steve, I can fill in campaign metrics through a structured form — KPIs, per-platform reach, Signal Score before/after, 4-axis breakdown, asset counts.*
4. *As Steve, I can upload screenshots of top-performing posts and tag them with platform + engagement numbers.*
5. *As Steve, I can toggle optional sections (PPC, Influencer) off when a campaign didn't use them.*
6. *As Steve, I can preview the report as the client will see it before I share.*
7. *As Steve, I can publish the report and get a shareable URL + download a PDF.*
8. *As Steve, I can duplicate a previous report for the same client as a starting point for the next campaign.*
9. *As Steve, I can unpublish or update a report after sharing (link stays same; content updates).*

**Client (viewer):**
10. *As a client, I can open the link on desktop or mobile and view a full-screen, slide-deck-style report with no login.*
11. *As a client, I can navigate section-by-section with keyboard arrows or scroll.*
12. *As a client, I can download the report as a PDF if I want to circulate internally.*

---

## 6. Detailed product requirements

### 6.1 Authentication & access

- **v1:** Email + password for Steve only (single operator account). Consider magic-link for simpler UX.
- **Client view:** anonymous, URL-gated. Each published report has a **unguessable slug** (`/r/<nanoid>`). No login required.
- **Optional in v1.1:** expiring links (e.g. 90 days), optional password per report.

### 6.2 Entities & data model (minimum)

```
User           { id, email, password_hash, created_at }

Client         { id, user_id, company_name, ticker, contact_email, created_at }

Report         { id, client_id, campaign_name, campaign_start, campaign_end,
                 status: draft | published, slug, created_at, updated_at }

ReportData     { report_id, payload JSONB }   -- see §6.4 below

Asset          { id, report_id, kind: screenshot|logo, file_url,
                 platform, engagement_count, caption, position, created_at }
```

`ReportData.payload` is a structured JSON blob matching the slide template sections. This keeps schema migrations cheap while the template evolves.

### 6.3 Report creation flow

```
Dashboard
  └── [+ New Report] ──> Select client (or "+ Add client") ──> Campaign meta form
                                                                    │
          Tabbed form: 1. Summary · 2. Signal Score · 3. Content ·  │
                       4. Distribution · 5. Engagement · 6. Top Content ·
                       7. PPC (toggle) · 8. Influencer (toggle) · 9. Closer
                                                                    │
                                         [ Preview ] ◄──────────────┘
                                                │
                                [ Publish & Copy Link ]   [ Download PDF ]
```

- Form saves every field on blur (auto-save, draft status).
- Form is a **single long page with anchor navigation**, not a wizard — Steve can edit any section any time.
- Every input has a **"hint"** showing where to pull the number from (e.g. "Brand24 → Mentions tab → filter to campaign dates").

### 6.4 Field spec (maps 1:1 to slides in the System doc)

| Section | Fields |
|---|---|
| **Cover** | company_name, ticker, campaign_start, campaign_end, prepared_by (default: "EDM Media"), cover_logo (client logo upload, optional) |
| **Executive Summary** | total_reach (#), total_engagements (#), signal_score_before (0–100), signal_score_after (0–100), assets_deployed (#) |
| **Signal Score** | (derived from Exec Summary — just rendered larger) |
| **Signal Breakdown** | Four axes × Before/After: execution_before, execution_after, clarity_before, clarity_after, distribution_before, distribution_after, engagement_before, engagement_after (all 0–100) |
| **Content Deployment** | counts: x_threads, reddit_posts, videos, articles, emails, push_notifications |
| **Distribution Reach** | per-platform: x_reach, reddit_reach, discord_reach, telegram_reach, email_reach |
| **Engagement** | likes, comments, shares, clicks |
| **Top Content** | repeatable group (2–3): screenshot upload, platform (enum), engagement_count, why_it_worked (short text) |
| **PPC** *(toggle)* | impressions, ctr (%), cpc ($), video_views |
| **Influencer** *(toggle)* | influencers_activated, influencer_reach, influencer_engagement |
| **Market Impact** | qualitative_bullets (array of short text — pre-filled with the 3 defaults from the System doc, editable) |
| **Next Steps** | recommended_cta_text (default: "Recommended: Monthly Engagement ($25K)"), bullets (default 3, editable) |

### 6.5 Rendering — the template

- **One template**, implemented as a React component tree that reads `ReportData.payload` + `Assets`.
- Enforces brand kit from [Report System doc §1](./documents/EDM%20Signal%20Report%20System.docx):
  - Background `#0B0F14`, primary `#00E5FF`, accent `#7B61FF`, positive `#00FF9D`, negative `#FF4D4D`, text `#FFFFFF` / `#A0AEC0`.
  - Fonts: Montserrat (headers/subheaders), Inter (body). Load via Google Fonts.
  - Logo top-left (90% opacity), "EDM Signal Report" footer bottom-right.
- 1920×1080 slide-deck layout, responsive: keyboard arrows navigate, swipe on mobile, scrollable on small viewports.
- **Conditional sections** — PPC and Influencer render only when their toggle is on and data is present.
- Subtle animations on load (fade-in). No heavy motion; the System doc calls out "clean, not cluttered".

### 6.6 PDF export

- Server-side render via headless Chrome (Playwright or Puppeteer) to identical visual output.
- Filename: `EDM_Signal_Report_{ticker}_{campaign_start}.pdf`.
- Generated on demand; cache the last-generated PDF per report until underlying data changes.

### 6.7 Shareable link

- `/r/<slug>` — public, read-only. Renders the template full-screen with navigation controls.
- `<slug>` is a 10-char nanoid; not sequential, not guessable.
- Published reports render at slug; unpublished return 404.
- Include a small "Download PDF" button and "Next" / "Prev" slide nav.
- NO "Built with X" or dashboard branding visible — this is Steve's client-facing output.

### 6.8 Duplicate a report

- From the reports list, "Duplicate" clones `ReportData.payload` and `Assets` (file references, not the files themselves — same screenshots initially), creates a new draft with a blank `campaign_name`.

### 6.9 Assets & file storage

- Accept PNG / JPG up to 5 MB per image.
- Store on S3 (or a local `/uploads` dir with disk-persistence for v1 — cheaper, fine for single-user).
- Generate an optimised display variant (max 2048px wide) for the web view.

---

## 7. UX flows (detail)

### 7.1 First-time setup
1. Steve signs up → email confirm → inside.
2. Empty dashboard with CTA: "Add your first client".
3. After adding 1 client → CTA: "Create your first report".

### 7.2 Create a new campaign report
1. `+ New Report` → select client → enter campaign name + date range → auto-save draft.
2. Land on the **Summary** tab (KPIs). Fill in 4 numbers; see live preview on right panel.
3. Step through tabs / scroll — every save is draft.
4. Hit **Preview** — opens the client-view in a new tab with a "DRAFT" watermark.
5. Hit **Publish** — slug is generated, URL copied to clipboard, watermark gone.
6. Download PDF if needed.

### 7.3 Edit after publishing
- The published slug serves whatever's current. Steve can keep editing; the client's link will update (no versioning in v1).
- If Steve wants the old version preserved, he duplicates before editing.

---

## 8. Technical recommendation

> Opinionated default. Adjust if the team has stronger preferences.

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router)** + TypeScript | SSR for the public report pages (fast loads for clients), same stack for admin UI. |
| DB | **Postgres** (Supabase or Neon) | Structured entities + JSONB for `ReportData.payload`. Free tier plenty for v1. |
| Auth | **Supabase Auth** (magic link) | Skip password UX. |
| Storage | **Supabase Storage** or **S3** | Screenshots + logos. |
| PDF | **Playwright** (Node) via `/api/render-pdf` route | Same template → same output. |
| Hosting | **Vercel** | Trivial CI/CD for Next.js; edge for public pages. |
| Styling | **Tailwind** with a `tailwind.config.js` locking the EDM palette + font stack | Enforces brand kit at build time. |

Estimated effort at $35/hr — aligned with Steve's 2–3 day working / ~1 week polished timeline:
- Day 1–2: scaffolding, DB schema, auth, client/report CRUD, form shell (autosave).
- Day 3: template component (all sections), brand kit, image upload.
- Day 4: PDF export, shareable link, duplicate flow.
- Day 5–7: polish, animations, responsive, copy-paste NXPL example to validate end-to-end, Steve's feedback round.

---

## 9. Phased delivery

### Phase 1 — Working version (2–3 days)
- Auth (single user)
- Create/edit/publish report with all required sections filled via form
- Public link renders the template with brand kit
- Screenshot upload
- *Deferred:* PDF export, duplicate, polish

### Phase 2 — Polished v1 (~1 week total)
- PDF export
- Duplicate from prior report
- Preview mode with "DRAFT" watermark
- Animations, mobile responsiveness
- Copy polish (hints in form fields)

### Phase 3 — Post-v1 (NOT in this engagement; referenced from §12)
- Auto-filled reports via Google Sheets → Canva sync
- Microcap PR scraper + outbound email
- Video content creator
- Signal Score calculator (client-facing)
- Multi-user / team accounts

---

## 10. Open questions (resolve with Steve before building)

From [requirements.md §6](./requirements.md), still open:

1. **Signal Score scale** — Spec says 4 axes × 100 (total /100). NXPL PDF shows 8.9/10. Which is authoritative?
   > **Recommendation:** use the 4×100 / 100 total system (it's more defensible, matches the sales deck, and produces better visuals). Flag the NXPL example as needing regeneration.
2. **The backend-form spec** Steve emailed — we referenced but haven't opened it. Need to confirm the exact field list matches §6.4 above.
3. **Auth model** — single user or multi-operator? PRD assumes single; confirm.
4. **Expiring links / password-per-report** — needed in v1 or v1.1?
5. **Domain** — serve from `reports.edm.media` or Autometa domain? Affects email deliverability when clients click.
6. **PDF fidelity** — Steve OK with one PDF style (print-optimised) or must match web pixel-for-pixel?
7. **Expected client volume in year 1** — affects storage planning.

---

## 11. Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Steve iterates the visual design after seeing v1 | Slips timeline | Isolate brand tokens in one config file; swap quickly. |
| Signal Score ambiguity blocks the builder | Blocked day-1 | Get Steve's answer on Q1 before kick-off. Pick 4×100 default if silent. |
| Compliance on "Market Impact" claims | Legal risk for Steve's clients | Keep slide 11 strictly qualitative — no stock-price linkage. This is already the spec. |
| File storage costs spiral | Low for v1, moderate later | Cap upload size 5 MB. Auto-downscale to 2048px. |
| PDF renders differently from web | Client perceives inconsistency | Use same component tree + a `@media print` CSS override only for page breaks. Visual test before ship. |
| Single-user → multi-user migration painful | Rework | Include `user_id` on Client/Report from day one; just don't expose UI. |

---

## 12. Out of scope / future phases

Listed so no one builds them into v1 (Steve mentioned all of these):

- **Scraper + outbound email** — crawl microcap press releases, email their IR contacts pitching the program. (Steve 2026-04-15 21:52)
- **Video content creator** — paste script, avatar delivers "breaking news reporter" video. (Steve 2026-04-13 23:00)
- **Signal Score calculator** — client-facing scoring tool inside the dashboard.
- **Auto-filled reports** — Brand24 / Google Sheets sync; Canva sync workflow.
- **Multi-operator workflow** — teams, roles, comments.

---

## 13. Companion deliverable — Sales Deck

**Not part of the dashboard product.** Built once, static output. See [`documents/EDM Signal Deck.docx`](./documents/EDM%20Signal%20Deck.docx) for full slide-by-slide.

### Scope
- Execute the deck in Canva exactly per the doc (20+ slides: pain → system → Signal Score™ → packages Starter $3.5K / Amplified $7.5K ⭐ / Dominance $15K+ → retainer → add-ons → closers).
- Design per brand kit (shared with dashboard).
- Deliverables: editable Canva master + exported PDF.

### Explicit constraint
Steve: *"That's a sales deck that I really don't want to change."* Do not add slides, remove slides, or re-order. Only execute.

---

## 14. Appendix — acceptance checklist (for handoff)

Build is "done" for Phase 2 when:

- [ ] Steve can log in, add a client, create a report, fill all §6.4 fields, publish, and share a link in < 15 minutes.
- [ ] The public report at `/r/<slug>` renders every required section in brand-kit colors and fonts.
- [ ] PPC and Influencer sections are hidden when toggled off.
- [ ] PDF export produces a visually equivalent output.
- [ ] Duplicate action copies data + asset references; new draft opens in form.
- [ ] No login / no EDM-dashboard branding is visible to client viewers.
- [ ] Works on latest Chrome, Safari, Firefox (desktop + mobile).
- [ ] Steve approves the NXPL report reproduced in the new system.
- [ ] PRD §10 open questions all resolved and reflected in code/config.
