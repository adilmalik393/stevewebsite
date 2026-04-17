# Sales Deck — Build spec (Tickets 1–7 applied)

**Deliverable:** EDM Signal sales deck (Canva + PDF). **Not** the reporting web app.

---

## Ticket 1 — Source lock

### Final source of truth

| Priority | Document | Role |
|----------|----------|------|
| **1 (authoritative)** | [`documents/EDM Signal Deck.docx`](./documents/EDM%20Signal%20Deck.docx) | Full slide-by-slide copy, layout intent, and sequencing. **This file wins** if anything else disagrees. |

### Cross-check (do not replace the doc — use these to verify nothing was missed)

| Reference | Section | Use for |
|-----------|---------|---------|
| [`requirements.md`](./requirements.md) | §3 Deliverable A — Sales Deck | Slide structure table (cover → close), design constraints, build notes |
| [`prd.md`](./prd.md) | §13 Companion deliverable — Sales Deck | Scope (20+ slides, pricing tiers), explicit Steve constraint |

### Locked rules (non-negotiable)

1. **Slide order** — Match `EDM Signal Deck.docx`. Do not re-order.
2. **Slide count / set** — Do not add or remove slides. Execute what the doc specifies (aligned with `requirements.md` §3 structure: 20+ slides including Signal Score™ block, packages, retainer, add-ons, closers).
3. **Copy** — Transcribe from the doc. **Do not invent** marketing copy, numbers, or package names.
4. **Steve constraint** (from `prd.md` §13): *"That's a sales deck that I really don't want to change."* — No “improvements” that change messaging or slide flow.

### Quick alignment checklist (before handoff)

- [ ] Every slide in the doc exists in Canva in the same order.
- [ ] Pricing matches **Ticket 4** below + `EDM Signal Deck.docx` (see also `requirements.md` §3).
- [ ] Highlight terms per `requirements.md` §3: **Signal**, **Momentum**, **Execution**.
- [ ] Close slide includes **edm.media** (per `requirements.md` §3).

---

## Ticket 2 — Brand setup (theme tokens)

Use the same institutional palette as the reporting product (`prd.md` / Report System: shared brand with dashboard).

### Color tokens

| Token | Hex | Usage |
|-------|-----|--------|
| **Background** | `#0B0F14` | Slide canvas / dark panels |
| **Primary (Signal Cyan)** | `#00E5FF` | Headlines, key CTAs, accents, glows |
| **Accent (Electric Purple)** | `#7B61FF` | Secondary emphasis, gradients with cyan |
| **Positive** | `#00FF9D` | Upside / “after” / win states |
| **Negative** | `#FF4D4D` | Pain / “before” / risk (where doc uses red/green split) |
| **Text primary** | `#FFFFFF` | Main body, titles on dark |
| **Text secondary** | `#A0AEC0` | Subcopy, captions, footer labels |

### Typography

| Role | Font | Weight |
|------|------|--------|
| **Headings / display** | Montserrat | Bold |
| **Subheadings** | Montserrat | SemiBold |
| **Body** | Inter | Regular (Medium sparingly for emphasis) |

Load via Google Fonts in Canva (or equivalent) so deck matches dashboard typography family.

### Style direction (premium institutional)

- **Clean, dark, high contrast** — not playful; “premium IR / capital markets” feel (`requirements.md`: large type, subtle motion, clean layout; Steve line: institutional / “Trump’s office” polish).
- **Motion:** Subtle fades / transitions only — no busy animations.
- **Layout:** Generous whitespace, aligned grids, consistent margins slide-to-slide.
- **Cover / hero slides:** Gradient or chart-overlay treatments **as described in** `EDM Signal Deck.docx` (do not invent a different visual system).

### Canva practical setup (recommended)

1. Create **Color styles** in Canva for each token above (name them: BG, Primary, Accent, etc.).
2. Set **Brand Kit** default text styles: Title → Montserrat Bold, Body → Inter Regular.
3. Build one **master page** with margins/footer zone, then duplicate for each slide from the doc.

---

## Ticket 3 — Full slide build (20+)

Build **every** slide from [`documents/EDM Signal Deck.docx`](./documents/EDM%20Signal%20Deck.docx) in order. Use this map as a **build checklist**; cross-check against [`requirements.md`](./requirements.md) §3 table so nothing is skipped.

