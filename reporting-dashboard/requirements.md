# Requirements — EDM Signal: Sales Deck + Reporting Dashboard

**Client:** Steve, EDM Media (steve@edm.media)
**Agreed on:** 2026-04-15 call (see [conversation.md](./conversation.md))
**Target start:** 2026-04-16 morning
**Target delivery:** working cut 2–3 days, polished ~1 week
**Tech note from client:** asked *"Are you using Claude?"* — open to AI-assisted build

---

## 0. Reference documents

All in [`documents/`](./documents/):

| File | What it is | Status |
|---|---|---|
| [`EDM Signal Deck.docx`](./documents/EDM%20Signal%20Deck.docx) | Full slide-by-slide spec for the sales deck (20+ slides). **Source of truth for Deliverable A.** | ✅ |
| [`EDM Signal Report System.docx`](./documents/EDM%20Signal%20Report%20System.docx) | Plug-and-play Canva reporting system spec — brand kit, layout rules, 12 main + 2 bonus slides, team workflow. **Source of truth for Deliverable B.** | ✅ |
| [`EDM Client Report - NXPL.pdf`](./documents/EDM%20Client%20Report%20-%20NXPL.pdf) | Example of a **completed** client report (NextPlat Corp / $NXPL). Shows real content that goes into a report (Signal Score 8.9/10, actual X / StockTwits / LinkedIn / Reddit / TikTok posts). Use as a **content reference**, not a design reference — Steve himself called it "parts missing" and wanted something more professional. | ✅ |

---

## 1. Product context (what EDM Signal does)

EDM Signal is Steve's service for **microcap public companies**. Flow:

1. Client sends a press release / article / investor one-pager
2. EDM rewrites it for "algorithmic interpretation" (scores well with trading algos + retail investors)
3. Content is multiplied into 6+ formats (X thread, Reddit, LinkedIn, TikTok/IG, email, push) and distributed across investor ecosystems (Reddit, Discord, Telegram, StockTwits, etc.)
4. Paid (PPC) + influencer amplification optional
5. Results are measured by a proprietary **"Signal Score™"** — 4 axes: Execution / Clarity / Distribution / Engagement, each out of 100. Reported before → after.
6. Social data pulled via **Brand24**

Packages: **Starter $3,500 · Amplified $7,500 (primary) · Dominance $15,000+** per campaign. Monthly retainer $30,000.

---

## 2. Deliverables overview

Two **separate** artefacts — do not merge.

| | Deliverable A: Sales Deck | Deliverable B: Reporting Dashboard |
|---|---|---|
| **Purpose** | Close new clients | Report back to existing clients after each campaign |
| **Audience** | Sales guys → prospects | Existing paying clients |
| **Customization** | **None.** Standard, no per-client changes. Steve explicitly does NOT want this touched. | Per-client. Steve pastes data manually in a backend form; report is generated. |
| **Delivery format** | Canva presentation (PDF export-ready) | Web dashboard + exportable PDF + shareable link |
| **Client sees** | the finished deck | only the generated report (link) |
| **Who generates** | One-time build, static thereafter | Steve himself (backend form) |
| **Data source** | N/A | Manual paste from Brand24 + campaign stats |

> Steve's words (2026-04-15 21:47): *"The deck is standard. No need for any changes there. That's a sales deck that I really don't want to change."*
>
> Steve's words (2026-04-15 21:48): *"The dashboard I myself will grab the info and paste in to each category so the nice report gets made."*

---

## 3. Deliverable A — Sales Deck

**Spec:** [`documents/EDM Signal Deck.docx`](./documents/EDM%20Signal%20Deck.docx) (full slide-by-slide text + layout)

### Structure (20 slides)

