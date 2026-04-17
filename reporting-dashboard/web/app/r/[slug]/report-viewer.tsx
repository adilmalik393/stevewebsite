"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReportPayload } from "@/lib/db";

function fmt(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  return n.toLocaleString();
}

function ScoreCircle({ value, label, color }: { value: number | undefined; label: string; color: string }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" className="transform -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#252B35" strokeWidth="8" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000" />
      </svg>
      <div className="absolute mt-10 text-3xl font-bold" style={{ color }}>{pct}</div>
      <p className="text-sm text-[#A0AEC0] mt-2">{label}</p>
    </div>
  );
}

function ProgressBar({ label, before, after }: { label: string; before: number; after: number }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#A0AEC0]">{label}</span>
        <span><span className="text-[#FF4D4D]">{before}</span> → <span className="text-[#00FF9D]">{after}</span></span>
      </div>
      <div className="relative h-3 bg-[#252B35] rounded-full overflow-hidden">
        <div className="absolute h-full bg-[#FF4D4D]/30 rounded-full" style={{ width: `${before}%` }} />
        <div className="absolute h-full bg-[#00FF9D] rounded-full transition-all duration-1000" style={{ width: `${after}%` }} />
      </div>
    </div>
  );
}

function KpiCard({ label, value, color = "#00E5FF" }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-[#252B35] bg-[#0B0F14] p-5 text-center">
      <p className="text-3xl font-bold mb-1" style={{ color }}>{value}</p>
      <p className="text-xs text-[#A0AEC0] uppercase tracking-wider">{label}</p>
    </div>
  );
}