| Build block | What to cover (from spec) |
|-------------|---------------------------|
| **Cover** | Slide 1 — gradient BG + subtle stock-chart overlay (`requirements.md` §3). |
| **Pain / problem** | Slides 2–3 — press releases fail; “Visibility ≠ Attention ≠ Action”; 3 columns Algo Blind / Wrong Distribution / No Amplification. |
| **Shift + EDM intro + how it works** | Slides 4–6 — markets react to structured signals; PR → Signal → Distribution → Momentum; 3-step Algo Opt → Distribution → Amplification. |
| **Algo engine + distribution + multiplication** | Slides 7–9 — algo engine (key slide); distribution power + reach stats; “1 Signal → 6+ Assets → 10X Exposure”. |
| **Before / After** | Slide 10 — split red / green. |
| **Signal Score™ (multi-slide)** | Four slides per §3 — what it is; 4-axis breakdown; before/after bars; impact. |
| **Real-world application** | One slide — PR → Audit → Rewrite → Distribution → Amplification. |
| **Why now** | Slide 11 — macro (retail momentum, rate cuts, AI trading, info speed). |
| **Packages** | Slides 12 + 12A–12D — 3-col table; Starter / Amplified ⭐ / Dominance cards; comparison matrix (**Ticket 4** for exact $). |
| **Retainer + add-ons** | Slides 13–15 — monthly retainer; PPC add-on; Influencer add-on (**Ticket 4** + doc for copy). |
| **Recommended stack** | Slide 16 — **$22,500** anchor (Amplified + $10K PPC + $5K Influencer) per `requirements.md` §3. |
| **Outcomes** | Slide 17 — awareness / engagement / sentiment / visibility. |
| **Cost of inaction** | Slide 18 — “Silence is a strategy. Just not a winning one.” |
| **Next steps** | Slide 19 — Choose → Send PR → Launch in 48h. |
| **Final close CTA** | Slide 20 — CTA + **edm.media**. |

### Ticket 3 — Done checklist

- [ ] All blocks above exist as slides in Canva, same order as `EDM Signal Deck.docx`.
- [ ] Signal Score™ block = **4 slides** (not collapsed into one).
- [ ] Packages section includes table + individual tier cards + comparison (12 / 12A–12D).
- [ ] No extra slides; no missing slides vs doc.

---

## Ticket 4 — Pricing accuracy (exact numbers)

Use these **exact** figures everywhere they appear (Canva text, charts, footnotes). If `EDM Signal Deck.docx` shows shorthand (e.g. `$3.5K`), the **numeric meaning** must match the table below. **Authoritative wording** for tier names and add-on **ranges** is still the doc + `requirements.md` §3.

### Core packages

| Tier | Display (exact) | Notes |
|------|-----------------|--------|
| **Signal Starter** | **$3,500** | Entry (`requirements.md`: $3.5K). |
| **Signal Amplified** | **$7,500** | **Primary offer** — star / glow / strongest visual emphasis (`requirements.md`: $7.5K ⭐). |
| **Signal Dominance** | **$15,000+** | Premium tier (`requirements.md`: $15K+). |

### Retainer

| Item | Display (exact) |
|------|-----------------|
| **Monthly Investor Engagement** | **$30,000/mo** (`requirements.md`: $30K/mo). |

### Add-ons (ranges per spec)

| Add-on | Range (exact per `requirements.md` §3) |
|--------|------------------------------------------|
| **PPC** | **$5,000–$25,000+** (spec: $5K–$25K+). |
| **Influencer** | No dollar range in `requirements.md` §3 — use **exact figures/copy from `EDM Signal Deck.docx`** on slide 15 (channels: stock influencers, Reddit, Discord mods per §3). |

### Recommended stack anchor

| Anchor | Value (exact per `requirements.md` §3) |
|--------|----------------------------------------|
| **Recommended stack** | **$22,500** (Amplified + **$10,000** PPC + **$5,000** Influencer). |

### Ticket 4 — Verification checklist