| Slide | Purpose | Notes |
|---|---|---|
| 1 | Cover | Gradient BG + subtle stock-chart overlay |
| 2 | Pain — press releases fail | "Visibility ≠ Attention ≠ Action" |
| 3 | The real problem | 3 icon cols: Algo Blind / Wrong Distribution / No Amplification |
| 4 | The shift | "Markets no longer react to news. They react to structured signals." |
| 5 | Intro EDM Signal | Flow: PR → Signal → Distribution → Momentum |
| 6 | How it works | 3-step: Algo Opt → Distribution → Amplification |
| 7 | Algo engine (key slide) | Prioritize revenue/contracts/deployment; remove hype/fluff |
| 8 | Distribution power | Network map, channels + reach stats (10M+ Reddit, 150K+ X, 70K+ Discord/TG) |
| 9 | Content multiplication | "1 Signal → 6+ Assets → 10X Exposure" |
| 10 | Before vs After | Split screen red / green |
| — | **Signal Score™ set (4 slides)** | What is it / Breakdown (4 axes) / Before-After bars / Impact |
| — | Real-world application | PR → Audit → Rewrite → Distribution → Amplification |
| 11 | Why now (macro) | Retail momentum, rate cuts, AI trading, info speed |
| 12 | Packages | 3-col pricing table |
| 12A | Signal Starter — $3.5K | Entry card |
| 12B | Signal Amplified ⭐ — $7.5K | **Primary sell** — glow border |
| 12C | Signal Dominance — $15K+ | Premium |
| 12D | Comparison table | Feature matrix across tiers |
| 13 | Monthly retainer | $30K/mo Investor Engagement |
| 14 | PPC add-on | $5K–$25K+ |
| 15 | Influencer add-on | Stock influencers + Reddit + Discord mods |
| 16 | Recommended stack | **$22,500 anchor** (Amplified + $10K PPC + $5K Influencer) |
| 17 | Outcomes | Awareness / engagement / sentiment / visibility |
| 18 | Cost of inaction | "Silence is a strategy. Just not a winning one." |
| 19 | Next steps | Choose → Send PR → Launch in 48h |
| 20 | Close | CTA + `edm.media` |

### Design constraints
- Large typography, motion (Canva fade-ins / transitions), clean layout
- Highlight words: **Signal**, **Momentum**, **Execution**
- Must look "like Trump's office" per Steve (premium / institutional feel)

### Build notes
- Treat the doc as copy. Don't invent content.
- Canva is the implementation target — but we should also deliver a **duplicable master** Steve's team can clone.

---

## 4. Deliverable B — Reporting Dashboard

**Spec:** [`documents/EDM Signal Report System.docx`](./documents/EDM%20Signal%20Report%20System.docx)
**Filled example:** [`documents/EDM Client Report - NXPL.pdf`](./documents/EDM%20Client%20Report%20-%20NXPL.pdf)

### Purpose
Post-campaign reporting artefact Steve shares with clients (via link) showing what EDM did and what the campaign produced. Must look **institutional / premium**; justifies $7.5K–$15K+ pricing.

### Brand kit (lifted from the spec — apply consistently)

| | |
|---|---|
| Canvas | 1920 × 1080 (presentation) |
| Background | `#0B0F14` (dark base) |
| Primary | `#00E5FF` Signal Cyan |
| Accent | `#7B61FF` Electric Purple |
| Positive | `#00FF9D` |
| Negative | `#FF4D4D` |
| Text | `#FFFFFF` / `#A0AEC0` |
| Headers | Montserrat Bold |
| Subheaders | Montserrat SemiBold |
| Body | Inter Regular |
| Logo | Top-left (90% opacity, white) |
| Footer | Bottom-right: "EDM Signal Report" in `#A0AEC0` |

### Page / slide structure (12 main + 2 bonus)

| # | Page | Content |
|---|---|---|
| 1 | Cover | Company name + ticker + campaign dates + "Prepared by EDM Media"; gradient + chart overlay |
| 2 | Executive Summary | 4 KPI cards with glow: **Total Reach · Engagements · Signal Score (before→after) · Assets Deployed** |
| 3 | Signal Score™ | Two large score circles side-by-side: Before (red glow) vs After (green glow). Example from NXPL: 32/100 → 86/100 |
| 4 | Signal Breakdown | 4 horizontal progress bars (Canva progress-bar element): Execution / Clarity / Distribution / Engagement, each Before → After |
| 5 | Content Deployment | 2×3 grid of icons: X Threads · Reddit · Videos · Articles · Emails · Push Notifications. Bottom: Total Assets count |
| 6 | Distribution Reach | Bar chart by platform: X · Reddit · Discord · Telegram · Email |
| 7 | Engagement | Big glowing numbers: Likes · Comments · Shares · Clicks |
| 8 | Top Content | 2–3 cards, each: screenshot + platform + engagement # + 1-line "why it worked" |
| 9 | PPC Performance *(optional — only if campaign used PPC)* | Impressions · CTR · CPC · Video Views (bar or line chart) |
| 10 | Influencer Impact *(optional)* | Activated # · Reach · Engagement + qualitative line |
| 11 | Market Impact | **Qualitative only** — awareness / visibility / narrative positioning. (Compliance-sensitive — do NOT tie to stock price.) |
| 12 | Next Steps (closer) | Recommended cadence continuation + Monthly Engagement ($25K) CTA |
| **B1** | Attention Curve *(bonus)* | Spike→drop vs sustained growth viz |
| **B2** | Signal Gap *(bonus)* | Your Signal vs Competitors |