function Slide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-h-screen flex flex-col justify-center px-8 md:px-20 py-16 ${className}`}>
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
}: {
  companyName: string;
  ticker: string | null;
  campaignName: string;
  campaignStart: string | null;
  campaignEnd: string | null;
  payload: ReportPayload;
}) {
  return (
    <div className="bg-[#0B0F14] text-white font-[family-name:var(--font-inter)] selection:bg-[#00E5FF]/20">
      {/* Persistent footer */}
      <div className="fixed bottom-4 right-4 z-50 text-[10px] text-[#4A5568]">EDM Signal Report</div>

      {/* Slide 1 — Cover */}
      <Slide>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-[#7B61FF] uppercase tracking-[0.3em] mb-4 font-[family-name:var(--font-montserrat)]">
            EDM SIGNAL
          </p>
          <h1 className="text-5xl md:text-6xl font-bold font-[family-name:var(--font-montserrat)] mb-4 bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] bg-clip-text text-transparent">
            Performance Report
          </h1>
          <p className="text-xl text-[#A0AEC0] mb-2">
            {companyName}{ticker ? ` ($${ticker})` : ""}
          </p>
          <p className="text-sm text-[#4A5568]">
            {campaignStart}{campaignEnd ? ` — ${campaignEnd}` : ""}
          </p>
          <p className="text-xs text-[#4A5568] mt-6">Prepared by {p.prepared_by || "EDM Media"}</p>
        </div>
      </Slide>

      {/* Slide 2 — Executive Summary */}
      <Slide>
        <div className="max-w-4xl mx-auto w-full">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-8">
            Executive Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Total Reach" value={fmt(p.total_reach)} />
            <KpiCard label="Engagements" value={fmt(p.total_engagements)} />
            <KpiCard label="Signal Score" value={`${fmt(p.signal_score_before)} → ${fmt(p.signal_score_after)}`} color="#00FF9D" />
            <KpiCard label="Assets Deployed" value={fmt(p.assets_deployed)} />
          </div>
          <p className="text-sm text-[#A0AEC0] mt-6 text-center">
            Campaign successfully increased visibility and engagement across investor channels.
          </p>
        </div>
      </Slide>

      {/* Slide 3 — Signal Score */}
      <Slide>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-10">
            Signal Score Improvement
          </h2>
          <div className="flex justify-center gap-16 md:gap-24">
            <div className="relative">
              <ScoreCircle value={p.signal_score_before} label="Before EDM Signal" color="#FF4D4D" />
            </div>
            <div className="relative">
              <ScoreCircle value={p.signal_score_after} label="After EDM Signal" color="#00FF9D" />
            </div>
          </div>
        </div>
      </Slide>

      {/* Slide 4 — Signal Breakdown */}
      <Slide>
        <div className="max-w-2xl mx-auto w-full">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-8">
            Signal Breakdown
          </h2>
          <ProgressBar label="Execution" before={p.execution_before || 0} after={p.execution_after || 0} />
          <ProgressBar label="Clarity" before={p.clarity_before || 0} after={p.clarity_after || 0} />
          <ProgressBar label="Distribution" before={p.distribution_before || 0} after={p.distribution_after || 0} />
          <ProgressBar label="Engagement" before={p.engagement_axis_before || 0} after={p.engagement_axis_after || 0} />
        </div>
      </Slide>

      {/* Slide 5 — Content Deployment */}
      <Slide>
        <div className="max-w-3xl mx-auto w-full">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-8">
            Content Deployment
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KpiCard label="X Threads" value={fmt(p.x_threads)} color="#7B61FF" />
            <KpiCard label="Reddit Posts" value={fmt(p.reddit_posts)} color="#7B61FF" />
            <KpiCard label="Videos" value={fmt(p.videos)} color="#7B61FF" />
            <KpiCard label="Articles" value={fmt(p.articles)} color="#7B61FF" />
            <KpiCard label="Emails" value={fmt(p.emails)} color="#7B61FF" />
            <KpiCard label="Push Notifications" value={fmt(p.push_notifications)} color="#7B61FF" />
          </div>
          <p className="text-sm text-[#A0AEC0] mt-6 text-center">
            Total Assets: <span className="text-white font-bold">
              {fmt((p.x_threads || 0) + (p.reddit_posts || 0) + (p.videos || 0) + (p.articles || 0) + (p.emails || 0) + (p.push_notifications || 0))}
            </span>
          </p>
        </div>
      </Slide>

      {/* Slide 6 — Distribution Reach */}
      <Slide>
        <div className="max-w-2xl mx-auto w-full">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-8">
            Distribution Reach
          </h2>
          {[
            { label: "X (Twitter)", value: p.x_reach },
            { label: "Reddit", value: p.reddit_reach },
            { label: "Discord", value: p.discord_reach },
            { label: "Telegram", value: p.telegram_reach },
            { label: "Email", value: p.email_reach },
          ].map(({ label, value }) => {
            const max = Math.max(p.x_reach || 0, p.reddit_reach || 0, p.discord_reach || 0, p.telegram_reach || 0, p.email_reach || 0, 1);
            const width = ((value || 0) / max) * 100;
            return (
              <div key={label} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#A0AEC0]">{label}</span>
                  <span className="text-white font-medium">{fmt(value)}</span>
                </div>
                <div className="h-4 bg-[#252B35] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] rounded-full transition-all duration-1000" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Slide>

      {/* Slide 7 — Engagement */}
      <Slide>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-10">
            Engagement
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Likes", value: p.likes },
              { label: "Comments", value: p.comments },
              { label: "Shares", value: p.shares },
              { label: "Clicks", value: p.clicks },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-4xl font-bold text-[#00E5FF]">{fmt(value)}</p>
                <p className="text-xs text-[#A0AEC0] uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* Slide 8 — Top Content */}
      {(p.top_content?.length ?? 0) > 0 && (
        <Slide>
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-8">
              Top Performing Content
            </h2>
            <div className="grid gap-4">
              {p.top_content!.map((item, i) => (
                <div key={i} className="rounded-xl border border-[#252B35] bg-[#0B0F14] p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#7B61FF]/20 flex items-center justify-center text-[#7B61FF] font-bold shrink-0">
                    #{i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold text-white">{item.platform}</span>
                      <span className="text-xs text-[#00E5FF]">{fmt(item.engagement_count)} engagements</span>
                    </div>
                    <p className="text-sm text-[#A0AEC0]">{item.why_it_worked}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Slide>
      )}

      {/* Slide 9 — PPC (conditional) */}
      {p.ppc_enabled && (
        <Slide>
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-8">
              PPC Performance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="Impressions" value={fmt(p.impressions)} />
              <KpiCard label="CTR" value={p.ctr !== undefined ? `${p.ctr}%` : "—"} />
              <KpiCard label="CPC" value={p.cpc !== undefined ? `$${p.cpc}` : "—"} />
              <KpiCard label="Video Views" value={fmt(p.video_views)} />
            </div>
          </div>
        </Slide>
      )}

      {/* Slide 10 — Influencer (conditional) */}
      {p.influencer_enabled && (
        <Slide>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-8">
              Influencer Impact
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-4xl font-bold text-[#7B61FF]">{fmt(p.influencers_activated)}</p>
                <p className="text-xs text-[#A0AEC0] mt-1">Activated</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-[#00E5FF]">{fmt(p.influencer_reach)}</p>
                <p className="text-xs text-[#A0AEC0] mt-1">Total Reach</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-[#00FF9D]">{fmt(p.influencer_engagement)}</p>
                <p className="text-xs text-[#A0AEC0] mt-1">Engagements</p>
              </div>
            </div>
            <p className="text-sm text-[#A0AEC0] mt-8">
              Community-driven amplification increased organic visibility.
            </p>
          </div>
        </Slide>
      )}

      {/* Slide 11 — Market Impact */}
      <Slide>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-8">
            Market Impact
          </h2>
          <p className="text-lg text-[#A0AEC0] mb-8">
            This campaign contributed to:
          </p>
          <ul className="space-y-3 text-left max-w-lg mx-auto">
            {(p.market_impact_bullets || []).map((bullet, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#00FF9D] mt-0.5">&#10003;</span>
                <span className="text-lg text-white">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </Slide>

      {/* Slide 12 — Next Steps */}
      <Slide>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-8">
            Sustain Momentum
          </h2>
          <ul className="space-y-3 text-left max-w-lg mx-auto mb-10">
            {(p.next_steps_bullets || []).map((bullet, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#00E5FF]">&#8594;</span>
                <span className="text-lg text-white">{bullet}</span>
              </li>
            ))}
          </ul>
          {p.recommended_cta_text && (
            <div className="inline-block px-8 py-4 rounded-xl border-2 border-[#00E5FF] bg-[#00E5FF]/5">
              <p className="text-lg font-bold text-[#00E5FF]">{p.recommended_cta_text}</p>
            </div>
          )}
          <p className="text-xs text-[#4A5568] mt-12">
            {companyName}{ticker ? ` ($${ticker})` : ""} · EDM Signal Report · {p.prepared_by || "EDM Media"}
          </p>
        </div>
      </Slide>
    </div>
  );
}
