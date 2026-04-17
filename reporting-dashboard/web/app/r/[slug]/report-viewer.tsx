"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { ReportPayload } from "@/lib/db";

function fmt(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  return n.toLocaleString();
}

function SectionCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[#252B35] bg-[#0B0F14] p-4 md:p-5 flex flex-col min-h-0 ${className}`}
    >
      <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-montserrat)] border-b border-[#252B35] pb-2 mb-3 shrink-0">
        {title}
      </h3>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

function ScoreCircle({
  value,
  label,
  color,
  size = "md",
}: {
  value: number | undefined;
  label: string;
  color: string;
  size?: "md" | "sm";
}) {
  const pct = Math.min(100, Math.max(0, value || 0));
  const r = size === "sm" ? 38 : 54;
  const dim = size === "sm" ? 100 : 140;
  const cx = dim / 2;
  const stroke = size === "sm" ? 6 : 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const fontSize = size === "sm" ? "text-2xl" : "text-3xl";
  const labelCls =
    size === "sm"
      ? "text-[10px] text-[#A0AEC0] mt-1.5 text-center max-w-[100px] leading-tight"
      : "text-sm text-[#A0AEC0] mt-2";
  return (
    <div className="flex flex-col items-center">
      <div className="relative shrink-0" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="transform -rotate-90 absolute inset-0">
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#252B35" strokeWidth={stroke} />
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`font-bold ${fontSize}`} style={{ color }}>
            {pct}
          </span>
        </div>
      </div>
      <p className={labelCls}>{label}</p>
    </div>
  );
}

function ProgressBar({ label, before, after }: { label: string; before: number; after: number }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#A0AEC0]">{label}</span>
        <span>
          <span className="text-[#FF4D4D]">{before}</span>
          <span className="text-[#4A5568] mx-1">→</span>
          <span className="text-[#00FF9D]">{after}</span>
        </span>
      </div>
      <div className="relative h-2.5 bg-[#252B35] rounded-full overflow-hidden">
        <div className="absolute h-full bg-[#FF4D4D]/30 rounded-full" style={{ width: `${before}%` }} />
        <div className="absolute h-full bg-[#00FF9D] rounded-full transition-all duration-1000" style={{ width: `${after}%` }} />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  color = "#00E5FF",
  compact,
}: {
  label: string;
  value: string;
  color?: string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-[#252B35] bg-[#0B0F14] text-center ${compact ? "p-3" : "p-5"}`}>
      <p className={`font-bold mb-0.5 ${compact ? "text-xl md:text-2xl" : "text-3xl"}`} style={{ color }}>
        {value}
      </p>
      <p className={`text-[#A0AEC0] uppercase tracking-wider ${compact ? "text-[10px]" : "text-xs"}`}>{label}</p>
    </div>
  );
}

