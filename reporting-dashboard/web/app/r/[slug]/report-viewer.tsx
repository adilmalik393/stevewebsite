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
      className={`relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm flex flex-col min-h-0 print:break-inside-avoid ${className}`}
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
    { label: "X (Twitter)", value: p.x_reach || 0, color: "#00E5FF", url: p.x_reach_url || p.x_post_url },
    { label: "Reddit", value: p.reddit_reach || 0, color: "#7B61FF", url: p.reddit_reach_url },
    { label: "Discord", value: p.discord_reach || 0, color: "#00FF9D", url: p.discord_reach_url },
    { label: "Telegram", value: p.telegram_reach || 0, color: "#FF6B6B", url: p.telegram_reach_url },
    { label: "Email", value: p.email_reach || 0, color: "#94A3B8", url: p.email_reach_url },
  ];
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-4">
      {rows.map(({ label, value, color, url }) => {
        const pct = (value / max) * 100;
        return (
          <div key={label}>
            <div className="flex justify-between items-baseline text-sm mb-1.5">
              <span className="flex items-center gap-2 text-[#C5D0E0]">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-white hover:underline transition"
                  >
                    {label}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                ) : (
                  label
                )}
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

/** Auto-generated insight chip used in Report 2 analytics dashboard. */
function InsightChip({
  icon,
  text,
  detail,
  positive,
  neutral,
}: {
  icon: string;
  text: string;
  detail: string;
  positive?: boolean;
  neutral?: boolean;
}) {
  const color = neutral ? "#7B61FF" : positive ? "#00FF9D" : "#F59E0B";
  const bg = neutral ? "rgba(123,97,255,0.08)" : positive ? "rgba(0,255,157,0.07)" : "rgba(245,158,11,0.07)";
  const border = neutral ? "rgba(123,97,255,0.20)" : positive ? "rgba(0,255,157,0.20)" : "rgba(245,158,11,0.20)";
  const badge = neutral ? "ℹ Insight" : positive ? "↑ Positive" : "↓ Attention";
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl p-4" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{badge}</span>
      </div>
      <p className="text-sm font-semibold text-white leading-snug">{text}</p>
      <p className="text-xs text-[#5C6573] leading-relaxed">{detail}</p>
    </div>
  );
}

/* ═══════════════════════════ REPORT DASHBOARD V2 ═══════════════════════════ */

/* ── Shared sub-components used exclusively inside ReportDashboardV2 ── */

function V2SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-4 mb-5">
      <span className="shrink-0 mt-0.5 text-xs font-black tabular-nums text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-lg px-2 py-0.5 tracking-widest">
        {num}
      </span>
      <div>
        <h2 className="text-lg font-bold text-white leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function V2Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-[#1C1F26] ${className}`}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.15)" }}
    >
      {children}
    </div>
  );
}

const KPI_ICONS: Record<string, (color: string) => React.ReactNode> = {
  reach: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  engagement: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  signal: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  ),
  click: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
    </svg>
  ),
  assets: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
};

