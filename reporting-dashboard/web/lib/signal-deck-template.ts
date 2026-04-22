import type { SignalDeckPayload } from "@/lib/db";

/** Single slide when user deletes everything (still doc-shaped). */
export function minimalDeckFallback(): SignalDeckPayload {
  return {
    slides: [
      {
        title: "SLIDE 1 — COVER",
        layout: "Centered title · Background: gradient + subtle stock chart overlay",
        text: "EDM SIGNAL\nTurn Press Releases Into Market Signals",
        subtext: "Algorithmic Visibility. Investor Attention. Market Momentum.",
      },
    ],
  };
}

/** Full stack from `documents/EDM Signal Deck.docx` — only doc fields on each slide. */
export const DEFAULT_EDM_SIGNAL_DECK_PAYLOAD: SignalDeckPayload = {
  slides: [
    {
      title: "SLIDE 1 — COVER",
      layout: "Centered title · Background: gradient + subtle stock chart overlay",
      text: "EDM SIGNAL\nTurn Press Releases Into Market Signals",
      subtext: "Algorithmic Visibility. Investor Attention. Market Momentum.",
    },
    {
      title: "SLIDE 2 — HOOK (PAIN)",
      layout: "Left = bold statement · Right = faded chart dropping",
      text: "Most press releases fail.\nThey don’t move markets.\nThey don’t reach investors.\nThey don’t get picked up by algorithms.",
      bottomHighlight: "Visibility ≠ Attention\nAttention ≠ Action",
    },
    {
      title: "SLIDE 3 — THE REAL PROBLEM",
      layout: "3 icon columns",
      headers: ["Algorithm Blind", "Wrong Distribution", "No Amplification"],
      subtext: "Your news is being:",
      bullets: [
        "Ignored by trading systems",
        "Missed by retail investors",
        "Outperformed by louder tickers",
      ],
    },
    {
      title: "SLIDE 4 — THE SHIFT",
      layout: "Big centered statement",
      text: "Markets no longer react to news.\nThey react to structured signals.",
    },
    {
      title: "SLIDE 5 — INTRO EDM SIGNAL",
      layout: "Split — left bullets, right diagram",
      text: "EDM SIGNAL is a system that:\n• Rewrites your PR for algorithms\n• Distributes it to investor ecosystems\n• Amplifies it with paid + influencer momentum\n\nRight — Diagram:\nPR → Signal → Distribution → Momentum",
    },
    {
      title: "SLIDE 6 — HOW IT WORKS",
      layout: "3-step horizontal flow — each with 1-line explanation",
      bullets: ["ALGO OPTIMIZATION", "DISTRIBUTION", "AMPLIFICATION"],
    },
    {
      title: "SLIDE 7 — ALGO ENGINE (KEY SLIDE)",
      text: "Built for How Algorithms Read News",
      bullets: [
        "We prioritize: Revenue signals · Contracts · Deployment · Customers",
        "We remove: Hype · Fluff · Weak language",
        "Result: Stronger interpretation → better sentiment",
      ],
    },
    {
      title: "SLIDE 8 — DISTRIBUTION POWER",
      layout: "Visual: network map",
      text: "We don’t post.\nWe inject your story into:",
      bullets: ["X (Twitter)", "Reddit", "Discord", "Telegram", "StockTwits", "Investor communities"],
      bottomHighlight: "10M+ Reddit reach · 150K+ X followers · 70K+ Discord/Telegram",
    },
    {
      title: "SLIDE 9 — CONTENT MULTIPLICATION",
      layout: "Grid",
      text: "1 PR becomes:",
      bullets: ["Thread", "Video", "Article", "Email", "Push alert"],
      bottomHighlight: "1 Signal → 6+ Assets → 10X Exposure",
    },
    {
      title: "SLIDE 10 — BEFORE VS AFTER (CLOSER SLIDE)",
      layout: "Split screen",
      text: "Left (red): Generic PR · Low reach · Ignored\nRight (green): EDM Signal · High engagement · Market visibility",
      bottomHighlight: "Same news. Completely different outcome.",
    },
    {
      title: "SIGNAL SCORE™ SYSTEM (CORE DIFFERENTIATOR)",
      text: "This is your secret weapon slide set.",
    },
    {
      title: "SLIDE — WHAT IS SIGNAL SCORE?",
      text: "Signal Score™",
      subtext:
        "A proprietary scoring system that measures how well your news performs across algorithmic interpretation, investor clarity, distribution strength, and engagement potential.",
      bottomHighlight: "If your score is low — your visibility is limited.",
    },
    {
      title: "SLIDE — SIGNAL SCORE BREAKDOWN",
      layout: "4 quadrant grid",
      quadrants: [
        { title: "1. Execution Strength", bullets: ["Revenue", "Contracts", "Deployment"] },
        { title: "2. Clarity", bullets: ["Direct language", "No fluff", "Defined outcomes"] },
        {
          title: "3. Distribution Readiness",
          bullets: ["Multi-platform adaptability", "Content formats"],
        },
        { title: "4. Engagement Potential", bullets: ["Shareability", "Narrative strength"] },
      ],
    },
    {
      title: "SLIDE — BEFORE VS AFTER SIGNAL SCORE",
      layout: "Bar comparison (key visual)",
      signalBarCompare: {
        beforeLabel: "Before EDM Signal",
        afterLabel: "After EDM Signal",
        metrics: [
          { name: "Execution", before: 40, after: 85 },
          { name: "Clarity", before: 35, after: 90 },
          { name: "Distribution", before: 30, after: 88 },
          { name: "Engagement", before: 25, after: 82 },
        ],
        beforeTotal: 32,
        afterTotal: 86,
      },
      bottomHighlight: "Higher Signal Score = Higher Market Attention",
    },
    {
      title: "SLIDE — SIGNAL SCORE IMPACT",
      text: "What Happens When Signal Score Increases?",
      bullets: [
        "More algorithm pickup",
        "Better sentiment interpretation",
        "Higher retail engagement",
        "Stronger visibility vs competing tickers",
      ],
    },
    {
      title: "SLIDE — REAL-WORLD APPLICATION",
      text: "How We Apply Signal Score",
      subtext: "PR → Signal Audit → Rewrite → Distribution → Amplification",
      bottomHighlight: "Every campaign is engineered to increase Signal Score before distribution.",
    },
    {
      title: "SLIDE 11 — WHY NOW (MACRO)",
      text: "Why This Matters Right Now",
      bullets: [
        "Retail investors are driving market momentum",
        "Rate cuts = capital flowing back into equities",
        "AI trading reacts instantly to signals",
        "Information speed is at all-time highs",
      ],
      bottomHighlight: "If your message isn’t structured → it’s invisible",
    },
    {
      title: "SLIDE 12 — PACKAGES",
      layout: "3-column pricing table — highlight Amplified",
      pricingColumns: [
        { name: "Starter", price: "$3,500" },
        { name: "Amplified ⭐", price: "$7,500", highlight: true },
        { name: "Dominance", price: "$15K+" },
      ],
    },
    {
      title: "SLIDE 12A — SIGNAL STARTER (ENTRY)",
      layout: "Clean card (left-aligned), minimal glow",
      text: "Signal Starter\n$3,500 / campaign",
      bullets: [
        "Algo-optimized PR rewrite",
        "X (Twitter) investor thread",
        "Reddit post (high-visibility format)",
        "Instagram/TikTok post",
        "Base social distribution network",
      ],
      subtext: "For single announcements that need structured visibility",
    },
    {
      title: "SLIDE 12B — SIGNAL AMPLIFIED ⭐ (PRIMARY SELL)",
      layout: "Center card, larger, glowing border",
      text: "Signal Amplified\n$7,500 / campaign\n\nIncludes EVERYTHING in Starter PLUS:",
      bullets: [
        "Short-form video script + captions",
        "YouTube / Instagram / TikTok distribution",
        "Email blast to investor database",
        "Push notification distribution",
        "Expanded social network reach",
      ],
      bottomHighlight: "Most Popular – Best balance of reach + engagement",
    },
    {
      title: "SLIDE 12C — SIGNAL DOMINANCE (HIGH TICKET)",
      layout: "Premium card with gradient glow",
      text: "Signal Dominance\n$15,000+ / campaign\n\nIncludes EVERYTHING in Amplified PLUS:",
      bullets: [
        "Multi-day campaign rollout",
        "Ticker-tag article distribution",
        "Narrative sequencing (multi-post strategy)",
        "Engagement team (comments + discussions)",
        "Advanced positioning strategy",
      ],
      subtext: "Built for companies that want to own the narrative",
    },
    {
      title: "SLIDE 12D — PACKAGE COMPARISON TABLE",
      layout: "3-column table (clean, bold headers)",
      featureMatrix: [
        { feature: "PR Optimization", starter: true, amplified: true, dominance: true },
        { feature: "X Thread", starter: true, amplified: true, dominance: true },
        { feature: "Reddit", starter: true, amplified: true, dominance: true },
        { feature: "Video Content", starter: false, amplified: true, dominance: true },
        { feature: "Email Blast", starter: false, amplified: true, dominance: true },
        { feature: "Push Notifications", starter: false, amplified: true, dominance: true },
        { feature: "Multi-Day Campaign", starter: false, amplified: false, dominance: true },
        { feature: "Engagement Layer", starter: false, amplified: false, dominance: true },
      ],
      bottomHighlight: "Amplified = highest ROI per dollar",
    },
    {
      title: "SLIDE 13 — MONTHLY RETAINER",
      text: "Sustained Momentum\nInvestor Engagement Retainer — $30,000/month",
      bullets: [
        "Ongoing PR campaigns",
        "Daily engagement",
        "Influencer coordination",
        "Weekly content",
        "Email + PPC optimization",
      ],
      bottomHighlight: "This is how companies stay relevant — not just visible.",
    },
    {
      title: "SLIDE 14 — PPC ADD-ON",
      text: "Paid Acceleration",
      layout: "Visual: rising chart",
      visualAccent: "rising_chart",
      subtext: "Turn strong content into scale.",
      bullets: ["TikTok", "Instagram", "YouTube", "X"],
      bottomHighlight: "Budget: $5K–$25K+",
    },
    {
      title: "SLIDE 15 — INFLUENCER ADD-ON",
      text: "Community-Driven Momentum",
      subtext: "We activate:",
      bullets: ["Stock influencers", "Reddit leaders", "Discord mods"],
      bottomHighlight: "This is where campaigns go viral.",
    },
    {
      title: "SLIDE 16 — RECOMMENDED STACK (ANCHOR)",
      layout: "BIG CENTER TEXT",
      text: "$22,500 CAMPAIGN\nSignal Amplified",
      bullets: ["PPC ($10K)", "Influencers ($5K)"],
      subtext: "Maximum reach. Maximum engagement. Maximum momentum.",
    },
    {
      title: "SLIDE 17 — OUTCOMES",
      layout: "Icons + bullets",
      bullets: [
        "Increased investor awareness",
        "Higher engagement",
        "Stronger sentiment",
        "Multi-platform visibility",
      ],
    },
    {
      title: "SLIDE 18 — COST OF INACTION (VERY IMPORTANT)",
      text: "While you wait:\nOther companies are:",
      bullets: ["Capturing investor attention", "Driving narrative", "Building momentum"],
      bottomHighlight: "Silence is a strategy.\nJust not a winning one.",
    },
    {
      title: "SLIDE 19 — NEXT STEPS",
      bullets: ["Choose campaign", "Send PR", "Launch in 48 hours"],
    },
    {
      title: "SLIDE 20 — CLOSE",
      text: "Let’s turn your next press release into a market-moving signal.\nedm.media",
    },
    {
      title: "FINAL NOTES (CRITICAL FOR CONVERSION)",
      text: "When building in Canva:",
      bullets: [
        "Use large typography (less text, more impact)",
        "Add motion (fade-ins, slide transitions)",
        "Keep slides clean — not cluttered",
        "Highlight: “Signal” · “Momentum” · “Execution”",
      ],
    },
  ],
};