### Data-entry model (critical scope decision)

**Steve manually pastes values into a backend form.** No automated scraping in v1. Source data comes from:
- Brand24 (social KPIs)
- Campaign assets (screenshots, URLs)
- Steve's own numbers (reach, deployment counts)

The backend form should mirror the report structure 1:1 (cover meta + every KPI + asset slots + screenshots). See his email spec for the exact fields (Steve 2026-04-15 21:43: *"a form I sent you via email. It has all the stuff there. All the kpis"*).

### Functional requirements

1. **Create new report** — form flow, one report per client+campaign
2. **Template-driven render** — data is stored; slides are rendered from template
3. **Export PDF** (email-ready)
4. **Shareable link** (clients view, cannot edit)
5. **Duplicate** an existing report for the next campaign of the same client
6. **Multi-client** — Steve will add new clients; form lets him spin up reports per client
7. **Optional sections** — PPC, Influencer can be toggled off per campaign

### Non-goals (for v1)
- ❌ Auto-scraping of any source
- ❌ Content generation inside the dashboard
- ❌ Client-side editing
- ❌ Merging deck and dashboard into one product

---

## 5. Content reference: NXPL report

The [`EDM Client Report - NXPL.pdf`](./documents/EDM%20Client%20Report%20-%20NXPL.pdf) is a filled-in example for **NextPlat Corp ($NXPL)**, campaign date 2026-04-14. Useful signals for scoping the report content:

- **Signal Score**: 8.9/10 (note this is a different scale than the 4-axis 100-point system in the spec — ask Steve to unify)
- Fields actually present:
  - Company / Ticker / Date
  - Signal Score + Algo Sentiment Bias + Campaign Type
  - "Why this PR scores well" — 5–7 bullets
  - Core investor narrative (paragraph)
  - Actual published posts by channel: **X · StockTwits · LinkedIn · Reddit · Instagram/TikTok** (with URLs)
  - "What the next PR should ideally say" — advisory bullets

> ⚠️ The NXPL example does **not** yet match the Signal Report System spec. It's a simpler prose report. **Deliverable B follows the spec document** (visual KPI-dashboard style), not the NXPL PDF. Use NXPL only for the *content fields* a real campaign produces.

---

## 6. Open questions for Steve (ask before building)

1. **Signal Score scale** — spec says 4 axes × 100 (total /100). NXPL PDF shows a single 8.9/10. Which is authoritative?
2. **Backend form** — confirm the exact field list from his email (we have references but not the form itself yet).
3. **Tech stack** — web-based dashboard or Canva-sync workflow? Spec's "Next Level" section lists options (Google Sheets→Canva, Notion, web). He hasn't picked yet.
4. **Hosting / auth** — does Steve need logins for sales team, or single-user?
5. **Client-view link** — public URL or gated / expiring link?
6. **PDF export** — should match the web view pixel-for-pixel, or a print-optimised version?
7. **Number of concurrent clients** expected in year 1?

---

## 7. Future phases (post-v1, mentioned by Steve)

- **Auto-filled reports** — Google Sheets → Canva sync workflow (spec's "Next Level")
- **Signal Score calculator** — client-facing scoring tool
- **Microcap press-release scraper + outbound email** — lead-gen: scrape microcap PRs, email their contacts pitching the program (2026-04-15 21:52)
- **Video content creator** — paste script, avatar speaker delivers "breaking news reporter" video (2026-04-13 23:00, 2026-04-10 20:02)
- **Live web dashboard** version (spec's "Next Level")

---

## 8. Commercials

- Rate reference: **$35/hr vibe coding**
- Previous estimate given: max $1,400
- Agreed scope & timeline: working version 2–3 days, polished ~1 week
- Email for estimates / invoices: `steve@edm.media` (and client's `Adilmalik393@gmail.com` for inbound)
