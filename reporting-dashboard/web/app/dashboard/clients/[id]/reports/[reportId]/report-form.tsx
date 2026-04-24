"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { publish } from "../../../../actions";
import type { ReportPayload } from "@/lib/db";

function SectionSvgIcon({ id, className = "" }: { id: string; className?: string }) {
  const cls = `w-4 h-4 shrink-0 ${className}`;
  const icons: Record<string, React.ReactNode> = {
    "cover": (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    "executive-summary": (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    "signal-score": (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    "content-deployment": (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    "distribution": (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2"/>
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
      </svg>
    ),
    "engagement": (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    "top-content": (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    "ppc": (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    "influencer": (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    "market-impact": (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    "next-steps": (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </svg>
    ),
    "signal-analysis": (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
    ),
    "pr-rewrite": (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="15" y2="17"/>
      </svg>
    ),
    "next-pr-guidance": (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  };
  return <>{icons[id] ?? null}</>;
}

const SECTIONS = [
  { id: "cover",              label: "Cover" },
  { id: "executive-summary",  label: "Executive Summary" },
  { id: "signal-score",       label: "Signal Score" },
  { id: "pr-rewrite",         label: "PR Rewrite" },
  { id: "content-deployment", label: "Content Deployment" },
  { id: "top-content",        label: "Top Content" },
  { id: "distribution",       label: "Distribution" },
  { id: "ppc",                label: "PPC" },
  { id: "influencer",         label: "Influencer" },
  { id: "market-impact",      label: "Market Impact" },
  { id: "engagement",         label: "Engagement" },
  { id: "next-steps",         label: "Next Steps" },
  { id: "signal-analysis",    label: "Signal Analysis" },
  { id: "next-pr-guidance",   label: "Next PR Guidance" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function Section({
  id,
  title,
  children,
  accent = false,
}: {
  id: string;
  title: string;
  icon?: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      id={id}
      className={`rounded-2xl border mb-6 overflow-hidden ${
        accent
          ? "border-[var(--accent-border)] bg-[var(--bg-card)]"
          : "border-[var(--border-strong)] bg-[var(--bg-card)]"
      }`}
    >
      <div
        className={`px-6 py-4 border-b flex items-center gap-3 ${
          accent
            ? "border-[var(--accent-border-sm)] bg-[var(--accent-bg-sub)]"
            : "border-[var(--border-strong)] bg-[var(--section-header)]"
        }`}
      >
        <span className={accent ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}>
          <SectionSvgIcon id={id} />
        </span>
        <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-wide uppercase">
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
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
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-[var(--text-faint)] mt-1">{hint}</p>}
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
      className="w-full px-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border-strong)] rounded-xl text-[var(--text-primary)] text-sm placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-bg)] transition-all"
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
      className="w-full px-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border-strong)] rounded-xl text-[var(--text-primary)] text-sm placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-bg)] transition-all"
    />
  );
}

function StatCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-strong)] rounded-xl p-4 space-y-2">
      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{label}</p>
      {children}
    </div>
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
    <div className="grid grid-cols-3 gap-3 items-center p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-strong)]">
      <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
      <div className="relative">
        <NumberInput value={before} onChange={onBeforeChange} placeholder="Before" />
      </div>
      <div className="relative">
        <NumberInput value={after} onChange={onAfterChange} placeholder="After" />
      </div>
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
  publishedSlug?: string | null;
  initialMeta: { campaign_name: string; campaign_start: string; campaign_end: string };
  initialPayload: ReportPayload;
}) {
  const [meta, setMeta] = useState(initialMeta);
  const [p, setP] = useState<ReportPayload>({
    prepared_by: "EDM Media",
    signal_score_enabled: false,
    content_deployment_enabled: false,
    distribution_enabled: false,
    engagement_enabled: false,
    market_impact_enabled: false,
    next_steps_enabled: false,
    market_impact_bullets: [],
    recommended_cta_text: "",
    next_steps_bullets: [],
    ...initialPayload,
  });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("cover");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const update = useCallback((patch: Partial<ReportPayload>) => {
    setP((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateTopContent = useCallback(
    (
      index: number,
      patch: {
        platform?: string;
        engagement_count?: number;
        why_it_worked?: string;
        content_url?: string;
        screenshot_data_url?: string;
      }
    ) => {
      const arr = [...(p.top_content || [])];
      arr[index] = { ...arr[index], ...patch };
      update({ top_content: arr });
    },
    [p.top_content, update]
  );

  const persistDraft = useCallback(
    async (payload: ReportPayload, nextMeta: typeof meta) => {
      const res = await fetch(`/api/report-drafts/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: JSON.stringify(payload),
          meta: nextMeta,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to save draft (${res.status})`);
      }
    },
    [reportId]
  );

  const copyPublishedLink = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert(`Published! Link copied:\n${url}`);
    } catch {
      window.prompt("Published! Copy link manually:", url);
    }
  }, []);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await persistDraft(p, meta);
        setLastSaved(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Auto-save failed", err);
      } finally {
        setSaving(false);
      }
    }, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [p, meta, persistDraft]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-[var(--border-strong)] bg-[var(--bg-overlay)] sticky top-0 h-screen">
        <div className="p-4 border-b border-[var(--border-strong)]">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Sections
          </p>
          <p className="text-xs text-[var(--text-faint)]">
            {saving ? (
              <span className="text-[var(--accent)]">Saving…</span>
            ) : lastSaved ? (
              <span className="text-[var(--success)]">✓ Saved {lastSaved}</span>
            ) : (
              "Auto-saves on edit"
            )}
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-0.5">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id)}
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                    activeSection === s.id
                      ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border-sm)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  <span className={activeSection === s.id ? "text-[var(--accent)]" : "text-[var(--text-faint)] group-hover:text-[var(--text-muted)]"}>
                    <SectionSvgIcon id={s.id} />
                  </span>
                  <span className="text-xs font-medium">{s.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-3 border-t border-[var(--border-strong)]">
          <a
            href={`/dashboard/clients/${clientId}`}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to client
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">

          {/* Cover */}
          <Section id="cover" title="Cover" accent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Campaign Name">
                <Input
                  value={meta.campaign_name}
                  onChange={(v) => setMeta({ ...meta, campaign_name: v })}
                  placeholder="Q1 2026 Signal Campaign"
                />
              </Field>
              <Field label="Prepared By">
                <Input
                  value={p.prepared_by || ""}
                  onChange={(v) => update({ prepared_by: v })}
                  placeholder="EDM Media"
                />
              </Field>
              <Field label="Campaign Start">
                <Input
                  type="date"
                  value={meta.campaign_start}
                  onChange={(v) => setMeta({ ...meta, campaign_start: v })}
                />
              </Field>
              <Field label="Campaign End">
                <Input
                  type="date"
                  value={meta.campaign_end}
                  onChange={(v) => setMeta({ ...meta, campaign_end: v })}
                />
              </Field>
            </div>
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-[var(--accent-bg-sub)] border border-[var(--accent-border-sm)]">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center text-[var(--accent)] text-sm font-bold">
                {companyName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{companyName}</p>
                {ticker && (
                  <p className="text-xs text-[var(--accent)]">${ticker}</p>
                )}
              </div>
            </div>
          </Section>

          {/* Executive Summary */}
          <Section id="executive-summary" title="Executive Summary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Field label="Algo Sentiment Bias">
                <Input
                  value={p.algo_sentiment_bias || ""}
                  onChange={(v) => update({ algo_sentiment_bias: v })}
                  placeholder="Strong Positive"
                />
              </Field>
              <Field label="Campaign Type">
                <Input
                  value={p.campaign_type || ""}
                  onChange={(v) => update({ campaign_type: v })}
                  placeholder="Revenue-validation + government pipeline"
                />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Total Reach">
                <NumberInput
                  value={p.total_reach}
                  onChange={(v) => update({ total_reach: v })}
                  placeholder="0"
                />
              </StatCard>
              <StatCard label="Total Engagements">
                <NumberInput
                  value={p.total_engagements}
                  onChange={(v) => update({ total_engagements: v })}
                  placeholder="0"
                />
              </StatCard>
              <StatCard label="Assets Deployed">
                <NumberInput
                  value={p.assets_deployed}
                  onChange={(v) => update({ assets_deployed: v })}
                  placeholder="0"
                />
              </StatCard>
            </div>
          </Section>

          {/* Signal Score */}
          <Section id="signal-score" title="Signal Score" accent>
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-strong)] cursor-pointer hover:border-[var(--accent-border-sm)] transition-all mb-4">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  p.signal_score_enabled !== false ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    p.signal_score_enabled !== false ? "translate-x-5" : "translate-x-1"
                  }`}
                />
                <input
                  type="checkbox"
                  checked={p.signal_score_enabled !== false}
                  onChange={(e) => update({ signal_score_enabled: e.target.checked })}
                  className="sr-only"
                />
              </div>
              <span className="text-sm text-[var(--text-secondary)]">Include Signal Score section</span>
            </label>
            {p.signal_score_enabled !== false && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-strong)] text-center space-y-2">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Score Before</p>
                    <NumberInput
                      value={p.signal_score_before}
                      onChange={(v) => update({ signal_score_before: v })}
                      placeholder="32"
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--accent-bg-sub)] border border-[var(--accent-border)] text-center space-y-2">
                    <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">Score After</p>
                    <NumberInput
                      value={p.signal_score_after}
                      onChange={(v) => update({ signal_score_after: v })}
                      placeholder="86"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-3 px-3 py-2">
                    <span className="text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-wider">Axis</span>
                    <span className="text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-wider">Before</span>
                    <span className="text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-wider">After</span>
                  </div>
                  <BeforeAfterRow
                    label="Execution"
                    before={p.execution_before}
                    after={p.execution_after}
                    onBeforeChange={(v) => update({ execution_before: v })}
                    onAfterChange={(v) => update({ execution_after: v })}
                  />
                  <BeforeAfterRow
                    label="Clarity"
                    before={p.clarity_before}
                    after={p.clarity_after}
                    onBeforeChange={(v) => update({ clarity_before: v })}
                    onAfterChange={(v) => update({ clarity_after: v })}
                  />
                  <BeforeAfterRow
                    label="Distribution"
                    before={p.distribution_before}
                    after={p.distribution_after}
                    onBeforeChange={(v) => update({ distribution_before: v })}
                    onAfterChange={(v) => update({ distribution_after: v })}
                  />
                  <BeforeAfterRow
                    label="Engagement"
                    before={p.engagement_axis_before}
                    after={p.engagement_axis_after}
                    onBeforeChange={(v) => update({ engagement_axis_before: v })}
                    onAfterChange={(v) => update({ engagement_axis_after: v })}
                  />
                </div>
              </>
            )}
          </Section>

          {/* PR Rewrite & Message Upgrade */}
          <Section id="pr-rewrite" title="PR Rewrite & Message Upgrade" accent>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Compare original PR language with the upgraded EDM Signal rewrite.
            </p>
            <div className="space-y-4">
              {(p.pr_rewrite_pairs || []).map((pair, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-base)] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Rewrite Pair #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          pr_rewrite_pairs: (p.pr_rewrite_pairs || []).filter((_, j) => j !== i),
                        })
                      }
                      className="text-xs text-[var(--text-faint)] hover:text-[var(--danger)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--danger-bg)]"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Original PR Language">
                      <textarea
                        value={pair.original || ""}
                        onChange={(e) => {
                          const arr = [...(p.pr_rewrite_pairs || [])];
                          arr[i] = { ...arr[i], original: e.target.value };
                          update({ pr_rewrite_pairs: arr });
                        }}
                        rows={4}
                        placeholder="Paste representative excerpt from original press release"
                        className="w-full px-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border-strong)] rounded-xl text-[var(--text-primary)] text-sm placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-bg)] transition-all resize-none"
                      />
                    </Field>
                    <Field label="EDM Signal Rewrite">
                      <textarea
                        value={pair.rewrite || ""}
                        onChange={(e) => {
                          const arr = [...(p.pr_rewrite_pairs || [])];
                          arr[i] = { ...arr[i], rewrite: e.target.value };
                          update({ pr_rewrite_pairs: arr });
                        }}
                        rows={4}
                        placeholder="Insert upgraded rewrite with clear execution and market relevance"
                        className="w-full px-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border-strong)] rounded-xl text-[var(--text-primary)] text-sm placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-bg)] transition-all resize-none"
                      />
                    </Field>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  update({
                    pr_rewrite_pairs: [...(p.pr_rewrite_pairs || []), { original: "", rewrite: "" }],
                  })
                }
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all w-full justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add rewrite pair
              </button>
            </div>

            <div className="mt-5 space-y-2">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                Message Improvement Notes
              </p>
              {(p.message_improvement_notes || []).map((note, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-[var(--accent)] text-xs shrink-0">•</span>
                  <div className="flex-1">
                    <Input
                      value={note}
                      onChange={(v) => {
                        const arr = [...(p.message_improvement_notes || [])];
                        arr[i] = v;
                        update({ message_improvement_notes: arr });
                      }}
                      placeholder="What improved in the rewrite and why it is stronger"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        message_improvement_notes: (p.message_improvement_notes || []).filter((_, j) => j !== i),
                      })
                    }
                    className="text-xs text-[var(--text-faint)] hover:text-[var(--danger)] transition-colors p-1.5 rounded-lg hover:bg-[var(--danger-bg)] shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  update({ message_improvement_notes: [...(p.message_improvement_notes || []), ""] })
                }
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all w-full justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add note
              </button>
            </div>
          </Section>

          {/* Content Deployment */}
          <Section id="content-deployment" title="Content Deployment">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-strong)] cursor-pointer hover:border-[var(--accent-border-sm)] transition-all mb-4">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  p.content_deployment_enabled !== false ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    p.content_deployment_enabled !== false ? "translate-x-5" : "translate-x-1"
                  }`}
                />
                <input
                  type="checkbox"
                  checked={p.content_deployment_enabled !== false}
                  onChange={(e) => update({ content_deployment_enabled: e.target.checked })}
                  className="sr-only"
                />
              </div>
              <span className="text-sm text-[var(--text-secondary)]">Include Content Deployment section</span>
            </label>
            {p.content_deployment_enabled !== false && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Platforms</p>
                  {(p.content_deployment_platforms || []).map((row, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-base)] p-3 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                          Platform #{i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            update({
                              content_deployment_platforms: (p.content_deployment_platforms || []).filter((_, j) => j !== i),
                            })
                          }
                          className="text-xs text-[var(--text-faint)] hover:text-[var(--danger)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--danger-bg)]"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Field label="Platform Name">
                          <Input
                            value={row.platform || ""}
                            onChange={(v) => {
                              const arr = [...(p.content_deployment_platforms || [])];
                              arr[i] = { ...arr[i], platform: v };
                              update({ content_deployment_platforms: arr });
                            }}
                            placeholder="Medium"
                          />
                        </Field>
                        <Field label="Count">
                          <NumberInput
                            value={row.count}
                            onChange={(v) => {
                              const arr = [...(p.content_deployment_platforms || [])];
                              arr[i] = { ...arr[i], count: v };
                              update({ content_deployment_platforms: arr });
                            }}
                            placeholder="0"
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        content_deployment_platforms: [
                          ...(p.content_deployment_platforms || []),
                          { platform: "", count: undefined },
                        ],
                      })
                    }
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all w-full justify-center"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add platform
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* Distribution */}
          <Section id="distribution" title="Distribution">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-strong)] cursor-pointer hover:border-[var(--accent-border-sm)] transition-all mb-4">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  p.distribution_enabled !== false ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    p.distribution_enabled !== false ? "translate-x-5" : "translate-x-1"
                  }`}
                />
                <input
                  type="checkbox"
                  checked={p.distribution_enabled !== false}
                  onChange={(e) => update({ distribution_enabled: e.target.checked })}
                  className="sr-only"
                />
              </div>
              <span className="text-sm text-[var(--text-secondary)]">Include Distribution section</span>
            </label>
            {p.distribution_enabled !== false && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    Distribution Platforms
                  </p>
                  {(p.distribution_channels || []).map((row, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-base)] p-3 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                          Platform #{i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            update({
                              distribution_channels: (p.distribution_channels || []).filter((_, j) => j !== i),
                            })
                          }
                          className="text-xs text-[var(--text-faint)] hover:text-[var(--danger)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--danger-bg)]"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <Field label="Platform Name">
                          <Input
                            value={row.platform || ""}
                            onChange={(v) => {
                              const arr = [...(p.distribution_channels || [])];
                              arr[i] = { ...arr[i], platform: v };
                              update({ distribution_channels: arr });
                            }}
                            placeholder="YouTube"
                          />
                        </Field>
                        <Field label="Reach Number">
                          <NumberInput
                            value={row.reach}
                            onChange={(v) => {
                              const arr = [...(p.distribution_channels || [])];
                              arr[i] = { ...arr[i], reach: v };
                              update({ distribution_channels: arr });
                            }}
                            placeholder="0"
                          />
                        </Field>
                        <Field label="Link">
                          <Input
                            value={row.link || ""}
                            onChange={(v) => {
                              const arr = [...(p.distribution_channels || [])];
                              arr[i] = { ...arr[i], link: v };
                              update({ distribution_channels: arr });
                            }}
                            placeholder="https://..."
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        distribution_channels: [
                          ...(p.distribution_channels || []),
                          { platform: "", reach: undefined, link: "" },
                        ],
                      })
                    }
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all w-full justify-center"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add custom platform
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* Top Content */}
          <Section id="top-content" title="Top Content">
            <div className="space-y-4">
              {(p.top_content || []).map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-strong)] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Item #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        update({ top_content: (p.top_content || []).filter((_, j) => j !== i) });
                      }}
                      className="text-xs text-[var(--text-faint)] hover:text-[var(--danger)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--danger-bg)]"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  </div>
                  <Field label="Why It Worked">
                    <textarea
                      value={item.why_it_worked}
                      onChange={(e) => updateTopContent(i, { why_it_worked: e.target.value })}
                      placeholder="Strong hook + real numbers"
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border-strong)] rounded-xl text-[var(--text-primary)] text-sm placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-bg)] transition-all resize-none"
                    />
                  </Field>
                  <Field label="Content Link (optional)" hint="Link to the post or article">
                    <Input
                      value={item.content_url || ""}
                      onChange={(v) => updateTopContent(i, { content_url: v })}
                      placeholder="https://x.com/..."
                    />
                  </Field>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-border-sm)] cursor-pointer transition-all">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                      Upload Screenshot
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === "string") {
                              updateTopContent(i, { screenshot_data_url: reader.result });
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {item.screenshot_data_url && (
                      <span className="text-xs text-[var(--success)]">✓ Image attached</span>
                    )}
                  </div>
                  {item.screenshot_data_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.screenshot_data_url}
                      alt={`${item.platform || "Top content"} screenshot`}
                      className="w-full max-w-md rounded-xl border border-[var(--border-strong)]"
                    />
                  )}
                </div>
              ))}
            </div>
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
              className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all w-full justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add content item
            </button>
          </Section>

          {/* PPC */}
          <Section id="ppc" title="PPC">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-strong)] cursor-pointer hover:border-[var(--accent-border-sm)] transition-all mb-4">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  p.ppc_enabled ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    p.ppc_enabled ? "translate-x-5" : "translate-x-1"
                  }`}
                />
                <input
                  type="checkbox"
                  checked={!!p.ppc_enabled}
                  onChange={(e) => update({ ppc_enabled: e.target.checked })}
                  className="sr-only"
                />
              </div>
              <span className="text-sm text-[var(--text-secondary)]">Campaign used PPC</span>
            </label>
            {p.ppc_enabled && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Impressions", key: "impressions" as const },
                  { label: "CTR (%)", key: "ctr" as const },
                  { label: "CPC ($)", key: "cpc" as const },
                  { label: "Video Views", key: "video_views" as const },
                ].map(({ label, key }) => (
                  <StatCard key={key} label={label}>
                    <NumberInput
                      value={p[key] as number | undefined}
                      onChange={(v) => update({ [key]: v })}
                      placeholder="0"
                    />
                  </StatCard>
                ))}
              </div>
            )}
          </Section>

          {/* Influencer */}
          <Section id="influencer" title="Influencer">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-strong)] cursor-pointer hover:border-[var(--accent-border-sm)] transition-all mb-4">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  p.influencer_enabled ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    p.influencer_enabled ? "translate-x-5" : "translate-x-1"
                  }`}
                />
                <input
                  type="checkbox"
                  checked={!!p.influencer_enabled}
                  onChange={(e) => update({ influencer_enabled: e.target.checked })}
                  className="sr-only"
                />
              </div>
              <span className="text-sm text-[var(--text-secondary)]">Campaign used influencers</span>
            </label>
            {p.influencer_enabled && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Influencers Activated", key: "influencers_activated" as const },
                  { label: "Influencer Reach", key: "influencer_reach" as const },
                  { label: "Influencer Engagement", key: "influencer_engagement" as const },
                ].map(({ label, key }) => (
                  <StatCard key={key} label={label}>
                    <NumberInput
                      value={p[key] as number | undefined}
                      onChange={(v) => update({ [key]: v })}
                      placeholder="0"
                    />
                  </StatCard>
                ))}
              </div>
            )}
          </Section>

          {/* Market Impact */}
          <Section id="market-impact" title="Market Impact">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-strong)] cursor-pointer hover:border-[var(--accent-border-sm)] transition-all mb-4">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  p.market_impact_enabled !== false ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    p.market_impact_enabled !== false ? "translate-x-5" : "translate-x-1"
                  }`}
                />
                <input
                  type="checkbox"
                  checked={p.market_impact_enabled !== false}
                  onChange={(e) => update({ market_impact_enabled: e.target.checked })}
                  className="sr-only"
                />
              </div>
              <span className="text-sm text-[var(--text-secondary)]">Include Market Impact section</span>
            </label>
            {p.market_impact_enabled !== false && (
              <>
                <p className="text-xs text-[var(--text-faint)] mb-4 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--danger-bg)] text-[var(--danger)] font-semibold">COMPLIANCE</span>
                  Qualitative bullets only — no stock-price claims
                </p>
                <div className="space-y-2">
                  {(p.market_impact_bullets || []).map((bullet, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0 mt-2.5" />
                      <div className="flex-1">
                        <Input
                          value={bullet}
                          onChange={(v) => {
                            const arr = [...(p.market_impact_bullets || [])];
                            arr[i] = v;
                            update({ market_impact_bullets: arr });
                          }}
                          placeholder="Qualitative impact statement"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          update({
                            market_impact_bullets: (p.market_impact_bullets || []).filter(
                              (_, j) => j !== i
                            ),
                          });
                        }}
                        className="text-xs text-[var(--text-faint)] hover:text-[var(--danger)] transition-colors p-1.5 rounded-lg hover:bg-[var(--danger-bg)] shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    update({ market_impact_bullets: [...(p.market_impact_bullets || []), ""] })
                  }
                  className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all w-full justify-center"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add bullet
                </button>
              </>
            )}
          </Section>

          {/* Engagement */}
          <Section id="engagement" title="Engagement">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-strong)] cursor-pointer hover:border-[var(--accent-border-sm)] transition-all mb-4">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  p.engagement_enabled !== false ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    p.engagement_enabled !== false ? "translate-x-5" : "translate-x-1"
                  }`}
                />
                <input
                  type="checkbox"
                  checked={p.engagement_enabled !== false}
                  onChange={(e) => update({ engagement_enabled: e.target.checked })}
                  className="sr-only"
                />
              </div>
              <span className="text-sm text-[var(--text-secondary)]">Include Engagement section</span>
            </label>
            {p.engagement_enabled !== false && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Likes", key: "likes" as const },
                  { label: "Comments", key: "comments" as const },
                  { label: "Shares", key: "shares" as const },
                  { label: "Clicks", key: "clicks" as const },
                ].map(({ label, key }) => (
                  <StatCard key={key} label={label}>
                    <NumberInput
                      value={p[key] as number | undefined}
                      onChange={(v) => update({ [key]: v })}
                      placeholder="0"
                    />
                  </StatCard>
                ))}
              </div>
            )}
          </Section>

          {/* Next Steps */}
          <Section id="next-steps" title="Next Steps">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-strong)] cursor-pointer hover:border-[var(--accent-border-sm)] transition-all mb-4">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  p.next_steps_enabled !== false ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    p.next_steps_enabled !== false ? "translate-x-5" : "translate-x-1"
                  }`}
                />
                <input
                  type="checkbox"
                  checked={p.next_steps_enabled !== false}
                  onChange={(e) => update({ next_steps_enabled: e.target.checked })}
                  className="sr-only"
                />
              </div>
              <span className="text-sm text-[var(--text-secondary)]">Include Next Steps section</span>
            </label>
            {p.next_steps_enabled !== false && (
              <>
                <Field label="CTA Text">
                  <Input
                    value={p.recommended_cta_text || ""}
                    onChange={(v) => update({ recommended_cta_text: v })}
                    placeholder="Recommended: Monthly Engagement ($25K)"
                  />
                </Field>
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    Action Items
                  </p>
                  {(p.next_steps_bullets || []).map((bullet, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-[var(--success)] text-xs font-bold shrink-0 w-5 text-center">
                        {i + 1}.
                      </span>
                      <div className="flex-1">
                        <Input
                          value={bullet}
                          onChange={(v) => {
                            const arr = [...(p.next_steps_bullets || [])];
                            arr[i] = v;
                            update({ next_steps_bullets: arr });
                          }}
                          placeholder="Next step"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          update({
                            next_steps_bullets: (p.next_steps_bullets || []).filter(
                              (_, j) => j !== i
                            ),
                          });
                        }}
                        className="text-xs text-[var(--text-faint)] hover:text-[var(--danger)] transition-colors p-1.5 rounded-lg hover:bg-[var(--danger-bg)] shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      update({ next_steps_bullets: [...(p.next_steps_bullets || []), ""] })
                    }
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all w-full justify-center"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add step
                  </button>
                </div>
              </>
            )}
          </Section>

          {/* Signal Analysis */}
          <Section id="signal-analysis" title="Signal Analysis" accent>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              Explain why this PR scores well — bullet points shown on the report
            </p>
            <div className="space-y-2">
              {(p.pr_score_bullets || []).map((bullet, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-[var(--accent)] text-xs shrink-0">•</span>
                  <div className="flex-1">
                    <Input
                      value={bullet}
                      onChange={(v) => {
                        const arr = [...(p.pr_score_bullets || [])];
                        arr[i] = v;
                        update({ pr_score_bullets: arr });
                      }}
                      placeholder="$400,000 in new IoT contracts"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => update({ pr_score_bullets: (p.pr_score_bullets || []).filter((_, j) => j !== i) })}
                    className="text-xs text-[var(--text-faint)] hover:text-[var(--danger)] transition-colors p-1.5 rounded-lg hover:bg-[var(--danger-bg)] shrink-0"
                  >×</button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => update({ pr_score_bullets: [...(p.pr_score_bullets || []), ""] })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all w-full justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                Add bullet
              </button>
            </div>
          </Section>

          {/* Next PR Guidance */}
          <Section id="next-pr-guidance" title="Next PR Guidance">
            <p className="text-xs text-[var(--text-muted)] mb-3">
              What should the next press release ideally include to raise the signal score?
            </p>
            <div className="space-y-2">
              {(p.next_pr_bullets || []).map((bullet, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-[var(--success)] text-xs shrink-0">•</span>
                  <div className="flex-1">
                    <Input
                      value={bullet}
                      onChange={(v) => {
                        const arr = [...(p.next_pr_bullets || [])];
                        arr[i] = v;
                        update({ next_pr_bullets: arr });
                      }}
                      placeholder="Additional contract wins with exact values"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => update({ next_pr_bullets: (p.next_pr_bullets || []).filter((_, j) => j !== i) })}
                    className="text-xs text-[var(--text-faint)] hover:text-[var(--danger)] transition-colors p-1.5 rounded-lg hover:bg-[var(--danger-bg)] shrink-0"
                  >×</button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => update({ next_pr_bullets: [...(p.next_pr_bullets || []), ""] })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all w-full justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                Add bullet
              </button>
            </div>
          </Section>

          {/* Bottom padding */}
          <div className="h-24" />
        </div>

        {/* Sticky action bar */}
        <div className="fixed bottom-0 left-56 right-0 z-30 bg-[var(--bg-overlay)]/95 backdrop-blur border-t border-[var(--border-strong)] px-6 py-3 flex items-center justify-between gap-4">
          <div className="text-xs text-[var(--text-faint)]">
            {saving ? (
              <span className="text-[var(--accent)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                Saving…
              </span>
            ) : lastSaved ? (
              <span className="text-[var(--success)]">✓ Auto-saved {lastSaved}</span>
            ) : (
              "Auto-saves on edit"
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.open(`/r/preview?reportId=${reportId}`, "_blank")}
              className="px-4 py-2 text-xs font-medium border border-[var(--border-strong)] text-[var(--text-muted)] rounded-xl hover:text-[var(--text-primary)] hover:border-[var(--hover-border)] transition-all"
            >
              Preview
            </button>
            {publishedSlug ? (
              <a
                href={`/api/reports/${encodeURIComponent(publishedSlug)}/pdf`}
                className="px-4 py-2 text-xs font-medium border border-[var(--border-strong)] text-[var(--accent)] rounded-xl hover:border-[var(--accent-border)] transition-all inline-block"
              >
                Download PDF
              </a>
            ) : (
              <button
                type="button"
                onClick={() =>
                  window.open(`/r/preview?reportId=${reportId}&print=1`, "_blank")
                }
                className="px-4 py-2 text-xs font-medium border border-[var(--border-strong)] text-[var(--text-muted)] rounded-xl hover:text-[var(--text-primary)] hover:border-[var(--hover-border)] transition-all"
              >
                Print to PDF
              </button>
            )}
            <button
              type="button"
              disabled={publishing}
              onClick={async () => {
                setPublishing(true);
                try {
                  await persistDraft(p, meta);
                  const slug = await publish(reportId);
                  const url = `${window.location.origin}/r/${slug}`;
                  await copyPublishedLink(url);
                  router.refresh();
                } finally {
                  setPublishing(false);
                }
              }}
              className="px-5 py-2 text-xs font-bold bg-[var(--success)] text-[var(--bg-base)] rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {publishing ? "Publishing…" : "Publish & Copy Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