function V2KpiCard({
  label,
  value,
  icon,
  color,
  delta,
  positive,
  subtitle,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  delta?: string;
  positive?: boolean;
  subtitle?: string;
}) {
  const renderIcon = KPI_ICONS[icon];
  return (
    <V2Card className="p-5 flex flex-col gap-3 group hover:border-white/[0.12] transition-colors cursor-default">
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}25` }}
        >
          {renderIcon ? renderIcon(color) : <span className="text-base">{icon}</span>}
        </div>
        {delta && (
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-lg tabular-nums"
            style={{
              color: positive ? "#22C55E" : "#EF4444",
              background: positive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${positive ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}
          >
            {positive ? "↑" : "↓"} {delta}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-black tabular-nums leading-none mb-1" style={{ color }}>
          {value}
        </p>
        <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{label}</p>
        {subtitle && <p className="text-[11px] text-[#4B5563] mt-1">{subtitle}</p>}
      </div>
    </V2Card>
  );
}

function V2InsightIcon({ type, color }: { type: string; color: string }) {
  const iconBg = `${color}18`;
  const icons: Record<string, React.ReactNode> = {
    signal: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    target: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    message: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    mail: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    bar: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  };
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: iconBg }}
    >
      {icons[type] ?? icons.bar}
    </div>
  );
}

function V2InsightCard({
  icon,
  text,
  detail,
  positive,
  neutral,
}: {
  icon: string;
  text: string;
  detail: string;
  positive?: boolean;
  neutral?: boolean;
}) {
  const color = neutral ? "#60A5FA" : positive ? "#22C55E" : "#EF4444";
  const borderColor = neutral ? "rgba(96,165,250,0.3)" : positive ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)";
  const bg = neutral ? "rgba(96,165,250,0.05)" : positive ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)";
  const tag = neutral ? "INSIGHT" : positive ? "POSITIVE" : "ATTENTION";

  return (
    <div
      className="rounded-xl p-4 flex gap-3 hover:opacity-90 transition-opacity"
      style={{ background: bg, border: `1px solid ${borderColor}`, borderLeft: `3px solid ${color}` }}
    >
      <V2InsightIcon type={icon} color={color} />
      <div className="min-w-0">
        <span
          className="inline-block text-[10px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded mb-1.5"
          style={{ color, background: `${color}15` }}
        >
          {tag}
        </span>
        <p className="text-sm font-semibold text-white leading-snug">{text}</p>
        <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────── */

function V2SvgIcon({ name, color = "currentColor", size = 14 }: { name: string; color?: string; size?: number }) {
  const s = size;
  const icons: Record<string, React.ReactNode> = {
    broadcast: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>,
    chat:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    trending:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    cursor:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/></svg>,
    box:       <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    activity:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    bar:       <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    gauge:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 2a10 10 0 0 0-10 10"/><path d="M12 12l4-4"/><circle cx="12" cy="12" r="2"/></svg>,
    star:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    zap:       <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    users:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    globe:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    lightbulb: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
    heart:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    share:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
    mail:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    bell:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    play:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    file:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    target:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    updown:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 5 5 12"/></svg>,
    trenddown: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  };
  return <>{icons[name] ?? null}</>;
}

function ReportDashboardV2({
  companyName,
  ticker,
  campaignName,
  campaignStart,
  campaignEnd,
  payload: p,
  isDraft,
}: {
  companyName: string;
  ticker: string | null;
  campaignName: string;
  campaignStart: string | null;
  campaignEnd: string | null;
  payload: ReportPayload;
  isDraft?: boolean;
}) {
  const assetTotal =
    (p.x_threads || 0) + (p.reddit_posts || 0) + (p.videos || 0) +
    (p.articles || 0) + (p.emails || 0) + (p.push_notifications || 0);

  const scoreDelta =
    p.signal_score_after != null && p.signal_score_before != null
      ? p.signal_score_after - p.signal_score_before
      : null;

  const channels = useMemo(() => [
    { label: "X / Threads", value: p.x_reach || 0 },
    { label: "Reddit",       value: p.reddit_reach || 0 },
    { label: "Discord",      value: p.discord_reach || 0 },
    { label: "Telegram",     value: p.telegram_reach || 0 },
    { label: "Email",        value: p.email_reach || 0 },
  ].filter((c) => c.value > 0).sort((a, b) => b.value - a.value), [p]);

  const engRate =
    p.total_engagements && p.total_reach && p.total_reach > 0
      ? ((p.total_engagements / p.total_reach) * 100).toFixed(2)
      : null;

  const axes = [
    { label: "Execution",   before: p.execution_before || 0,      after: p.execution_after || 0 },
    { label: "Clarity",     before: p.clarity_before || 0,        after: p.clarity_after || 0 },
    { label: "Distribution",before: p.distribution_before || 0,   after: p.distribution_after || 0 },
    { label: "Engagement",  before: p.engagement_axis_before || 0, after: p.engagement_axis_after || 0 },
  ].filter((a) => a.before > 0 || a.after > 0);

  /* palette */
  const LINE  = "1px solid #192035";
  const AMBER = "#F59E0B";
  const GREEN = "#10B981";
  const RED   = "#EF4444";
  const BG    = "#060D1A";
  const PANEL = "#0B1525";
  const TEXT  = "#C8D6E8";
  const MUTED = "#3A4D6B";
  const DIM   = "#5C7A9E";

  return (
    <div className="min-h-screen font-[family-name:var(--font-inter)]" style={{ background: BG, color: TEXT }}>

      {isDraft && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <span className="rotate-[-25deg] text-[10rem] font-extrabold tracking-[0.3em] select-none" style={{ color: "rgba(245,158,11,0.04)" }}>
            DRAFT
          </span>
        </div>
      )}

      {/* ── Top ticker bar ── */}
      <div className="sticky top-0 z-20" style={{ background: PANEL, borderBottom: LINE }}>
        <div className="max-w-[1200px] mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] shrink-0" style={{ color: AMBER }}>
              EDM SIGNAL
            </span>
            <span style={{ color: MUTED }}>│</span>
            <span className="font-mono text-[11px] truncate" style={{ color: DIM }}>{companyName}</span>
            {ticker && (
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 shrink-0" style={{ color: AMBER, background: "#F59E0B12", border: "1px solid #F59E0B30" }}>
                {ticker}
              </span>
            )}
            {isDraft && (
              <span className="font-mono text-[11px] uppercase tracking-widest px-2 py-0.5 shrink-0" style={{ color: RED, border: "1px solid #EF444440" }}>
                DRAFT
              </span>
            )}
          </div>
          <div className="font-mono text-[11px] shrink-0" style={{ color: MUTED }}>
            {campaignStart && campaignEnd ? `${campaignStart} — ${campaignEnd}` : campaignStart || campaignEnd || ""}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto">

        {/* ── Title ── */}
        <div className="px-6 py-10" style={{ borderBottom: LINE }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] mb-3" style={{ color: AMBER }}>
            // Campaign Performance Report
          </p>
          <h1 className="text-4xl md:text-5xl font-black leading-none tracking-tight text-white">
            {campaignName || "Performance Report"}
          </h1>
          <p className="mt-3 font-mono text-sm" style={{ color: DIM }}>
            Prepared by {p.prepared_by || "EDM Media"} · EDM Signal
          </p>
          {(p.algo_sentiment_bias || p.campaign_type) && (
            <div className="mt-5 flex flex-wrap gap-3">
              {p.algo_sentiment_bias && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded" style={{ background: "#10B98112", border: "1px solid #10B98130" }}>
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>Algo Bias</span>
                  <span className="font-mono text-xs font-bold" style={{ color: GREEN }}>{p.algo_sentiment_bias}</span>
                </div>
              )}
              {p.campaign_type && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded" style={{ background: `${AMBER}12`, border: `1px solid ${AMBER}30` }}>
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>Campaign Type</span>
                  <span className="font-mono text-xs font-bold" style={{ color: AMBER }}>{p.campaign_type}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-5" style={{ borderBottom: LINE }}>
          {([
            { label: "TOTAL REACH",    value: fmt(p.total_reach),    delta: null,       color: TEXT,  icon: "broadcast" },
            { label: "ENGAGEMENTS",    value: fmt(p.total_engagements), delta: null,    color: TEXT,  icon: "chat" },
            { label: "SIGNAL SCORE",   value: `${p.signal_score_before ?? "—"} → ${p.signal_score_after ?? "—"}`, delta: scoreDelta, color: scoreDelta != null && scoreDelta >= 0 ? GREEN : scoreDelta != null ? RED : TEXT, icon: scoreDelta != null && scoreDelta >= 0 ? "trending" : "trenddown" },
            { label: "CLICKS",         value: fmt(p.clicks),          delta: null,      color: TEXT,  icon: "cursor" },
            { label: "ASSETS",         value: fmt(p.assets_deployed ?? assetTotal), delta: null, color: TEXT, icon: "box" },
          ] as { label: string; value: string; delta: number | null; color: string; icon: string }[]).map((k, i, arr) => (
            <div key={k.label} className="px-6 py-5" style={{ borderRight: i < arr.length - 1 ? LINE : "none" }}>
              <div className="flex items-center gap-1.5 mb-2.5">
                <span style={{ color: MUTED }}><V2SvgIcon name={k.icon} color={MUTED} size={11} /></span>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: MUTED }}>{k.label}</p>
              </div>
              <p className="font-mono text-2xl md:text-3xl font-bold tabular-nums leading-none" style={{ color: k.color }}>
                {k.value}
              </p>
              {k.delta != null && (
                <p className="font-mono text-xs mt-1.5 tabular-nums" style={{ color: k.delta >= 0 ? GREEN : RED }}>
                  {k.delta >= 0 ? "▲" : "▼"} {Math.abs(k.delta)} pts
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ── Two-column: insights + score ── */}
        <div className="grid lg:grid-cols-[1fr_320px]" style={{ borderBottom: LINE }}>

          {/* Left: signal table */}
          <div className="px-6 py-6" style={{ borderRight: LINE }}>
            <div className="flex items-center gap-2 mb-5"><V2SvgIcon name="activity" color={AMBER} size={13} /><p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: AMBER }}>// SIGNALS & INSIGHTS</p></div>
            <div>
              <div className="grid grid-cols-[1fr_auto] pb-2 mb-1" style={{ borderBottom: `1px solid ${MUTED}40` }}>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>Signal</span>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>Status</span>
              </div>

              {scoreDelta != null && (
                <div className="grid grid-cols-[1fr_auto] items-center py-3.5" style={{ borderBottom: `1px solid ${MUTED}20` }}>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0" style={{ color: scoreDelta >= 0 ? GREEN : RED }}><V2SvgIcon name={scoreDelta >= 0 ? "trending" : "trenddown"} color={scoreDelta >= 0 ? GREEN : RED} size={14} /></span>
                    <div><p className="text-sm font-semibold text-white">
                      Signal score {scoreDelta >= 0 ? "improved" : "declined"} by{" "}
                      {p.signal_score_before ? Math.round((Math.abs(scoreDelta) / p.signal_score_before) * 100) : Math.abs(scoreDelta)}%
                    </p>
                    <p className="font-mono text-xs mt-0.5" style={{ color: DIM }}>{p.signal_score_before ?? "—"} → {p.signal_score_after ?? "—"} pts</p>
                  </div></div>
                  <span className="font-mono text-[11px] font-bold px-2.5 py-1 ml-4 shrink-0" style={{ color: scoreDelta >= 0 ? GREEN : RED, background: scoreDelta >= 0 ? "#10B98112" : "#EF444412", border: `1px solid ${scoreDelta >= 0 ? GREEN : RED}40` }}>
                    {scoreDelta >= 0 ? "POSITIVE" : "WATCH"}
                  </span>
                </div>
              )}

              {channels.length > 0 && (() => {
                const top = channels[0];
                const total = channels.reduce((s, c) => s + c.value, 0);
                return (
                  <div className="grid grid-cols-[1fr_auto] items-center py-3.5" style={{ borderBottom: `1px solid ${MUTED}20` }}>
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 shrink-0" style={{ color: AMBER }}><V2SvgIcon name="target" color={AMBER} size={14} /></span>
                      <div><p className="text-sm font-semibold text-white">{top.label} leads distribution</p>
                      <p className="font-mono text-xs mt-0.5" style={{ color: DIM }}>{Math.round((top.value / total) * 100)}% of reach · {fmt(top.value)} impressions</p>
                    </div></div>
                    <span className="font-mono text-[11px] font-bold px-2.5 py-1 ml-4 shrink-0" style={{ color: AMBER, background: "#F59E0B12", border: "1px solid #F59E0B40" }}>
                      TOP CH
                    </span>
                  </div>
                );
              })()}

              {engRate && (
                <div className="grid grid-cols-[1fr_auto] items-center py-3.5" style={{ borderBottom: `1px solid ${MUTED}20` }}>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0" style={{ color: "#60A5FA" }}><V2SvgIcon name="activity" color="#60A5FA" size={14} /></span>
                    <div><p className="text-sm font-semibold text-white">{engRate}% overall engagement rate</p>
                    <p className="font-mono text-xs mt-0.5" style={{ color: DIM }}>{fmt(p.total_engagements)} eng · {fmt(p.total_reach)} reach</p>
                  </div></div>
                  <span className="font-mono text-[11px] font-bold px-2.5 py-1 ml-4 shrink-0" style={{ color: "#60A5FA", background: "#60A5FA12", border: "1px solid #60A5FA40" }}>
                    NEUTRAL
                  </span>
                </div>
              )}

              {channels.length > 2 && (() => {
                const emailIdx = channels.findIndex((c) => c.label === "Email");
                if (emailIdx !== -1 && emailIdx > Math.floor(channels.length / 2)) {
                  return (
                    <div className="grid grid-cols-[1fr_auto] items-center py-3.5">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 shrink-0" style={{ color: RED }}><V2SvgIcon name="mail" color={RED} size={14} /></span>
                        <div><p className="text-sm font-semibold text-white">Email underperforming vs channels</p>
                        <p className="font-mono text-xs mt-0.5" style={{ color: DIM }}>Ranked #{emailIdx + 1} of {channels.length} channels</p>
                      </div></div>
                      <span className="font-mono text-[11px] font-bold px-2.5 py-1 ml-4 shrink-0" style={{ color: RED, background: "#EF444412", border: "1px solid #EF444440" }}>
                        ALERT
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* Right: score panel */}
          <div className="px-6 py-6">
            <div className="flex items-center gap-2 mb-5"><V2SvgIcon name="gauge" color={AMBER} size={13} /><p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: AMBER }}>// SIGNAL SCORE</p></div>
            <div className="flex items-center justify-around mb-6">
              {([
                { label: "BEFORE", value: p.signal_score_before, color: RED },
                { label: "AFTER",  value: p.signal_score_after,  color: GREEN },
              ] as { label: string; value: number | undefined; color: string }[]).map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: MUTED }}>{s.label}</p>
                  <p className="font-mono text-5xl font-black tabular-nums" style={{ color: s.color }}>{s.value ?? "—"}</p>
                  <p className="font-mono text-[10px] mt-1" style={{ color: MUTED }}>/ 100</p>
                </div>
              ))}
            </div>

            {scoreDelta != null && (
              <div className="text-center py-3" style={{ borderTop: LINE, borderBottom: LINE }}>
                <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: MUTED }}>NET CHANGE</p>
                <p className="font-mono text-2xl font-black tabular-nums" style={{ color: scoreDelta >= 0 ? GREEN : RED }}>
                  {scoreDelta >= 0 ? "+" : ""}{scoreDelta} pts
                </p>
              </div>
            )}

            {axes.length > 0 && (
              <div className="mt-5 space-y-3.5">
                {axes.map((ax) => (
                  <div key={ax.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>{ax.label}</span>
                      <span className="font-mono text-[10px] tabular-nums" style={{ color: ax.after >= ax.before ? GREEN : RED }}>
                        {ax.before} → {ax.after}
                      </span>
                    </div>
                    <div className="h-[3px] rounded-sm" style={{ background: `${MUTED}40` }}>
                      <div className="h-full rounded-sm transition-all duration-700" style={{ width: `${ax.after}%`, background: ax.after >= ax.before ? GREEN : RED }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Channel table ── */}
        {channels.length > 0 && (
          <div style={{ borderBottom: LINE }}>
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${MUTED}20` }}>
              <div className="flex items-center gap-2"><V2SvgIcon name="bar" color={AMBER} size={13} /><p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: AMBER }}>// CHANNEL DISTRIBUTION</p></div>
            </div>
            <div className="grid grid-cols-[1fr_80px_130px] px-6 py-2.5" style={{ background: PANEL, borderBottom: `1px solid ${MUTED}20` }}>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>Channel</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-right" style={{ color: MUTED }}>Reach</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-right" style={{ color: MUTED }}>Share</span>
            </div>
            {channels.map((ch, i) => {
              const total = channels.reduce((s, c) => s + c.value, 0);
              const share = Math.round((ch.value / total) * 100);
              const maxVal = Math.max(...channels.map((c) => c.value));
              return (
                <div key={ch.label} className="grid grid-cols-[1fr_80px_130px] items-center px-6 py-3.5" style={{ borderBottom: i < channels.length - 1 ? `1px solid ${MUTED}15` : "none" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-5 rounded-sm shrink-0" style={{ background: AMBER, opacity: 0.35 + 0.65 * (ch.value / maxVal) }} />
                    <span className="text-sm text-white font-medium">{ch.label}</span>
                  </div>
                  <span className="font-mono text-sm text-right tabular-nums" style={{ color: TEXT }}>{fmt(ch.value)}</span>
                  <div className="flex items-center justify-end gap-2">
                    <div className="flex-1 h-[3px] rounded-sm" style={{ background: `${MUTED}30`, maxWidth: "60px" }}>
                      <div className="h-full rounded-sm" style={{ width: `${share}%`, background: AMBER }} />
                    </div>
                    <span className="font-mono text-xs tabular-nums shrink-0 w-8 text-right" style={{ color: AMBER }}>{share}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Engagement strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ borderBottom: LINE }}>
          {([
            { label: "LIKES",    value: p.likes,    icon: "heart" },
            { label: "COMMENTS", value: p.comments, icon: "chat" },
            { label: "SHARES",   value: p.shares,   icon: "share" },
            { label: "CLICKS",   value: p.clicks,   icon: "cursor" },
          ] as { label: string; value: number | undefined; icon: string }[]).map((e, i, arr) => (
            <div key={e.label} className="px-6 py-5" style={{ borderRight: i < arr.length - 1 ? LINE : "none" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <V2SvgIcon name={e.icon} color={MUTED} size={11} />
                <p className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: MUTED }}>{e.label}</p>
              </div>
              <p className="font-mono text-2xl font-bold tabular-nums" style={{ color: TEXT }}>{fmt(e.value)}</p>
            </div>
          ))}
        </div>

        {/* ── Content deployment ── */}
        <div className="grid grid-cols-3 md:grid-cols-6" style={{ borderBottom: LINE }}>
          {([
            { label: "X/THREADS", value: p.x_threads,         icon: "updown" },
            { label: "REDDIT",    value: p.reddit_posts,       icon: "globe" },
            { label: "VIDEOS",    value: p.videos,             icon: "play" },
            { label: "ARTICLES",  value: p.articles,           icon: "file" },
            { label: "EMAILS",    value: p.emails,             icon: "mail" },
            { label: "PUSH",      value: p.push_notifications, icon: "bell" },
          ] as { label: string; value: number | undefined; icon: string }[]).map((a, i, arr) => (
            <div key={a.label} className="px-4 py-4" style={{ borderRight: i < arr.length - 1 ? LINE : "none" }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <V2SvgIcon name={a.icon} color={(a.value || 0) > 0 ? AMBER : MUTED} size={10} />
                <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: MUTED }}>{a.label}</p>
              </div>
              <p className="font-mono text-xl font-bold tabular-nums" style={{ color: (a.value || 0) > 0 ? AMBER : MUTED }}>{a.value || 0}</p>
            </div>
          ))}
        </div>

        {/* ── Top content ── */}
        {(p.top_content?.length ?? 0) > 0 && (
          <div style={{ borderBottom: LINE }}>
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${MUTED}20` }}>
              <div className="flex items-center gap-2"><V2SvgIcon name="star" color={AMBER} size={13} /><p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: AMBER }}>// TOP CONTENT PERFORMANCE</p></div>
            </div>
            <div className="grid grid-cols-[32px_1fr_auto] gap-4 px-6 py-2.5" style={{ background: PANEL, borderBottom: `1px solid ${MUTED}20` }}>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>#</span>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>Content</span>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>Eng.</span>
            </div>
            {p.top_content!.slice(0, 5).map((item, i) => (
              <div key={i} className="grid grid-cols-[32px_1fr_auto] gap-4 items-start px-6 py-4" style={{ borderBottom: i < Math.min(p.top_content!.length, 5) - 1 ? `1px solid ${MUTED}15` : "none" }}>
                <span className="font-mono text-sm font-bold tabular-nums" style={{ color: MUTED }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{item.platform}</p>
                    {item.content_url && (
                      <a href={item.content_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest hover:underline transition-opacity opacity-70 hover:opacity-100"
                        style={{ color: GREEN }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        View
                      </a>
                    )}
                  </div>
                  <p className="font-mono text-xs mt-0.5 whitespace-pre-wrap break-words" style={{ color: DIM }}>{item.why_it_worked}</p>
                </div>
                <span className="font-mono text-sm font-bold tabular-nums" style={{ color: GREEN }}>{fmt(item.engagement_count)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── PPC + Influencer ── */}
        {(p.ppc_enabled || p.influencer_enabled) && (
          <div className={p.ppc_enabled && p.influencer_enabled ? "grid md:grid-cols-2" : ""} style={{ borderBottom: LINE }}>
            {p.ppc_enabled && (
              <div className="px-6 py-6" style={{ borderRight: p.influencer_enabled ? LINE : "none" }}>
                <div className="flex items-center gap-2 mb-4"><V2SvgIcon name="zap" color={AMBER} size={13} /><p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: AMBER }}>// PPC PERFORMANCE</p></div>
                {([
                  { label: "IMPRESSIONS",  value: fmt(p.impressions) },
                  { label: "CTR",          value: p.ctr != null ? `${p.ctr}%` : "—" },
                  { label: "CPC",          value: p.cpc != null ? `$${p.cpc}` : "—" },
                  { label: "VIDEO VIEWS",  value: fmt(p.video_views) },
                ] as { label: string; value: string }[]).map((r, i, arr) => (
                  <div key={r.label} className="flex justify-between items-center py-3" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${MUTED}15` : "none" }}>
                    <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>{r.label}</span>
                    <span className="font-mono text-sm font-bold tabular-nums" style={{ color: TEXT }}>{r.value}</span>
                  </div>
                ))}
              </div>
            )}
            {p.influencer_enabled && (
              <div className="px-6 py-6">
                <div className="flex items-center gap-2 mb-4"><V2SvgIcon name="users" color={AMBER} size={13} /><p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: AMBER }}>// INFLUENCER IMPACT</p></div>
                {([
                  { label: "ACTIVATED",  value: fmt(p.influencers_activated) },
                  { label: "REACH",      value: fmt(p.influencer_reach) },
                  { label: "ENGAGEMENT", value: fmt(p.influencer_engagement) },
                ] as { label: string; value: string }[]).map((r, i, arr) => (
                  <div key={r.label} className="flex justify-between items-center py-3" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${MUTED}15` : "none" }}>
                    <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>{r.label}</span>
                    <span className="font-mono text-sm font-bold tabular-nums" style={{ color: TEXT }}>{r.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Market impact ── */}
        {(p.market_impact_bullets?.length ?? 0) > 0 && (
          <div style={{ borderBottom: LINE }}>
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${MUTED}20` }}>
              <div className="flex items-center gap-2"><V2SvgIcon name="globe" color={AMBER} size={13} /><p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: AMBER }}>// MARKET IMPACT</p></div>
            </div>
            <div className="px-6 py-5 grid sm:grid-cols-2 gap-3">
              {p.market_impact_bullets!.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="font-mono text-sm shrink-0 mt-0.5" style={{ color: GREEN }}>+</span>
                  <span className="text-sm leading-relaxed" style={{ color: TEXT }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recommendations ── */}
        {(p.recommended_cta_text || (p.next_steps_bullets?.length ?? 0) > 0) && (
          <div style={{ borderBottom: LINE }}>
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${MUTED}20`, borderTop: `2px solid ${AMBER}` }}>
              <div className="flex items-center gap-2"><V2SvgIcon name="lightbulb" color={AMBER} size={13} /><p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: AMBER }}>// RECOMMENDED ACTION</p></div>
            </div>
            <div className="px-6 py-8">
              {p.recommended_cta_text && (
                <p className="text-2xl md:text-3xl font-black text-white leading-snug mb-8 max-w-3xl">
                  {p.recommended_cta_text}
                </p>
              )}
              {(p.next_steps_bullets?.length ?? 0) > 0 && (
                <div>
                  {p.next_steps_bullets!.map((step, i, arr) => (
                    <div key={i} className="flex items-start gap-4 py-3.5" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${MUTED}15` : "none" }}>
                      <span className="font-mono text-xs shrink-0 tabular-nums w-6" style={{ color: AMBER }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm leading-relaxed" style={{ color: TEXT }}>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Signal Analysis ── */}
        {(p.pr_score_bullets?.length ?? 0) > 0 && (
          <div style={{ borderBottom: LINE }}>
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${MUTED}20`, borderTop: `2px solid ${AMBER}` }}>
              <div className="flex items-center gap-2"><V2SvgIcon name="activity" color={AMBER} size={13} /><p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: AMBER }}>// WHY THIS PR SCORES WELL</p></div>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-3">
                {p.pr_score_bullets!.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="font-mono text-xs shrink-0 mt-0.5" style={{ color: AMBER }}>▸</span>
                    <span className="text-sm leading-relaxed" style={{ color: TEXT }}>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Social Posts ── */}
        {(p.x_post_url || p.instagram_url || p.tiktok_url || p.stocktwits_post || p.linkedin_post || p.reddit_post) && (
          <div style={{ borderBottom: LINE }}>
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${MUTED}20`, borderTop: `2px solid #7B61FF` }}>
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "#7B61FF" }}>// SOCIAL POSTS</p>
              </div>
            </div>
            <div className="px-6 py-6 space-y-5">
              {/* Link buttons */}
              {(p.x_post_url || p.instagram_url || p.tiktok_url) && (
                <div className="flex flex-wrap gap-2">
                  {p.x_post_url && (
                    <a href={p.x_post_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      style={{ background: "#16181C", border: `1px solid ${MUTED}40`, color: TEXT }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      View X Post
                    </a>
                  )}
                  {p.instagram_url && (
                    <a href={p.instagram_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition"
                      style={{ background: "linear-gradient(135deg,#833AB4,#FD1D1D,#F77737)", border: "1px solid transparent" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                      View Instagram
                    </a>
                  )}
                  {p.tiktok_url && (
                    <a href={p.tiktok_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      style={{ background: "#010101", border: `1px solid ${MUTED}40`, color: TEXT }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.52V6.74a4.85 4.85 0 0 1-1.02-.05z"/></svg>
                      View TikTok
                    </a>
                  )}
                </div>
              )}
              {/* Text posts */}
              {p.stocktwits_post && (
                <div className="rounded-lg p-4" style={{ background: PANEL, border: `1px solid ${MUTED}30` }}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "#F59E0B" }}>StockTwits</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: TEXT }}>{p.stocktwits_post}</p>
                </div>
              )}
              {p.linkedin_post && (
                <div className="rounded-lg p-4" style={{ background: PANEL, border: `1px solid ${MUTED}30` }}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "#0A66C2" }}>LinkedIn</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: TEXT }}>{p.linkedin_post}</p>
                </div>
              )}
              {p.reddit_post && (
                <div className="rounded-lg p-4" style={{ background: PANEL, border: `1px solid ${MUTED}30` }}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "#FF4500" }}>Reddit</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: TEXT }}>{p.reddit_post}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Next PR Guidance ── */}
        {(p.next_pr_bullets?.length ?? 0) > 0 && (
          <div style={{ borderBottom: LINE }}>
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${MUTED}20`, borderTop: `2px solid ${GREEN}` }}>
              <div className="flex items-center gap-2"><V2SvgIcon name="lightbulb" color={GREEN} size={13} /><p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: GREEN }}>// WHAT THE NEXT PR SHOULD SAY</p></div>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-3">
                {p.next_pr_bullets!.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="font-mono text-xs shrink-0 mt-0.5" style={{ color: GREEN }}>▸</span>
                    <span className="text-sm leading-relaxed" style={{ color: TEXT }}>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="px-6 py-4 flex items-center justify-between">
          <span className="font-mono text-[11px]" style={{ color: MUTED }}>{companyName}{ticker ? ` · ${ticker}` : ""} · EDM Signal Report</span>
          <span className="font-mono text-[11px]" style={{ color: MUTED }}>{p.prepared_by || "EDM Media"}</span>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════ REPORT 3 – EDITORIAL LIGHT ═══════════════════ */

function V3SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-[#E2E8F0]">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">{label}</span>
      <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">{title}</h2>
    </div>
  );
}

function V3Pill({
  children,
  color = "blue",
}: {
  children: React.ReactNode;
  color?: "blue" | "green" | "red" | "gray";
}) {
  const map: Record<string, string> = {
    blue: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
    green: "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]",
    red: "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]",
    gray: "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${map[color]}`}>
      {children}
    </span>
  );
}

