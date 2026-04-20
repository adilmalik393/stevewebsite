"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { ReportPayload } from "@/lib/db";

function fmt(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  return n.toLocaleString();
}

/* ═══════════════════════════ PRIMITIVE COMPONENTS ═══════════════════════════ */

/**
 * Glass card with glowing top-border accent.
 * accent controls the gradient colour pair.
 */
function SectionCard({
  title,
  subtitle,
  children,
  className = "",
  accent = "cyan",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  accent?: "cyan" | "purple" | "green";
}) {
  const top =
    accent === "purple"
      ? "from-[#7B61FF] via-[#7B61FF]/40 to-transparent"
      : accent === "green"
      ? "from-[#00FF9D] via-[#00FF9D]/40 to-transparent"
      : "from-[#00E5FF] via-[#7B61FF]/60 to-transparent";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm flex flex-col min-h-0 ${className}`}
    >
      {/* top glow border */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${top}`} aria-hidden />
      {/* inner padding */}
      <div className="p-5 md:p-6 flex flex-col flex-1 min-h-0">
        <div className="shrink-0 mb-4">
          <h3 className="text-[15px] font-semibold tracking-tight text-white font-[family-name:var(--font-montserrat)]">
            {title}
          </h3>
          {subtitle ? (
            <p className="text-xs text-[#8B9AAF] mt-1 leading-relaxed">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}

/** Circular score gauge — solid stroke, no gradient. */
function ScoreCircle({
  value,
  label,
  color,
}: {
  value: number | undefined;
  label: string;
  color: string;
}) {
  const pct = Math.min(100, Math.max(0, value || 0));
  const dim = 144;
  const cx = dim / 2;
  const ri = 52;
  const strokeW = 10;
  const circ = 2 * Math.PI * ri;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="absolute inset-0 -rotate-90">
          {/* track */}
          <circle cx={cx} cy={cx} r={ri} fill="none" stroke="#1A2535" strokeWidth={strokeW} />
          {/* solid fill arc */}
          <circle
            cx={cx}
            cy={cx}
            r={ri}
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums leading-none" style={{ color }}>
            {pct}
          </span>
          <span className="text-[10px] text-[#5C6573] uppercase tracking-widest mt-1">pts</span>
        </div>
      </div>
      <p className="text-xs text-[#8B9AAF] text-center max-w-[120px] leading-snug">{label}</p>
    </div>
  );
}

