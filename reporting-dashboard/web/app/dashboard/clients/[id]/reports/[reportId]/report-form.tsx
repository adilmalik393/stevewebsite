"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveReportPayload, saveReportMeta, publish } from "../../../../actions";
import type { ReportPayload } from "@/lib/db";

const SECTIONS = [
  "Cover",
  "Executive Summary",
  "Signal Score",
  "Content Deployment",
  "Distribution",
  "Engagement",
  "Top Content",
  "PPC",
  "Influencer",
  "Market Impact",
  "Next Steps",
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#252B35] bg-[#151A22] p-6 mb-6" id={title.toLowerCase().replace(/ /g, "-")}>
      <h3 className="text-sm font-semibold text-[#A0AEC0] uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-[#A0AEC0] mb-1">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[#4A5568] mt-1">{hint}</p>}
    </div>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-[#0B0F14] border border-[#252B35] rounded-lg text-white text-sm placeholder-[#4A5568] focus:outline-none focus:border-[#00E5FF] transition"
    />
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-[#0B0F14] border border-[#252B35] rounded-lg text-white text-sm placeholder-[#4A5568] focus:outline-none focus:border-[#00E5FF] transition"
    />
  );
}

function BeforeAfterRow({
  label,
  before,
  after,
  onBeforeChange,
  onAfterChange,
}: {
  label: string;
  before: number | undefined;
  after: number | undefined;
  onBeforeChange: (v: number | undefined) => void;
  onAfterChange: (v: number | undefined) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 items-center">
      <span className="text-sm text-[#A0AEC0]">{label}</span>
      <NumberInput value={before} onChange={onBeforeChange} placeholder="Before (0-100)" />
      <NumberInput value={after} onChange={onAfterChange} placeholder="After (0-100)" />
    </div>
  );
}

export function ReportForm({
  reportId,
  clientId,
  companyName,
  ticker,
  publishedSlug,
  initialMeta,
  initialPayload,
}: {
  reportId: string;
  clientId: string;
  companyName: string;
  ticker: string | null;
  /** When set, server PDF download is available for the published report. */
  publishedSlug?: string | null;
  initialMeta: { campaign_name: string; campaign_start: string; campaign_end: string };
  initialPayload: ReportPayload;
}) {
  const [meta, setMeta] = useState(initialMeta);
  const [p, setP] = useState<ReportPayload>({
    prepared_by: "EDM Media",
    market_impact_bullets: [
      "Increased investor awareness",
      "Stronger visibility",
      "Improved narrative positioning",
    ],
    recommended_cta_text: "Recommended: Monthly Engagement ($25K)",
    next_steps_bullets: [
      "Continue campaign cadence",
      "Expand PPC",
      "Increase influencer activity",
    ],
    ...initialPayload,
  });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const update = useCallback((patch: Partial<ReportPayload>) => {
    setP((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateTopContent = useCallback(
    (index: number, patch: { platform?: string; engagement_count?: number; why_it_worked?: string; screenshot_data_url?: string }) => {
      const arr = [...(p.top_content || [])];
      arr[index] = { ...arr[index], ...patch };
      update({ top_content: arr });
    },
    [p.top_content, update]
  );

  // Auto-save debounce
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await saveReportPayload(reportId, JSON.stringify(p));
      await saveReportMeta(reportId, meta);
      setLastSaved(new Date().toLocaleTimeString());
      setSaving(false);
    }, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [p, meta, reportId]);

  return (
    <div className="flex">
      {/* Sidebar nav */}
      <nav className="hidden lg:block w-48 border-r border-[#252B35] p-4 sticky top-0 h-screen overflow-y-auto">
        <ul className="space-y-1">
          {SECTIONS.map((s) => (
            <li key={s}>
              <a
                href={`#${s.toLowerCase().replace(/ /g, "-")}`}
                className="block text-xs text-[#A0AEC0] hover:text-white py-1 px-2 rounded hover:bg-[#252B35] transition"
              >
                {s}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-[10px] text-[#4A5568]">
          {saving ? "Saving..." : lastSaved ? `Saved ${lastSaved}` : "Auto-saves on edit"}
        </div>
        <a
          href={`/dashboard/clients/${clientId}`}
          className="block mt-4 text-xs text-[#A0AEC0] hover:text-white transition"
        >
          &larr; Back to client
        </a>
      </nav>

      {/* Form */}
      <div className="flex-1 max-w-3xl mx-auto px-6 py-8">
        {/* Cover */}
        <Section title="Cover">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Campaign name">
              <Input
                value={meta.campaign_name}
                onChange={(v) => setMeta({ ...meta, campaign_name: v })}
                placeholder="Q1 2026 Signal Campaign"
              />
            </Field>
            <Field label="Prepared by">
              <Input
                value={p.prepared_by || ""}
                onChange={(v) => update({ prepared_by: v })}
                placeholder="EDM Media"
              />
            </Field>
            <Field label="Campaign start">
              <Input
                type="date"
                value={meta.campaign_start}
                onChange={(v) => setMeta({ ...meta, campaign_start: v })}
              />
            </Field>
            <Field label="Campaign end">
              <Input
                type="date"
                value={meta.campaign_end}
                onChange={(v) => setMeta({ ...meta, campaign_end: v })}
              />
            </Field>
          </div>
          <p className="text-xs text-[#4A5568] mt-3">
            Client: <strong className="text-[#A0AEC0]">{companyName}</strong>
            {ticker && <span className="text-[#00E5FF]"> (${ticker})</span>}
          </p>
        </Section>

        {/* Executive Summary */}
        <Section title="Executive Summary">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Total Reach" hint="Brand24 → Mentions">
              <NumberInput value={p.total_reach} onChange={(v) => update({ total_reach: v })} placeholder="0" />
            </Field>
            <Field label="Total Engagements">
              <NumberInput value={p.total_engagements} onChange={(v) => update({ total_engagements: v })} placeholder="0" />
            </Field>
            <Field label="Assets Deployed">
              <NumberInput value={p.assets_deployed} onChange={(v) => update({ assets_deployed: v })} placeholder="0" />
            </Field>
          </div>
        </Section>

        {/* Signal Score */}
        <Section title="Signal Score">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Field label="Signal Score Before (0-100)">
              <NumberInput value={p.signal_score_before} onChange={(v) => update({ signal_score_before: v })} placeholder="32" />
            </Field>
            <Field label="Signal Score After (0-100)">
              <NumberInput value={p.signal_score_after} onChange={(v) => update({ signal_score_after: v })} placeholder="86" />
            </Field>
          </div>
          <h4 className="text-xs text-[#4A5568] uppercase mb-3">Axis Breakdown (0-100 each)</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-xs text-[#4A5568]">
              <span>Axis</span><span>Before</span><span>After</span>
            </div>
            <BeforeAfterRow label="Execution" before={p.execution_before} after={p.execution_after}
              onBeforeChange={(v) => update({ execution_before: v })} onAfterChange={(v) => update({ execution_after: v })} />
            <BeforeAfterRow label="Clarity" before={p.clarity_before} after={p.clarity_after}
              onBeforeChange={(v) => update({ clarity_before: v })} onAfterChange={(v) => update({ clarity_after: v })} />
            <BeforeAfterRow label="Distribution" before={p.distribution_before} after={p.distribution_after}
              onBeforeChange={(v) => update({ distribution_before: v })} onAfterChange={(v) => update({ distribution_after: v })} />
            <BeforeAfterRow label="Engagement" before={p.engagement_axis_before} after={p.engagement_axis_after}
              onBeforeChange={(v) => update({ engagement_axis_before: v })} onAfterChange={(v) => update({ engagement_axis_after: v })} />
          </div>
        </Section>

        {/* Content Deployment */}
        <Section title="Content Deployment">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="X Threads"><NumberInput value={p.x_threads} onChange={(v) => update({ x_threads: v })} placeholder="0" /></Field>
            <Field label="Reddit Posts"><NumberInput value={p.reddit_posts} onChange={(v) => update({ reddit_posts: v })} placeholder="0" /></Field>
            <Field label="Videos"><NumberInput value={p.videos} onChange={(v) => update({ videos: v })} placeholder="0" /></Field>
            <Field label="Articles"><NumberInput value={p.articles} onChange={(v) => update({ articles: v })} placeholder="0" /></Field>
            <Field label="Emails"><NumberInput value={p.emails} onChange={(v) => update({ emails: v })} placeholder="0" /></Field>
            <Field label="Push Notifications"><NumberInput value={p.push_notifications} onChange={(v) => update({ push_notifications: v })} placeholder="0" /></Field>
          </div>
        </Section>

        {/* Distribution Reach */}
        <Section title="Distribution">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="X Reach"><NumberInput value={p.x_reach} onChange={(v) => update({ x_reach: v })} placeholder="0" /></Field>
            <Field label="Reddit Reach"><NumberInput value={p.reddit_reach} onChange={(v) => update({ reddit_reach: v })} placeholder="0" /></Field>
            <Field label="Discord Reach"><NumberInput value={p.discord_reach} onChange={(v) => update({ discord_reach: v })} placeholder="0" /></Field>
            <Field label="Telegram Reach"><NumberInput value={p.telegram_reach} onChange={(v) => update({ telegram_reach: v })} placeholder="0" /></Field>
            <Field label="Email Reach"><NumberInput value={p.email_reach} onChange={(v) => update({ email_reach: v })} placeholder="0" /></Field>
          </div>
        </Section>

        {/* Engagement */}
        <Section title="Engagement">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Likes"><NumberInput value={p.likes} onChange={(v) => update({ likes: v })} placeholder="0" /></Field>
            <Field label="Comments"><NumberInput value={p.comments} onChange={(v) => update({ comments: v })} placeholder="0" /></Field>
            <Field label="Shares"><NumberInput value={p.shares} onChange={(v) => update({ shares: v })} placeholder="0" /></Field>
            <Field label="Clicks"><NumberInput value={p.clicks} onChange={(v) => update({ clicks: v })} placeholder="0" /></Field>
          </div>
        </Section>

        {/* Top Content */}
        <Section title="Top Content">
          {(p.top_content || []).map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 pb-4 border-b border-[#252B35] last:border-0">
              <Field label="Platform">
                <Input
                  value={item.platform}
                  onChange={(v) => updateTopContent(i, { platform: v })}
                  placeholder="X / Reddit / etc"
                />
              </Field>
              <Field label="Engagements">
                <NumberInput
                  value={item.engagement_count}
                  onChange={(v) => updateTopContent(i, { engagement_count: v || 0 })}
                  placeholder="0"
                />
              </Field>
              <Field label="Why it worked">
                <Input
                  value={item.why_it_worked}
                  onChange={(v) => updateTopContent(i, { why_it_worked: v })}
                  placeholder="Strong hook + real numbers"
                />
              </Field>
              <div className="flex items-end justify-between gap-2">
                <label className="text-xs text-[#A0AEC0] cursor-pointer hover:text-white transition">
                  Upload
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = reader.result;
                        if (typeof result === "string") {
                          updateTopContent(i, { screenshot_data_url: result });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const arr = (p.top_content || []).filter((_, j) => j !== i);
                    update({ top_content: arr });
                  }}
                  className="text-xs text-[#FF4D4D] hover:underline"
                >
                  Remove
                </button>
              </div>
              {item.screenshot_data_url && (
                <div className="md:col-span-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.screenshot_data_url}
                    alt={`${item.platform || "Top content"} screenshot`}
                    className="w-full max-w-md rounded-lg border border-[#252B35]"
                  />
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              update({
                top_content: [
                  ...(p.top_content || []),
                  { platform: "", engagement_count: 0, why_it_worked: "", screenshot_data_url: "" },
                ],
              })
            }
            className="text-xs text-[#00E5FF] hover:underline"
          >
            + Add top content item
          </button>
        </Section>

        {/* PPC */}
        <Section title="PPC">
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={!!p.ppc_enabled}
              onChange={(e) => update({ ppc_enabled: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-[#A0AEC0]">Campaign used PPC</span>
          </label>
          {p.ppc_enabled && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Impressions"><NumberInput value={p.impressions} onChange={(v) => update({ impressions: v })} placeholder="0" /></Field>
              <Field label="CTR (%)"><NumberInput value={p.ctr} onChange={(v) => update({ ctr: v })} placeholder="0.0" /></Field>
              <Field label="CPC ($)"><NumberInput value={p.cpc} onChange={(v) => update({ cpc: v })} placeholder="0.00" /></Field>
              <Field label="Video Views"><NumberInput value={p.video_views} onChange={(v) => update({ video_views: v })} placeholder="0" /></Field>
            </div>
          )}
        </Section>

        {/* Influencer */}
        <Section title="Influencer">
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={!!p.influencer_enabled}
              onChange={(e) => update({ influencer_enabled: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-[#A0AEC0]">Campaign used influencers</span>
          </label>
          {p.influencer_enabled && (
            <div className="grid grid-cols-3 gap-4">
              <Field label="Influencers Activated"><NumberInput value={p.influencers_activated} onChange={(v) => update({ influencers_activated: v })} placeholder="0" /></Field>
              <Field label="Influencer Reach"><NumberInput value={p.influencer_reach} onChange={(v) => update({ influencer_reach: v })} placeholder="0" /></Field>
              <Field label="Influencer Engagement"><NumberInput value={p.influencer_engagement} onChange={(v) => update({ influencer_engagement: v })} placeholder="0" /></Field>
            </div>
          )}
        </Section>

        {/* Market Impact */}
        <Section title="Market Impact">
          <p className="text-xs text-[#4A5568] mb-3">
            Qualitative bullets only — no stock-price claims (compliance).
          </p>
          {(p.market_impact_bullets || []).map((bullet, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <Input
                value={bullet}
                onChange={(v) => {
                  const arr = [...(p.market_impact_bullets || [])];
                  arr[i] = v;
                  update({ market_impact_bullets: arr });
                }}
                placeholder="Qualitative impact statement"
              />
              <button
                type="button"
                onClick={() => {
                  const arr = (p.market_impact_bullets || []).filter((_, j) => j !== i);
                  update({ market_impact_bullets: arr });
                }}
                className="text-xs text-[#FF4D4D] hover:underline shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              update({ market_impact_bullets: [...(p.market_impact_bullets || []), ""] })
            }
            className="text-xs text-[#00E5FF] hover:underline"
          >
            + Add bullet
          </button>
        </Section>

        {/* Next Steps */}
        <Section title="Next Steps">
          <Field label="CTA Text">
            <Input
              value={p.recommended_cta_text || ""}
              onChange={(v) => update({ recommended_cta_text: v })}
              placeholder="Recommended: Monthly Engagement ($25K)"
            />
          </Field>
          <div className="mt-4">
            <label className="block text-xs text-[#A0AEC0] mb-2">Action items</label>
            {(p.next_steps_bullets || []).map((bullet, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  value={bullet}
                  onChange={(v) => {
                    const arr = [...(p.next_steps_bullets || [])];
                    arr[i] = v;
                    update({ next_steps_bullets: arr });
                  }}
                  placeholder="Next step"
                />
                <button
                  type="button"
                  onClick={() => {
                    const arr = (p.next_steps_bullets || []).filter((_, j) => j !== i);
                    update({ next_steps_bullets: arr });
                  }}
                  className="text-xs text-[#FF4D4D] hover:underline shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                update({ next_steps_bullets: [...(p.next_steps_bullets || []), ""] })
              }
              className="text-xs text-[#00E5FF] hover:underline"
            >
              + Add step
            </button>
          </div>
        </Section>

        {/* Action bar */}
        <div className="sticky bottom-0 bg-[#0B0F14] border-t border-[#252B35] py-4 px-6 -mx-6 flex items-center justify-between gap-4">
          <div className="text-xs text-[#4A5568]">
            {saving ? "Saving..." : lastSaved ? `Auto-saved at ${lastSaved}` : ""}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                window.open(`/r/preview?reportId=${reportId}`, "_blank");
              }}
              className="px-4 py-2 text-sm border border-[#252B35] text-[#A0AEC0] rounded-lg hover:text-white hover:border-[#353B45] transition"
            >
              Preview
            </button>
            {publishedSlug ? (
              <a
                href={`/api/reports/${encodeURIComponent(publishedSlug)}/pdf`}
                className="px-4 py-2 text-sm border border-[#252B35] text-[#00E5FF] rounded-lg hover:border-[#353B45] transition inline-block"
              >
                Download PDF
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  window.open(`/r/preview?reportId=${reportId}&print=1`, "_blank");
                }}
                className="px-4 py-2 text-sm border border-[#252B35] text-[#A0AEC0] rounded-lg hover:text-white hover:border-[#353B45] transition"
              >
                Print to PDF (draft)
              </button>
            )}
            <button
              type="button"
              disabled={publishing}
              onClick={async () => {
                setPublishing(true);
                // Force save first
                await saveReportPayload(reportId, JSON.stringify(p));
                await saveReportMeta(reportId, meta);
                const slug = await publish(reportId);
                const url = `${window.location.origin}/r/${slug}`;
                await navigator.clipboard.writeText(url);
                alert(`Published! Link copied:\n${url}`);
                setPublishing(false);
                router.refresh();
              }}
              className="px-5 py-2 text-sm bg-[#00FF9D] text-[#0B0F14] font-semibold rounded-lg hover:bg-[#00E08A] disabled:opacity-50 transition"
            >
              {publishing ? "Publishing..." : "Publish & Copy Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