function ReportDashboardV3({
  companyName,
  ticker,
  campaignName,
  campaignStart,
  campaignEnd,
  payload: p,
  isDraft,
}: {
  companyName: string;
  ticker?: string | null;
  campaignName: string;
  campaignStart: string | null;
  campaignEnd: string | null;
  payload: ReportPayload;
  isDraft?: boolean;
}) {
  const assetTotal =
    (p.x_threads || 0) + (p.reddit_posts || 0) + (p.videos || 0) +
    (p.articles || 0) + (p.emails || 0) + (p.push_notifications || 0);

  const scoreDelta =
    p.signal_score_after != null && p.signal_score_before != null
      ? p.signal_score_after - p.signal_score_before
      : null;

  const kpis = [
    {
      label: "Total Reach",
      value: p.total_reach ? Number(p.total_reach).toLocaleString() : "—",
      delta: null,
      note: "across all channels",
    },
    {
      label: "Engagements",
      value: p.total_engagements ? Number(p.total_engagements).toLocaleString() : "—",
      delta: null,
      note: "likes, shares, comments",
    },
    {
      label: "Signal Score",
      value: p.signal_score_after != null ? String(p.signal_score_after) : "—",
      delta: scoreDelta,
      note: `was ${p.signal_score_before ?? "—"}`,
    },
    {
      label: "Clicks",
      value: p.clicks ? Number(p.clicks).toLocaleString() : "—",
      delta: null,
      note: "tracked clicks",
    },
    {
      label: "Assets Deployed",
      value: String(assetTotal),
      delta: null,
      note: "content pieces",
    },
  ];

  const channelData = [
    { label: "X / Threads", value: p.x_threads || 0, color: "#0F172A" },
    { label: "Reddit", value: p.reddit_posts || 0, color: "#2563EB" },
    { label: "Videos", value: p.videos || 0, color: "#7C3AED" },
    { label: "Articles", value: p.articles || 0, color: "#0891B2" },
    { label: "Emails", value: p.emails || 0, color: "#059669" },
    { label: "Push", value: p.push_notifications || 0, color: "#D97706" },
  ].filter((c) => c.value > 0);

  const channelMax = Math.max(...channelData.map((c) => c.value), 1);

  const axes = [
    { label: "Execution", value: p.execution_after },
    { label: "Clarity", value: p.clarity_after },
    { label: "Distribution", value: p.distribution_after },
    { label: "Engagement", value: p.engagement_axis_after },
  ].filter((a) => a.value != null) as { label: string; value: number }[];

  return (
    <div
      className="min-h-screen font-[family-name:var(--font-inter)]"
      style={{ background: "#F8FAFC", color: "#0F172A" }}
    >
      {isDraft && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <span className="rotate-[-25deg] text-[10rem] font-extrabold tracking-[0.3em] text-[#0F172A]/[0.04] select-none">
            DRAFT
          </span>
        </div>
      )}

      {/* ── Top rule ── */}
      <div className="h-1 w-full bg-[#2563EB]" />

      <div className="max-w-[1080px] mx-auto px-5 md:px-10 py-10 md:py-14 space-y-14">

        {/* ══════════ HEADER ══════════ */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563EB] mb-2">
              EDM Signal Report
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F172A] leading-none">
              {campaignName || "Campaign Performance"}
            </h1>
            <p className="mt-2 text-sm text-[#64748B]">
              {companyName}{ticker ? ` (${ticker})` : ""}
              {campaignStart && campaignEnd ? ` · ${campaignStart} – ${campaignEnd}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isDraft && <V3Pill color="red">Draft</V3Pill>}
            <V3Pill color="gray">{campaignStart || "—"} → {campaignEnd || "—"}</V3Pill>
            {p.algo_sentiment_bias && <V3Pill color="green">{p.algo_sentiment_bias}</V3Pill>}
            {p.campaign_type && <V3Pill color="blue">{p.campaign_type}</V3Pill>}
          </div>
        </header>

        {/* ══════════ 01 OVERVIEW ══════════ */}
        <section>
          <V3SectionHeader label="01" title="Overview" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:shadow-md transition-shadow"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8] mb-3">{k.label}</p>
                <p className="text-3xl font-black text-[#0F172A] tabular-nums leading-none">{k.value}</p>
                {k.delta != null && (
                  <p
                    className={`mt-1.5 text-xs font-bold ${k.delta >= 0 ? "text-[#15803D]" : "text-[#BE123C]"}`}
                  >
                    {k.delta >= 0 ? "↑" : "↓"} {Math.abs(k.delta)} pts
                  </p>
                )}
                {k.note && <p className="mt-1 text-[11px] text-[#94A3B8]">{k.note}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ 02 PERFORMANCE ══════════ */}
        {channelData.length > 0 && (
          <section>
            <V3SectionHeader label="02" title="Channel Distribution" />
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              {channelData.map((ch, i) => (
                <div
                  key={ch.label}
                  className={`flex items-center gap-4 px-6 py-4 ${i !== channelData.length - 1 ? "border-b border-[#F1F5F9]" : ""} hover:bg-[#F8FAFC] transition-colors`}
                >
                  <p className="w-28 text-xs font-semibold text-[#475569] shrink-0">{ch.label}</p>
                  <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.round((ch.value / channelMax) * 100)}%`,
                        background: ch.color,
                      }}
                    />
                  </div>
                  <p className="w-8 text-right text-xs font-bold text-[#0F172A] tabular-nums shrink-0">{ch.value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════ 03 KEY INSIGHTS ══════════ */}
        {(() => {
          const chips: { icon: string; text: string; color: "green" | "red" | "blue" }[] = [];
          if (scoreDelta != null && Math.abs(scoreDelta) >= 5)
            chips.push({ icon: scoreDelta >= 0 ? "↑" : "↓", text: `Signal score ${scoreDelta >= 0 ? "improved" : "dropped"} by ${Math.abs(scoreDelta)} points`, color: scoreDelta >= 0 ? "green" : "red" });
          if (p.x_threads && p.x_threads > (p.reddit_posts || 0) && p.x_threads > (p.articles || 0))
            chips.push({ icon: "✕", text: "X / Threads is your top distribution channel", color: "blue" });
          if (p.emails != null && p.emails > 0 && (p.total_reach || 0) > 0 && p.emails / (p.total_reach || 1) < 0.05)
            chips.push({ icon: "✉", text: "Email reach is below 5% — consider scaling newsletters", color: "red" });
          if (p.ppc_enabled && (p.ctr || 0) > 2)
            chips.push({ icon: "⚡", text: `Strong PPC click-through rate of ${p.ctr}%`, color: "green" });
          if (assetTotal >= 20)
            chips.push({ icon: "📦", text: `High content volume: ${assetTotal} assets deployed`, color: "blue" });
          return chips.length > 0 ? (
            <section>
              <V3SectionHeader label="03" title="Key Insights" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {chips.map((c, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
                  >
                    <span
                      className={`text-lg leading-none ${c.color === "green" ? "text-[#15803D]" : c.color === "red" ? "text-[#BE123C]" : "text-[#2563EB]"}`}
                    >
                      {c.icon}
                    </span>
                    <p className="text-sm font-semibold text-[#0F172A] leading-snug">{c.text}</p>
                    <V3Pill color={c.color === "green" ? "green" : c.color === "red" ? "red" : "blue"}>
                      {c.color === "green" ? "Positive" : c.color === "red" ? "Attention" : "Insight"}
                    </V3Pill>
                  </div>
                ))}
              </div>
            </section>
          ) : null;
        })()}

        {/* ══════════ 04 TOP CONTENT ══════════ */}
        {(p.top_content?.length ?? 0) > 0 && (
          <section>
            <V3SectionHeader label="04" title="Content Performance" />
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto] text-[11px] font-bold uppercase tracking-[0.1em] text-[#94A3B8] px-6 py-3 border-b border-[#F1F5F9]">
                <span className="w-6 text-center">#</span>
                <span className="pl-4">Content</span>
                <span>Engagement</span>
              </div>
              {p.top_content!.slice(0, 5).map((item, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[auto_1fr_auto] items-center px-6 py-4 ${i !== Math.min((p.top_content?.length ?? 0), 5) - 1 ? "border-b border-[#F1F5F9]" : ""} hover:bg-[#F8FAFC] transition-colors`}
                >
                  <span className="w-6 text-center text-[11px] font-bold text-[#94A3B8] tabular-nums">{i + 1}</span>
                  <div className="pl-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-[#0F172A] font-medium line-clamp-1">{item.platform}</p>
                      {item.content_url && (
                        <a href={item.content_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2563EB] hover:underline transition-opacity">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          View
                        </a>
                      )}
                    </div>
                    {item.why_it_worked && <p className="text-[11px] text-[#94A3B8] whitespace-pre-wrap break-words">{item.why_it_worked}</p>}
                  </div>
                  <V3Pill color="blue">{item.engagement_count > 0 ? item.engagement_count.toLocaleString() : "Top"}</V3Pill>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════ 05 CAMPAIGN AXES ══════════ */}
        {axes.length > 0 && (
          <section>
            <V3SectionHeader label="05" title="Campaign Breakdown" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {axes.map((ax) => (
                <div key={ax.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-[#475569]">{ax.label}</p>
                    <p className="text-xs font-black text-[#0F172A] tabular-nums">{ax.value}/10</p>
                  </div>
                  <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2563EB] transition-all duration-700"
                      style={{ width: `${(ax.value / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════ 06 RESULTS & IMPACT ══════════ */}
        {(p.ppc_enabled || p.influencer_enabled || (p.market_impact_bullets?.length ?? 0) > 0) && (
          <section>
            <V3SectionHeader label="06" title="Results & Impact" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {p.ppc_enabled && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">PPC Performance</p>
                  {[
                    { label: "Impressions", value: p.impressions?.toLocaleString() },
                    { label: "CTR", value: p.ctr != null ? `${p.ctr}%` : null },
                    { label: "CPC", value: p.cpc != null ? `$${p.cpc}` : null },
                    { label: "Video Views", value: p.video_views?.toLocaleString() },
                  ].filter((r) => r.value).map((row) => (
                    <div key={row.label} className="flex justify-between text-sm border-b border-[#F1F5F9] pb-2 last:border-0 last:pb-0">
                      <span className="text-[#475569]">{row.label}</span>
                      <span className="font-bold text-[#0F172A] tabular-nums">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {p.influencer_enabled && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">Influencer Impact</p>
                  {[
                    { label: "Activated", value: p.influencers_activated?.toLocaleString() },
                    { label: "Reach", value: p.influencer_reach?.toLocaleString() },
                    { label: "Engagement", value: p.influencer_engagement?.toLocaleString() },
                  ].filter((r) => r.value).map((row) => (
                    <div key={row.label} className="flex justify-between text-sm border-b border-[#F1F5F9] pb-2 last:border-0 last:pb-0">
                      <span className="text-[#475569]">{row.label}</span>
                      <span className="font-bold text-[#0F172A] tabular-nums">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {(p.market_impact_bullets?.length ?? 0) > 0 && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8] mb-3">Market Impact</p>
                  <ul className="space-y-2">
                    {p.market_impact_bullets!.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#0F172A]">
                        <span className="mt-1 w-1 h-1 rounded-full bg-[#2563EB] shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══════════ 07 RECOMMENDATIONS ══════════ */}
        {(p.recommended_cta_text || (p.next_steps_bullets?.length ?? 0) > 0) && (
          <section>
            <V3SectionHeader label="07" title="Recommendations" />
            <div className="rounded-2xl overflow-hidden bg-[#EFF6FF] border border-[#BFDBFE]">
              <div className="px-8 py-8 md:py-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563EB] mb-3">Next Steps</p>
                {p.recommended_cta_text && (
                  <p className="text-xl md:text-2xl font-bold text-[#1E3A5F] leading-snug mb-6 max-w-2xl">
                    {p.recommended_cta_text}
                  </p>
                )}
                {(p.next_steps_bullets?.length ?? 0) > 0 && (
                  <ol className="space-y-3">
                    {p.next_steps_bullets!.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[#334155]">
                        <span className="mt-px w-5 h-5 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[11px] font-bold text-[#2563EB] shrink-0 tabular-nums">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
              <div className="h-px bg-[#BFDBFE]" />
              <div className="px-8 py-4">
                <p className="text-[11px] text-[#64748B]">
                  {companyName}{ticker ? ` (${ticker})` : ""} · EDM Signal Report · {p.prepared_by || "EDM Media"}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ══════════ 08 SOCIAL POSTS ══════════ */}
        {(p.x_post_url || p.instagram_url || p.tiktok_url || p.stocktwits_post || p.linkedin_post || p.reddit_post) && (
          <section>
            <V3SectionHeader label="08" title="Social Posts" />
            <div className="space-y-4">
              {/* Link buttons */}
              {(p.x_post_url || p.instagram_url || p.tiktok_url) && (
                <div className="flex flex-wrap gap-2">
                  {p.x_post_url && (
                    <a href={p.x_post_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#16181C] text-white text-xs font-semibold hover:opacity-90 transition border border-black/10">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      View X Post
                    </a>
                  )}
                  {p.instagram_url && (
                    <a href={p.instagram_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-semibold hover:opacity-90 transition"
                      style={{ background: "linear-gradient(135deg,#833AB4,#FD1D1D,#F77737)" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                      View Instagram
                    </a>
                  )}
                  {p.tiktok_url && (
                    <a href={p.tiktok_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#010101] text-white text-xs font-semibold hover:opacity-90 transition border border-black/10">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.52V6.74a4.85 4.85 0 0 1-1.02-.05z"/></svg>
                      View TikTok
                    </a>
                  )}
                </div>
              )}
              {/* Text posts */}
              {p.stocktwits_post && (
                <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D97706] mb-2">StockTwits</p>
                  <p className="text-sm text-[#44403C] leading-relaxed whitespace-pre-wrap">{p.stocktwits_post}</p>
                </div>
              )}
              {p.linkedin_post && (
                <div className="rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1D4ED8] mb-2">LinkedIn</p>
                  <p className="text-sm text-[#1E3A5F] leading-relaxed whitespace-pre-wrap">{p.linkedin_post}</p>
                </div>
              )}
              {p.reddit_post && (
                <div className="rounded-2xl bg-[#FFF7F5] border border-[#FDCDB9] px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#CC4500] mb-2">Reddit</p>
                  <p className="text-sm text-[#44403C] leading-relaxed whitespace-pre-wrap">{p.reddit_post}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══════════ 09 SIGNAL ANALYSIS ══════════ */}
        {(p.pr_score_bullets?.length ?? 0) > 0 && (
          <section>
            <V3SectionHeader label="09" title="Why This PR Scores Well" />
            <div className="rounded-2xl bg-[#FEFCE8] border border-[#FDE68A] px-6 py-5 space-y-3">
              {p.pr_score_bullets!.map((bullet, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-4 h-4 rounded-full bg-[#FDE68A] flex items-center justify-center text-[#92400E] text-[9px] font-black shrink-0">✓</span>
                  <span className="text-sm text-[#44403C] leading-relaxed">{bullet}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════ 11 NEXT PR GUIDANCE ══════════ */}
        {(p.next_pr_bullets?.length ?? 0) > 0 && (
          <section>
            <V3SectionHeader label="11" title="What the Next PR Should Say" />
            <div className="rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] px-6 py-5 space-y-3">
              {p.next_pr_bullets!.map((bullet, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-px w-5 h-5 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[11px] font-bold text-[#16A34A] shrink-0">{i + 1}</span>
                  <span className="text-sm text-[#166534] leading-relaxed">{bullet}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <p className="text-[11px] text-[#CBD5E1] text-center pb-4 tracking-wider">
          {companyName}{ticker ? ` (${ticker})` : ""} · EDM Signal Report · {p.prepared_by || "EDM Media"}
        </p>

      </div>
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

  const switchView = useCallback((index: number) => {
    const target = Math.max(0, Math.min(index, 2));
    setCurrentSlide(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goNext = useCallback(() => switchView(currentSlide + 1), [currentSlide, switchView]);
  const goPrev = useCallback(() => switchView(currentSlide - 1), [currentSlide, switchView]);

  useEffect(() => {
    if (pdfMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
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

      {/* ── Ambient background (fixed → repeats per PDF sheet; .report-print-bg uses absolute in @media print) ── */}
      <div
        className="report-print-bg pointer-events-none fixed inset-0"
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
        className="report-print-bg pointer-events-none fixed inset-0 opacity-[0.025]"
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
                {currentSlide === 0 ? "Report 1" : currentSlide === 1 ? "Report 2" : "Report 3"}
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
                  { label: "Report 3", index: 2 },
                ].map(({ label, index }) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      switchView(index);
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
            <span className="text-[#2A3442] px-1 tabular-nums">{currentSlide + 1} / 3</span>
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
              onClick={() => {
                if (publicSlug) {
                  window.open(`/api/reports/${encodeURIComponent(publicSlug)}/pdf`, "_blank");
                  return;
                }
                window.print();
              }}
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

        {/* ════════════════════ CONDITIONAL CONTENT ════════════════════ */}
        {currentSlide === 0 ? (
        <>
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
                    {(p.algo_sentiment_bias || p.campaign_type) && (
                      <div className="flex flex-wrap gap-1.5 mt-1 justify-end">
                        {p.algo_sentiment_bias && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#00FF9D]/10 border border-[#00FF9D]/25 text-[#00FF9D]">
                            {p.algo_sentiment_bias}
                          </span>
                        )}
                        {p.campaign_type && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#F59E0B]">
                            {p.campaign_type}
                          </span>
                        )}
                      </div>
                    )}
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

              {/* Signal Analysis */}
              {(p.pr_score_bullets?.length ?? 0) > 0 && (
                <SectionCard title="Why this PR scores well" accent="cyan">
                  <ul className="space-y-3">
                    {p.pr_score_bullets!.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/25 text-[#F59E0B] text-xs font-bold">✓</span>
                        <span className="text-sm text-[#C5D0E0] leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

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
                <SectionCard title="Campaign Social Messaging" accent="cyan">
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
                            {item.content_url && (
                              <a href={item.content_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 text-[#C5D0E0] text-xs px-2.5 py-0.5 hover:bg-white/10 hover:text-white transition">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                View post
                              </a>
                            )}
                          </div>
                          <p className="text-sm text-[#8B9AAF] leading-relaxed whitespace-pre-wrap break-words">{item.why_it_worked}</p>
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

              {/* Social Posts */}
              {(p.x_post_url || p.instagram_url || p.tiktok_url || p.stocktwits_post || p.linkedin_post || p.reddit_post) && (
                <SectionCard title="Social posts" accent="purple">
                  <div className="space-y-4">
                    {/* Link buttons */}
                    {(p.x_post_url || p.instagram_url || p.tiktok_url) && (
                      <div className="flex flex-wrap gap-2">
                        {p.x_post_url && (
                          <a href={p.x_post_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-white/15 text-xs font-semibold text-white hover:bg-white/10 transition">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            View X Post
                          </a>
                        )}
                        {p.instagram_url && (
                          <a href={p.instagram_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-white hover:bg-white/10 transition"
                            style={{ background: "linear-gradient(135deg,#833AB4,#FD1D1D,#F77737)" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                            View Instagram
                          </a>
                        )}
                        {p.tiktok_url && (
                          <a href={p.tiktok_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-white/15 text-xs font-semibold text-white hover:bg-white/10 transition">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.52V6.74a4.85 4.85 0 0 1-1.02-.05z"/></svg>
                            View TikTok
                          </a>
                        )}
                      </div>
                    )}
                    {/* Text posts */}
                    {p.stocktwits_post && (
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
                        <p className="text-[10px] font-bold text-[#8B9AAF] uppercase tracking-widest mb-2">StockTwits</p>
                        <p className="text-xs text-[#C5D0E0] leading-relaxed whitespace-pre-wrap">{p.stocktwits_post}</p>
                      </div>
                    )}
                    {p.linkedin_post && (
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
                        <p className="text-[10px] font-bold text-[#0A66C2] uppercase tracking-widest mb-2">LinkedIn</p>
                        <p className="text-xs text-[#C5D0E0] leading-relaxed whitespace-pre-wrap">{p.linkedin_post}</p>
                      </div>
                    )}
                    {p.reddit_post && (
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
                        <p className="text-[10px] font-bold text-[#FF4500] uppercase tracking-widest mb-2">Reddit</p>
                        <p className="text-xs text-[#C5D0E0] leading-relaxed whitespace-pre-wrap">{p.reddit_post}</p>
                      </div>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Next PR Guidance */}
              {(p.next_pr_bullets?.length ?? 0) > 0 && (
                <SectionCard title="What the next PR should say" accent="green">
                  <ul className="space-y-3">
                    {p.next_pr_bullets!.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00FF9D]/15 border border-[#00FF9D]/25 text-[#00FF9D] text-xs font-bold">{i + 1}</span>
                        <span className="text-sm text-[#C5D0E0] leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              <p className="text-xs text-[#2A3442] text-center pt-2 tracking-wider">
                {companyName}{ticker ? ` ($${ticker})` : ""} · EDM Signal Report · {p.prepared_by || "EDM Media"}
              </p>

            </div>
          </Slide>
        </div>
        </>
        ) : currentSlide === 1 ? (
          <ReportDashboardV2
            companyName={companyName}
            ticker={ticker}
            campaignName={campaignName}
            campaignStart={campaignStart}
            campaignEnd={campaignEnd}
            payload={p}
            isDraft={isDraft}
          />
        ) : (
          <ReportDashboardV3
            companyName={companyName}
            ticker={ticker}
            campaignName={campaignName}
            campaignStart={campaignStart}
            campaignEnd={campaignEnd}
            payload={p}
            isDraft={isDraft}
          />
        )}

      </div>
    </div>
  );
}