- [ ] Starter shows **$3,500** (not a different rounding).
- [ ] Amplified shows **$7,500** and is visually primary vs other tiers.
- [ ] Dominance shows **$15,000+** (plus sign retained if doc uses “+”).
- [ ] Retainer shows **$30,000/mo** (or doc’s exact formatting if identical value).
- [ ] PPC add-on range **$5,000–$25,000+** matches spec (not a different band).
- [ ] Recommended stack math matches **$22,500** composition per §3.
- [ ] Influencer pricing (if any $ in doc) matches **doc**, not invented.

---

## Ticket 5 — Visual QA

Goal: deck reads as **one product** — institutional, tight, no accidental “template soup.”

### Rules

- **Spacing & alignment** — Same outer margins every slide (use Ticket 2 master + guides). Align text blocks and icons to a consistent grid; avoid one-off nudges unless the doc demands it.
- **Typography hierarchy** — One clear title treatment (Montserrat Bold), one subhead treatment (Montserrat SemiBold), one body style (Inter). Title size steps down predictably on dense slides; no orphan headings.
- **Highlight keywords** — Per `requirements.md` §3, these must read clearly where the doc uses them: **Signal**, **Momentum**, **Execution** (color, weight, or scale — consistent treatment slide-to-slide).
- **No clutter** — If a slide feels busy, reduce decoration before shrinking type. One focal point per slide where possible.
- **Icon / illustration style** — Single family (line weight, fill vs outline, corner radius). No mixing flat cartoon icons with photoreal assets unless the doc explicitly pairs them.
- **Brand consistency** — Every slide uses **Ticket 2** tokens only (no random hex blues/greens). Charts, tables, and icons follow the same palette.

### Ticket 5 — Checklist

- [ ] Margins and column widths match across all slides.
- [ ] **Signal**, **Momentum**, **Execution** visible and styled consistently wherever they appear in the doc.
- [ ] Icon/illustration style unified; no stray clipart.
- [ ] Full pass: no slide breaks the dark + cyan/purple system.

---

## Ticket 6 — Motion / presentation polish

Goal: motion supports the **sales story** (pain → solution → proof → offer → close), not entertainment.

### Rules

- **Transitions** — Subtle only: fade, short dissolve, gentle push. Prefer **0.3–0.6s**; avoid bounce, spin, or long wipes.
- **Builds** — Stagger bullets only where it helps comprehension (e.g. problem → solution). Don’t animate every line on every slide.
- **Conversion flow** — Packages → retainer → stack → next steps should feel **forward-driving** (consistent left-to-right or top-to-bottom reading order; Amplified tier already visually primary per Ticket 4).
- **Restraint** — No auto-play loops, no sound, no particle effects. If in doubt, **static**.

### Ticket 6 — Checklist

- [ ] Deck default transition is one subtle style, used consistently.
- [ ] No over-animated or gimmicky effects on key $ slides.
- [ ] Presenter mode / export PDF tested: motion does not hide content or break legibility.

---

## Ticket 7 — Delivery pack

Aligned with [`prd.md`](./prd.md) §13 (companion deliverable — Sales Deck).

### Required deliverables

| Item | Description |
|------|-------------|
| **1. Editable Canva master** | One **duplicable** file Steve’s team can clone for sales use. Brand kit + color styles from Ticket 2 applied. |
| **2. Exported PDF** | Presentation-ready export (embed fonts where Canva allows; spot-check on Acrobat/Preview). |

### Optional: presenter copy / notes

Short **speaker bullets** only — not a second script. Purpose: help sales stay on-message without rewriting the deck.

- **Where:** Canva **Presenter notes** per slide, or a separate 1–2 page PDF “talk track” — pick one approach and stay consistent.
- **Length:** ~2–5 bullets per slide max on heavy slides; 0–1 on title/visual-only slides.
- **Content:** Paraphrase **only** what’s already on the slide or in `EDM Signal Deck.docx` — **no new claims**, numbers, or promises (Ticket 1 copy lock).

### Ticket 7 — Handoff checklist

- [ ] Canva link shared with edit access (or transfer ownership per Steve’s process).
- [ ] PDF exported and named clearly (e.g. `EDM_Signal_Sales_Deck.pdf`).
- [ ] Optional: presenter notes added and spell-checked.
- [ ] Steve (or owner) confirms PDF matches Canva page order.

---

**Last updated:** Tickets 1–7 applied as repo spec for designers / builders. Execution still happens in Canva per `documents/EDM Signal Deck.docx`.