function ChannelMixDonut({ payload: p }: { payload: ReportPayload }) {
  const segments = [
    { label: "X (Twitter)", value: p.x_reach || 0, color: "#00E5FF" },
    { label: "Reddit", value: p.reddit_reach || 0, color: "#7B61FF" },
    { label: "Discord", value: p.discord_reach || 0, color: "#00FF9D" },
    { label: "Telegram", value: p.telegram_reach || 0, color: "#FF4D4D" },
    { label: "Email", value: p.email_reach || 0, color: "#A0AEC0" },
  ].filter((s) => s.value > 0);
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let acc = 0;
  const stops = segments
    .map((s) => {
      const start = (acc / total) * 360;
      acc += s.value;
      const end = (acc / total) * 360;
      return `${s.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div
        className="relative h-36 w-36 shrink-0 rounded-full"
        style={{
          background: segments.length ? `conic-gradient(${stops})` : "#252B35",
        }}
      >
        <div className="absolute inset-[22%] rounded-full bg-[#0B0F14]" />
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#A0AEC0] justify-center sm:justify-start">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span>
              {s.label}{" "}
              <span className="text-white font-medium">{((s.value / total) * 100).toFixed(1)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChannelReachBars({ payload: p }: { payload: ReportPayload }) {
  const rows = [
    { label: "X", value: p.x_reach || 0 },
    { label: "Reddit", value: p.reddit_reach || 0 },
    { label: "Discord", value: p.discord_reach || 0 },
    { label: "Telegram", value: p.telegram_reach || 0 },
    { label: "Email", value: p.email_reach || 0 },
  ];
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="flex h-40 items-end justify-between gap-1.5 px-1">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-1 min-w-0">
          <div
            className="w-full max-w-[44px] rounded-t-md bg-gradient-to-t from-[#7B61FF] to-[#00E5FF] mx-auto transition-all duration-700"
            style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
          />
          <span className="text-[10px] text-[#4A5568] truncate w-full text-center">{label}</span>
        </div>
      ))}
    </div>
  );
}

function Slide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`pdf-slide min-h-screen flex flex-col justify-center px-6 md:px-14 py-12 md:py-16 ${className}`}
    >
      {children}
    </div>
  );
}

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
  /** Published slug — enables server PDF download link on public view. */
  publicSlug?: string;
  /** Headless PDF capture: hide chrome; Playwright waits for `html[data-pdf-ready]`. */
  pdfMode?: boolean;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const allSlides = useMemo(() => ["dashboard", "extended"] as const, []);

  const scrollToSlide = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(index, allSlides.length - 1));
      setCurrentSlide(target);
      document.getElementById(allSlides[target])?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [allSlides]
  );

  const goNext = useCallback(() => {
    scrollToSlide(currentSlide + 1);
  }, [currentSlide, scrollToSlide]);

  const goPrev = useCallback(() => {
    scrollToSlide(currentSlide - 1);
  }, [currentSlide, scrollToSlide]);

  useEffect(() => {
    if (pdfMode) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, pdfMode]);

  useEffect(() => {
    if (pdfMode) return;
    if (!window.location.search.includes("print=1")) return;
    const timeout = setTimeout(() => window.print(), 300);
    return () => clearTimeout(timeout);
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
    (p.x_threads || 0) +
    (p.reddit_posts || 0) +
    (p.videos || 0) +
    (p.articles || 0) +
    (p.emails || 0) +
    (p.push_notifications || 0);

  return (
    <div className="bg-[#0B0F14] text-white font-[family-name:var(--font-inter)] selection:bg-[#00E5FF]/20">
      {!pdfMode && (
        <div className="no-print fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-[#252B35] bg-[#0B0F14]/90 px-3 py-2 text-xs">
          <button type="button" onClick={goPrev} className="text-[#A0AEC0] hover:text-white transition">
            Prev
          </button>
          <span className="text-[#4A5568]">
            {currentSlide + 1} / {allSlides.length}
          </span>
          <button type="button" onClick={goNext} className="text-[#A0AEC0] hover:text-white transition">
            Next
          </button>
          {publicSlug && (
            <a
              href={`/api/reports/${encodeURIComponent(publicSlug)}/pdf`}
              className="ml-2 rounded bg-[#00E5FF] px-2 py-1 font-medium text-[#0B0F14] hover:bg-[#00CCE5] transition"
            >
              Download PDF
            </a>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="ml-1 rounded border border-[#252B35] px-2 py-1 font-medium text-[#A0AEC0] hover:text-white transition"
          >
            Print
          </button>
        </div>
      )}

      {isDraft && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <span className="rotate-[-25deg] text-7xl font-extrabold tracking-[0.3em] text-white/5">DRAFT</span>
        </div>
      )}

      <div className="no-print fixed bottom-4 right-4 z-50 text-[10px] text-[#4A5568]">EDM Signal Report</div>

      {/* Page 1 — Cover strip + dashboard (single print page) */}
      <div id="dashboard">
        <Slide className="justify-start py-8 md:py-10">
          <div className="max-w-6xl mx-auto w-full space-y-4">
            <header className="rounded-xl border border-[#252B35] bg-[#0B0F14] px-4 py-3 md:px-5 md:py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] md:text-xs text-[#7B61FF] uppercase tracking-[0.28em] font-[family-name:var(--font-montserrat)] mb-1">
                    EDM Signal
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-montserrat)] bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] bg-clip-text text-transparent leading-tight">
                    Performance Report
                  </h1>
                </div>
                <div className="text-sm md:text-right shrink-0 space-y-0.5">
                  <p className="font-medium text-white">
                    {companyName}
                    {ticker ? ` ($${ticker})` : ""}
                  </p>
                  {campaignName ? <p className="text-[#A0AEC0]">{campaignName}</p> : null}
                  <p className="text-xs text-[#4A5568]">
                    {campaignStart}
                    {campaignEnd ? ` — ${campaignEnd}` : ""}
                  </p>
                  <p className="text-[10px] text-[#4A5568]">Prepared by {p.prepared_by || "EDM Media"}</p>
                </div>
              </div>
            </header>

            <h2 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-montserrat)] text-white">
              Campaign performance
            </h2>

            <div className="grid lg:grid-cols-2 gap-5">
              <SectionCard title="Executive summary">
                <div className="grid grid-cols-2 gap-3">
                  <KpiCard label="Total reach" value={fmt(p.total_reach)} compact />
                  <KpiCard label="Engagements" value={fmt(p.total_engagements)} compact />
                  <KpiCard
                    label="Signal score"
                    value={`${fmt(p.signal_score_before)} → ${fmt(p.signal_score_after)}`}
                    color="#00FF9D"
                    compact
                  />
                  <KpiCard label="Assets deployed" value={fmt(p.assets_deployed)} compact />
                </div>
                <p className="text-xs text-[#A0AEC0] mt-3 leading-relaxed">
                  Campaign visibility and engagement across investor channels — condensed overview.
                </p>
              </SectionCard>

              <SectionCard title="Reach by channel">
                <ChannelReachBars payload={p} />
                <p className="text-[10px] text-[#4A5568] mt-2 text-center">Relative reach by platform</p>
              </SectionCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <SectionCard title="Signal score">
                <div className="flex justify-around items-start gap-2">
                  <ScoreCircle value={p.signal_score_before} label="Before EDM Signal" color="#FF4D4D" size="sm" />
                  <ScoreCircle value={p.signal_score_after} label="After EDM Signal" color="#00FF9D" size="sm" />
                </div>
              </SectionCard>
              <SectionCard title="Channel mix">
                <ChannelMixDonut payload={p} />
              </SectionCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <SectionCard title="Signal breakdown">
                <ProgressBar label="Execution" before={p.execution_before || 0} after={p.execution_after || 0} />
                <ProgressBar label="Clarity" before={p.clarity_before || 0} after={p.clarity_after || 0} />
                <ProgressBar label="Distribution" before={p.distribution_before || 0} after={p.distribution_after || 0} />
                <ProgressBar label="Engagement" before={p.engagement_axis_before || 0} after={p.engagement_axis_after || 0} />
              </SectionCard>
              <SectionCard title="Content deployment">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <KpiCard label="X threads" value={fmt(p.x_threads)} color="#7B61FF" compact />
                  <KpiCard label="Reddit" value={fmt(p.reddit_posts)} color="#7B61FF" compact />
                  <KpiCard label="Videos" value={fmt(p.videos)} color="#7B61FF" compact />
                  <KpiCard label="Articles" value={fmt(p.articles)} color="#7B61FF" compact />
                  <KpiCard label="Emails" value={fmt(p.emails)} color="#7B61FF" compact />
                  <KpiCard label="Push" value={fmt(p.push_notifications)} color="#7B61FF" compact />
                </div>
                <p className="text-[10px] text-[#4A5568] mt-2 text-center">
                  Total assets: <span className="text-white font-semibold">{fmt(assetTotal)}</span>
                </p>
              </SectionCard>
            </div>

            <SectionCard title="Distribution reach & engagement">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  {[
                    { label: "X (Twitter)", value: p.x_reach },
                    { label: "Reddit", value: p.reddit_reach },
                    { label: "Discord", value: p.discord_reach },
                    { label: "Telegram", value: p.telegram_reach },
                    { label: "Email", value: p.email_reach },
                  ].map(({ label, value }) => {
                    const max = Math.max(
                      p.x_reach || 0,
                      p.reddit_reach || 0,
                      p.discord_reach || 0,
                      p.telegram_reach || 0,
                      p.email_reach || 0,
                      1
                    );
                    const width = ((value || 0) / max) * 100;
                    return (
                      <div key={label} className="min-w-0">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#A0AEC0] truncate pr-2">{label}</span>
                          <span className="text-white font-medium shrink-0">{fmt(value)}</span>
                        </div>
                        <div className="h-3 bg-[#252B35] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] rounded-full transition-all duration-1000"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3 text-center content-start">
                  {[
                    { label: "Likes", value: p.likes },
                    { label: "Comments", value: p.comments },
                    { label: "Shares", value: p.shares },
                    { label: "Clicks", value: p.clicks },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-2xl md:text-3xl font-bold text-[#00E5FF]">{fmt(value)}</p>
                      <p className="text-[10px] text-[#A0AEC0] uppercase tracking-wider mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>
        </Slide>
      </div>

      {/* Page 2 — Programs, proof, outcomes */}
      <div id="extended">
        <Slide className="justify-start py-10 md:py-12">
          <div className="max-w-6xl mx-auto w-full space-y-5">
            <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-montserrat)]">
              Programs &amp; outcomes
            </h2>

            {(p.top_content?.length ?? 0) > 0 && (
              <SectionCard title="Top performing content">
                <div className="grid gap-3">
                  {p.top_content!.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-[#252B35] bg-[#0B0F14] p-3 flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-md bg-[#7B61FF]/20 flex items-center justify-center text-[#7B61FF] font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-white">{item.platform}</span>
                          <span className="text-[10px] text-[#00E5FF]">{fmt(item.engagement_count)} engagements</span>
                        </div>
                        <p className="text-xs text-[#A0AEC0] leading-snug">{item.why_it_worked}</p>
                        {item.screenshot_data_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.screenshot_data_url}
                            alt={`${item.platform || "Top content"} screenshot`}
                            className="mt-2 w-full max-w-sm rounded-md border border-[#252B35]"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {(p.ppc_enabled || p.influencer_enabled) && (
              <div
                className={
                  p.ppc_enabled && p.influencer_enabled ? "grid lg:grid-cols-2 gap-5" : "grid gap-5"
                }
              >
                {p.ppc_enabled && (
                  <SectionCard title="PPC performance">
                    <div className="grid grid-cols-2 gap-2">
                      <KpiCard label="Impressions" value={fmt(p.impressions)} compact />
                      <KpiCard label="CTR" value={p.ctr !== undefined ? `${p.ctr}%` : "—"} compact />
                      <KpiCard label="CPC" value={p.cpc !== undefined ? `$${p.cpc}` : "—"} compact />
                      <KpiCard label="Video views" value={fmt(p.video_views)} compact />
                    </div>
                  </SectionCard>
                )}
                {p.influencer_enabled && (
                  <SectionCard title="Influencer impact">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xl font-bold text-[#7B61FF]">{fmt(p.influencers_activated)}</p>
                        <p className="text-[10px] text-[#A0AEC0] mt-0.5">Activated</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-[#00E5FF]">{fmt(p.influencer_reach)}</p>
                        <p className="text-[10px] text-[#A0AEC0] mt-0.5">Reach</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-[#00FF9D]">{fmt(p.influencer_engagement)}</p>
                        <p className="text-[10px] text-[#A0AEC0] mt-0.5">Engagements</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#A0AEC0] mt-3">Community-driven amplification.</p>
                  </SectionCard>
                )}
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-5">
              <SectionCard title="Market impact">
                <ul className="space-y-2 text-left">
                  {(p.market_impact_bullets || []).map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white">
                      <span className="text-[#00FF9D] shrink-0 mt-0.5">&#10003;</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </SectionCard>
              <SectionCard title="Sustain momentum">
                <ul className="space-y-2 text-left mb-4">
                  {(p.next_steps_bullets || []).map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white">
                      <span className="text-[#00E5FF] shrink-0">&#8594;</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                {p.recommended_cta_text && (
                  <div className="rounded-lg border border-[#00E5FF] bg-[#00E5FF]/5 px-4 py-3">
                    <p className="text-sm font-bold text-[#00E5FF]">{p.recommended_cta_text}</p>
                  </div>
                )}
              </SectionCard>
            </div>

            <p className="text-xs text-[#4A5568] text-center pt-2">
              {companyName}
              {ticker ? ` ($${ticker})` : ""} · EDM Signal Report · {p.prepared_by || "EDM Media"}
            </p>
          </div>
        </Slide>
      </div>
    </div>
  );
}