/** Taller progress bar — value badge shown at end of fill. */
function ProgressBar({ label, before, after }: { label: string; before: number; after: number }) {
  const afterPct = Math.min(100, Math.max(0, after));
  const beforePct = Math.min(100, Math.max(0, before));
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between items-center gap-3 mb-2">
        <span className="text-sm font-medium text-[#C5D0E0]">{label}</span>
        <span className="text-xs tabular-nums flex items-center gap-1">
          <span className="text-[#FF6B6B]">{before}</span>
          <span className="text-[#3A4452]">→</span>
          <span className="font-semibold text-[#00FF9D]">{after}</span>
        </span>
      </div>
      <div className="relative h-5 bg-[#0D1520] rounded-full overflow-hidden border border-white/[0.04]">
        {/* ghost: before */}
        <div
          className="absolute inset-y-0 left-0 bg-[#FF4D4D]/20 rounded-full"
          style={{ width: `${beforePct}%` }}
        />
        {/* fill: after */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
          style={{ width: `${afterPct}%`, background: "#00FF9D" }}
        >
          {afterPct > 15 && (
            <span className="text-[10px] font-bold text-[#070A0E] leading-none">{after}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Hero KPI tile — large number with colour glow. */
function KpiCard({
  label,
  value,
  color = "#00E5FF",
  compact,
  hero,
}: {
  label: string;
  value: string;
  color?: string;
  compact?: boolean;
  hero?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border text-center transition-all ${
        hero
          ? "border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-5 md:p-6"
          : compact
          ? "border-white/[0.05] bg-white/[0.02] p-3 md:p-4"
          : "border-white/[0.05] bg-white/[0.02] p-4 md:p-5"
      }`}
    >
      {hero && (
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 80% at 50% 0%, ${color}, transparent)` }}
          aria-hidden
        />
      )}
      <p
        className={`font-bold tabular-nums leading-none ${
          hero ? "text-3xl md:text-4xl mb-2" : compact ? "text-xl md:text-2xl mb-1" : "text-2xl md:text-3xl mb-1"
        }`}
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-[#8B9AAF] uppercase tracking-wider font-medium text-[11px] md:text-xs">
        {label}
      </p>
    </div>
  );
}

/** SVG arc-based donut chart — clean segments with precise gaps. */
function ChannelMixDonut({ payload: p }: { payload: ReportPayload }) {
  const COLORS: Record<string, string> = {
    "X (Twitter)": "#00E5FF",
    Reddit: "#7B61FF",
    Discord: "#00FF9D",
    Telegram: "#FF6B6B",
    Email: "#94A3B8",
  };

  const raw = [
    { label: "X (Twitter)", value: p.x_reach || 0 },
    { label: "Reddit", value: p.reddit_reach || 0 },
    { label: "Discord", value: p.discord_reach || 0 },
    { label: "Telegram", value: p.telegram_reach || 0 },
    { label: "Email", value: p.email_reach || 0 },
  ]
    .filter((s) => s.value > 0)
    .map((s) => ({ ...s, color: COLORS[s.label] ?? "#8B9AAF" }));

  const total = raw.reduce((a, s) => a + s.value, 0) || 1;

  // SVG dimensions
  const dim = 176;
  const cx = dim / 2;
  const r = 62;
  const strokeW = 18;
  const GAP_PX = 5; // px gap between segments
  const circumference = 2 * Math.PI * r;

  // Build arc segments
  let accumulated = 0;
  const segments = raw.map((s) => {
    const arcLen = (s.value / total) * circumference;
    const drawLen = Math.max(0, arcLen - GAP_PX);
    const offset = accumulated;
    accumulated += arcLen;
    return { ...s, drawLen, offset };
  });

  // Centre hole diameter = 2 * (r - strokeW/2) = 2 * (62 - 9) = 106px
  // Top/left offset from edge = cx - (r - strokeW/2) = 88 - 53 = 35px
  const holeSize = 2 * (r - strokeW / 2);
  const holeOffset = cx - (r - strokeW / 2);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG donut */}
      <div className="relative shrink-0" style={{ width: dim, height: dim }}>
        <svg
          width={dim}
          height={dim}
          className="absolute inset-0"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* track ring */}
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke="#1A2535"
            strokeWidth={strokeW}
          />
          {/* colour segments */}
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeW}
              strokeDasharray={`${seg.drawLen} ${circumference - seg.drawLen}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
              className="transition-all duration-1000"
            />
          ))}
        </svg>
        {/* centre label */}
        <div
          className="absolute flex flex-col items-center justify-center rounded-full bg-[#0A0F16]"
          style={{
            width: holeSize,
            height: holeSize,
            top: holeOffset,
            left: holeOffset,
          }}
        >
          <p className="text-lg font-bold text-white tabular-nums leading-none">{fmt(total)}</p>
          <p className="text-[9px] text-[#5C6573] uppercase tracking-widest mt-0.5">Total reach</p>
        </div>
      </div>

      {/* Legend */}
      <ul className="flex flex-col gap-3 min-w-0 w-full sm:w-auto">
        {raw.map((s) => {
          const pct = ((s.value / total) * 100).toFixed(1);
          return (
            <li key={s.label} className="flex items-center gap-3 min-w-0">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: s.color }}
              />
              <span className="text-sm text-[#C5D0E0] flex-1 truncate">{s.label}</span>
              <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: s.color }}>
                {pct}%
              </span>
              <span className="text-xs text-[#5C6573] tabular-nums shrink-0 w-6 text-right hidden md:block">
                {fmt(s.value)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Coloured horizontal bars per platform. */
function ReachBars({ payload: p }: { payload: ReportPayload }) {
  const rows = [
    { label: "X (Twitter)", value: p.x_reach || 0, color: "#00E5FF" },
    { label: "Reddit", value: p.reddit_reach || 0, color: "#7B61FF" },
    { label: "Discord", value: p.discord_reach || 0, color: "#00FF9D" },
    { label: "Telegram", value: p.telegram_reach || 0, color: "#FF6B6B" },
    { label: "Email", value: p.email_reach || 0, color: "#94A3B8" },
  ];
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-4">
      {rows.map(({ label, value, color }) => {
        const pct = (value / max) * 100;
        return (
          <div key={label}>
            <div className="flex justify-between items-baseline text-sm mb-1.5">
              <span className="flex items-center gap-2 text-[#C5D0E0]">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
                {label}
              </span>
              <span className="font-semibold tabular-nums" style={{ color }}>{fmt(value)}</span>
            </div>
            <div className="h-3 bg-[#0D1520] rounded-full overflow-hidden border border-white/[0.04]">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.max(2, pct)}%`,
                  background: color,
                  opacity: 0.8,
                  boxShadow: `0 0 8px ${color}55`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Asset deployment bar chart. */
function AssetBars({ payload: p, total }: { payload: ReportPayload; total: number }) {
  const assets = [
    { label: "X Threads", value: p.x_threads || 0, color: "#00E5FF" },
    { label: "Reddit posts", value: p.reddit_posts || 0, color: "#7B61FF" },
    { label: "Videos", value: p.videos || 0, color: "#00FF9D" },
    { label: "Articles", value: p.articles || 0, color: "#F59E0B" },
    { label: "Emails", value: p.emails || 0, color: "#94A3B8" },
    { label: "Push notifications", value: p.push_notifications || 0, color: "#FF6B6B" },
  ];
  const max = Math.max(...assets.map((a) => a.value), 1);
  return (
    <div className="space-y-3.5">
      {assets.map(({ label, value, color }) => (
        <div key={label}>
          <div className="flex justify-between items-baseline text-xs mb-1">
            <span className="text-[#8B9AAF] flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
              {label}
            </span>
            <span className="font-semibold tabular-nums" style={{ color }}>{fmt(value)}</span>
          </div>
          <div className="h-2 bg-[#0D1520] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.max(2, (value / max) * 100)}%`, background: color, opacity: 0.75 }}
            />
          </div>
        </div>
      ))}
      <div className="pt-2 flex items-center justify-between border-t border-white/[0.05]">
        <span className="text-xs text-[#5C6573]">Total assets</span>
        <span className="text-sm font-bold text-white tabular-nums">{fmt(total)}</span>
      </div>
    </div>
  );
}

function Slide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`pdf-slide min-h-screen flex flex-col justify-center px-5 md:px-12 py-10 md:py-14 ${className}`}>
      {children}
    </div>
  );
}

/* ═══════════════════════════ MAIN COMPONENT ═══════════════════════════════ */

export function ReportViewer({
  companyName,
  ticker,
  campaignName,
  campaignStart,
  campaignEnd,
  payload: p,
  isDraft = false,
  publicSlug,
  pdfMode = false,
}: {
  companyName: string;
  ticker: string | null;
  campaignName: string;
  campaignStart: string | null;
  campaignEnd: string | null;
  payload: ReportPayload;
  isDraft?: boolean;
  publicSlug?: string;
  pdfMode?: boolean;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const allSlides = useMemo(() => ["dashboard", "extended"] as const, []);

  const scrollToSlide = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(index, allSlides.length - 1));
      setCurrentSlide(target);
      document.getElementById(allSlides[target])?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [allSlides]
  );

  const goNext = useCallback(() => scrollToSlide(currentSlide + 1), [currentSlide, scrollToSlide]);
  const goPrev = useCallback(() => scrollToSlide(currentSlide - 1), [currentSlide, scrollToSlide]);

  useEffect(() => {
    if (pdfMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") setDropdownOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, pdfMode]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-report-dropdown]")) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [dropdownOpen]);

  useEffect(() => {
    if (pdfMode) return;
    if (!window.location.search.includes("print=1")) return;
    const t = setTimeout(() => window.print(), 300);
    return () => clearTimeout(t);
  }, [pdfMode]);

  useEffect(() => {
    if (!pdfMode) {
      document.documentElement.removeAttribute("data-pdf-ready");
      return;
    }
    let cancelled = false;
    void (async () => {
      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 400));
      if (!cancelled) document.documentElement.setAttribute("data-pdf-ready", "true");
    })();
    return () => {
      cancelled = true;
      document.documentElement.removeAttribute("data-pdf-ready");
    };
  }, [pdfMode, p, companyName, campaignName]);

  const assetTotal =
    (p.x_threads || 0) + (p.reddit_posts || 0) + (p.videos || 0) +
    (p.articles || 0) + (p.emails || 0) + (p.push_notifications || 0);

  const scoreDelta =
    p.signal_score_after != null && p.signal_score_before != null
      ? p.signal_score_after - p.signal_score_before
      : null;

  return (
    <div className="relative min-h-screen bg-[#060A0F] text-white font-[family-name:var(--font-inter)] selection:bg-[#00E5FF]/20">

      {/* ── Ambient background ── */}
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% -5%, rgba(0,229,255,0.08) 0%, transparent 65%)," +
            "radial-gradient(ellipse 60% 50% at 95% 10%, rgba(123,97,255,0.06) 0%, transparent 55%)," +
            "radial-gradient(ellipse 50% 40% at 5% 90%, rgba(0,255,157,0.04) 0%, transparent 50%)",
        }}
      />

      {/* ── Noise texture overlay ── */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <div className="relative z-[1]">

        {/* ── Report Selector Dropdown (top-left) ── */}
        {!pdfMode && (
          <div className="no-print fixed top-4 left-4 z-50" data-report-dropdown>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#060A0F]/90 backdrop-blur-xl px-4 py-2 text-xs text-white shadow-2xl hover:border-white/20 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" aria-hidden />
              <span className="font-semibold tracking-wide">
                {currentSlide === 0 ? "Report 1" : "Report 2"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-[#8B9AAF] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full mt-1.5 left-0 min-w-[140px] rounded-2xl border border-white/[0.08] bg-[#060A0F]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                {[
                  { label: "Report 1", index: 0 },
                  { label: "Report 2", index: 1 },
                ].map(({ label, index }) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      scrollToSlide(index);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-colors hover:bg-white/[0.06] ${
                      currentSlide === index
                        ? "text-[#00E5FF] font-semibold"
                        : "text-[#8B9AAF] font-medium"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        currentSlide === index ? "bg-[#00E5FF]" : "bg-white/20"
                      }`}
                      aria-hidden
                    />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Nav bar ── */}
        {!pdfMode && (
          <div className="no-print fixed top-4 right-4 z-50 flex items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-[#060A0F]/90 backdrop-blur-xl px-3 py-2 text-xs shadow-2xl">
            <button type="button" onClick={goPrev} className="px-2 py-1 text-[#8B9AAF] hover:text-white transition-colors rounded-lg hover:bg-white/5">
              ← Prev
            </button>
            <span className="text-[#2A3442] px-1 tabular-nums">{currentSlide + 1} / {allSlides.length}</span>
            <button type="button" onClick={goNext} className="px-2 py-1 text-[#8B9AAF] hover:text-white transition-colors rounded-lg hover:bg-white/5">
              Next →
            </button>
            {publicSlug && (
              <a
                href={`/api/reports/${encodeURIComponent(publicSlug)}/pdf`}
                className="ml-1 rounded-xl bg-[#00E5FF] px-3 py-1.5 font-bold text-[#060A0F] hover:bg-[#33EEFF] transition-colors"
              >
                PDF
              </a>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl border border-white/[0.08] px-2.5 py-1.5 font-medium text-[#8B9AAF] hover:text-white hover:border-white/20 transition-colors"
            >
              Print
            </button>
          </div>
        )}

        {isDraft && (
          <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
            <span className="rotate-[-25deg] text-[10rem] font-extrabold tracking-[0.3em] text-white/[0.025] select-none">
              DRAFT
            </span>
          </div>
        )}

        <div className="no-print fixed bottom-5 left-1/2 -translate-x-1/2 z-50 text-[11px] text-[#2A3442] tracking-[0.2em] uppercase">
          EDM Signal Report
        </div>

        {/* ════════════════════ PAGE 1 ════════════════════ */}
        <div id="dashboard">
          <Slide className="justify-start py-8 md:py-10">
            <div className="max-w-6xl mx-auto w-full space-y-7">

              {/* ── Header ── */}
              <header className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm px-6 py-5 md:px-8 md:py-6">
                {/* full-width top line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  aria-hidden
                  style={{ background: "linear-gradient(90deg, #00E5FF 0%, #7B61FF 50%, #00FF9D 100%)" }}
                />
                {/* inner gradient */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  aria-hidden
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,229,255,0.05) 0%, transparent 40%, rgba(123,97,255,0.03) 100%)",
                  }}
                />
                <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* left: brand + title */}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#7B61FF] uppercase tracking-[0.3em] font-[family-name:var(--font-montserrat)]">
                      EDM Signal
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-montserrat)] bg-gradient-to-r from-[#00E5FF] via-[#7B61FF] to-[#00FF9D] bg-clip-text text-transparent leading-tight">
                      Performance Report
                    </h1>
                  </div>
                  {/* right: meta */}
                  <div className="shrink-0 md:text-right space-y-1 border-t border-white/[0.06] pt-3 md:border-0 md:pt-0">
                    <p className="text-lg font-bold text-white leading-tight">
                      {companyName}
                      {ticker ? (
                        <span className="ml-2 rounded-md bg-[#7B61FF]/20 border border-[#7B61FF]/30 text-[#7B61FF] text-sm font-semibold px-2 py-0.5 align-middle">
                          ${ticker}
                        </span>
                      ) : null}
                    </p>
                    {campaignName ? <p className="text-sm text-[#8B9AAF]">{campaignName}</p> : null}
                    {(campaignStart || campaignEnd) && (
                      <p className="text-sm text-[#5C6573]">
                        {campaignStart}{campaignEnd ? ` — ${campaignEnd}` : ""}
                      </p>
                    )}
                    <p className="text-xs text-[#3A4452]">Prepared by {p.prepared_by || "EDM Media"}</p>
                  </div>
                </div>
              </header>

              {/* ── Section label ── */}
              <div className="flex items-center gap-3">
                <div
                  className="h-6 w-[3px] rounded-full"
                  style={{ background: "linear-gradient(180deg, #00E5FF, #7B61FF)" }}
                  aria-hidden
                />
                <h2 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-montserrat)] text-white tracking-tight">
                  Campaign performance
                </h2>
              </div>

              {/* ── Hero KPI strip ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <KpiCard label="Total reach" value={fmt(p.total_reach)} hero />
                <KpiCard label="Engagements" value={fmt(p.total_engagements)} color="#7B61FF" hero />
                <KpiCard
                  label="Signal score"
                  value={`${fmt(p.signal_score_before)} → ${fmt(p.signal_score_after)}`}
                  color="#00FF9D"
                  compact
                />
                <KpiCard label="Assets deployed" value={fmt(p.assets_deployed)} compact />
              </div>

              {/* ── Row: Signal score gauges | Channel mix ── */}
              <div className="grid lg:grid-cols-2 gap-5">
                <SectionCard title="Signal score" accent="cyan">
                  <div className="flex items-center justify-around gap-2 py-2">
                    <ScoreCircle value={p.signal_score_before} label="Before EDM Signal" color="#FF6B6B" />
                    <div className="flex flex-col items-center gap-1.5 select-none">
                      <div
                        className="h-px w-10 md:w-16"
                        style={{ background: "linear-gradient(90deg, #FF6B6B, #00FF9D)" }}
                      />
                      {scoreDelta !== null && (
                        <span
                          className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-full ${
                            scoreDelta >= 0
                              ? "bg-[#00FF9D]/15 text-[#00FF9D]"
                              : "bg-[#FF6B6B]/15 text-[#FF6B6B]"
                          }`}
                        >
                          {scoreDelta >= 0 ? "+" : ""}
                          {scoreDelta} pts
                        </span>
                      )}
                    </div>
                    <ScoreCircle value={p.signal_score_after} label="After EDM Signal" color="#00FF9D" />
                  </div>
                </SectionCard>

                <SectionCard title="Channel mix" accent="purple">
                  <ChannelMixDonut payload={p} />
                </SectionCard>
              </div>

              {/* ── Row: Signal breakdown | Content deployment ── */}
              <div className="grid lg:grid-cols-2 gap-5">
                <SectionCard title="Signal breakdown" accent="green">
                  <ProgressBar label="Execution" before={p.execution_before || 0} after={p.execution_after || 0} />
                  <ProgressBar label="Clarity" before={p.clarity_before || 0} after={p.clarity_after || 0} />
                  <ProgressBar label="Distribution" before={p.distribution_before || 0} after={p.distribution_after || 0} />
                  <ProgressBar label="Engagement" before={p.engagement_axis_before || 0} after={p.engagement_axis_after || 0} />
                </SectionCard>

                <SectionCard title="Content deployment" subtitle="Assets published across all platforms." accent="cyan">
                  <AssetBars payload={p} total={assetTotal} />
                </SectionCard>
              </div>

              {/* ── Full-width: Distribution reach & engagement ── */}
              <SectionCard title="Distribution reach &amp; engagement" accent="purple">
                <div className="grid md:grid-cols-[3fr_2fr] gap-8">
                  <div>
                    <p className="text-[11px] text-[#5C6573] uppercase tracking-widest mb-4 font-semibold">
                      Reach by platform
                    </p>
                    <ReachBars payload={p} />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#5C6573] uppercase tracking-widest mb-4 font-semibold">
                      Engagement breakdown
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Likes", value: p.likes, color: "#00E5FF" },
                        { label: "Comments", value: p.comments, color: "#7B61FF" },
                        { label: "Shares", value: p.shares, color: "#00FF9D" },
                        { label: "Clicks", value: p.clicks, color: "#F59E0B" },
                      ].map(({ label, value, color }) => (
                        <div
                          key={label}
                          className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 text-center"
                        >
                          <div
                            className="absolute inset-0 opacity-[0.04] pointer-events-none"
                            style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }}
                            aria-hidden
                          />
                          <p className="text-2xl font-bold tabular-nums leading-none mb-1" style={{ color }}>
                            {fmt(value)}
                          </p>
                          <p className="text-[11px] text-[#8B9AAF] uppercase tracking-wider font-medium">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>

            </div>
          </Slide>
        </div>

        {/* ════════════════════ PAGE 2 ════════════════════ */}
        <div id="extended">
          <Slide className="justify-start py-10 md:py-12">
            <div className="max-w-6xl mx-auto w-full space-y-7">

              <div className="flex items-center gap-3">
                <div
                  className="h-6 w-[3px] rounded-full"
                  style={{ background: "linear-gradient(180deg, #7B61FF, #00FF9D)" }}
                  aria-hidden
                />
                <h2 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-montserrat)] text-white tracking-tight">
                  Programs &amp; outcomes
                </h2>
              </div>

              {(p.top_content?.length ?? 0) > 0 && (
                <SectionCard title="Top performing content" accent="cyan">
                  <div className="grid gap-4">
                    {p.top_content!.map((item, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-start gap-4 hover:border-white/[0.10] transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#7B61FF]/20 border border-[#7B61FF]/30 flex items-center justify-center text-[#7B61FF] font-bold text-sm shrink-0 tabular-nums">
                          #{i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-white">{item.platform}</span>
                            <span className="rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-xs px-2.5 py-0.5 tabular-nums font-medium">
                              {fmt(item.engagement_count)} engagements
                            </span>
                          </div>
                          <p className="text-sm text-[#8B9AAF] leading-relaxed">{item.why_it_worked}</p>
                          {item.screenshot_data_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.screenshot_data_url}
                              alt={`${item.platform || "Top content"} screenshot`}
                              className="mt-3 w-full max-w-sm rounded-xl border border-white/[0.07]"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {(p.ppc_enabled || p.influencer_enabled) && (
                <div className={p.ppc_enabled && p.influencer_enabled ? "grid lg:grid-cols-2 gap-5" : ""}>
                  {p.ppc_enabled && (
                    <SectionCard title="PPC performance" accent="cyan">
                      <div className="grid grid-cols-2 gap-3">
                        <KpiCard label="Impressions" value={fmt(p.impressions)} compact />
                        <KpiCard label="CTR" value={p.ctr !== undefined ? `${p.ctr}%` : "—"} compact />
                        <KpiCard label="CPC" value={p.cpc !== undefined ? `$${p.cpc}` : "—"} compact />
                        <KpiCard label="Video views" value={fmt(p.video_views)} compact />
                      </div>
                    </SectionCard>
                  )}
                  {p.influencer_enabled && (
                    <SectionCard title="Influencer impact" subtitle="Community-driven amplification." accent="purple">
                      <div className="grid grid-cols-3 gap-4 text-center py-2">
                        {[
                          { label: "Activated", value: fmt(p.influencers_activated), color: "#7B61FF" },
                          { label: "Reach", value: fmt(p.influencer_reach), color: "#00E5FF" },
                          { label: "Engagements", value: fmt(p.influencer_engagement), color: "#00FF9D" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="space-y-1.5">
                            <p className="text-3xl font-bold tabular-nums" style={{ color }}>{value}</p>
                            <p className="text-xs text-[#8B9AAF] uppercase tracking-wider font-medium">{label}</p>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-5">
                <SectionCard title="Market impact" accent="green">
                  <ul className="space-y-4">
                    {(p.market_impact_bullets || []).map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00FF9D]/15 border border-[#00FF9D]/25 text-[#00FF9D] text-xs font-bold">
                          ✓
                        </span>
                        <span className="text-sm text-[#C5D0E0] leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>

                <SectionCard title="Sustain momentum" accent="cyan">
                  <ul className="space-y-4 mb-5">
                    {(p.next_steps_bullets || []).map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/25 text-[#00E5FF] text-xs font-bold">
                          →
                        </span>
                        <span className="text-sm text-[#C5D0E0] leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  {p.recommended_cta_text && (
                    <div
                      className="relative overflow-hidden rounded-2xl border border-[#00E5FF]/35 px-4 py-4 text-center"
                      style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.08) 0%, rgba(123,97,255,0.05) 100%)" }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/60 to-transparent" aria-hidden />
                      <p className="text-sm font-bold text-[#00E5FF]">{p.recommended_cta_text}</p>
                    </div>
                  )}
                </SectionCard>
              </div>

              <p className="text-xs text-[#2A3442] text-center pt-2 tracking-wider">
                {companyName}{ticker ? ` ($${ticker})` : ""} · EDM Signal Report · {p.prepared_by || "EDM Media"}
              </p>

            </div>
          </Slide>
        </div>

      </div>
    </div>
  );
}
