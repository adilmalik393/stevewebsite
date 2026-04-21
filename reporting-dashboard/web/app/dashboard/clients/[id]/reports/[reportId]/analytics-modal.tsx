"use client";

import { useState, useEffect } from "react";

const FLAG_BASE = "https://flagcdn.com/16x12";

interface AnalyticsStats {
  total: number;
  byCountry: { country: string | null; country_code: string | null; views: number }[];
  recentViews: { viewed_at: string; country: string | null; city: string | null }[];
}

export function AnalyticsModal({ reportId }: { reportId: string }) {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/reports/${reportId}/analytics`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, [open, reportId]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="View analytics"
        className="shrink-0 flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        Analytics
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-overlay)] shadow-2xl overflow-hidden"
            style={{ maxHeight: "85vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-strong)] bg-[var(--section-header)]">
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Report Analytics
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[var(--text-faint)] hover:text-[var(--text-primary)] text-lg leading-none px-1 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-5" style={{ maxHeight: "calc(85vh - 52px)" }}>
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                </div>
              )}

              {!loading && stats && (
                <>
                  {/* Stats cards */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] p-3.5">
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Views</p>
                      <p className="text-2xl font-bold text-[var(--accent)] tabular-nums">{stats.total}</p>
                    </div>
                    <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] p-3.5">
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Countries</p>
                      <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                        {stats.byCountry.filter((c) => c.country).length}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] p-3.5">
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Top Country</p>
                      {stats.byCountry.length > 0 && stats.byCountry[0].country ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          {stats.byCountry[0].country_code && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`${FLAG_BASE}/${stats.byCountry[0].country_code.toLowerCase()}.png`}
                              alt={stats.byCountry[0].country ?? ""}
                              width={14}
                              height={10}
                              className="rounded-sm shrink-0"
                            />
                          )}
                          <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                            {stats.byCountry[0].country}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--text-faint)] mt-1">—</p>
                      )}
                    </div>
                  </div>

                  {/* Country breakdown */}
                  {stats.byCountry.length > 0 && (
                    <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] overflow-hidden mb-3">
                      <div className="px-4 py-2.5 border-b border-[var(--border-strong)] bg-[var(--section-header)]">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Views by Country</p>
                      </div>
                      <div className="divide-y divide-[var(--border-strong)]">
                        {stats.byCountry.map((row, i) => {
                          const pct = stats.total > 0 ? Math.round((row.views / stats.total) * 100) : 0;
                          return (
                            <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                              {row.country_code ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={`${FLAG_BASE}/${row.country_code.toLowerCase()}.png`}
                                  alt={row.country ?? ""}
                                  width={16}
                                  height={12}
                                  className="rounded-sm shrink-0"
                                />
                              ) : (
                                <div className="w-4 h-3 rounded-sm bg-[var(--border)] shrink-0" />
                              )}
                              <span className="text-sm text-[var(--text-primary)] flex-1 min-w-0 truncate">
                                {row.country ?? "Unknown"}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="w-20 h-1.5 rounded-full bg-[var(--border-strong)] overflow-hidden">
                                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-[var(--text-muted)] w-6 text-right tabular-nums">{row.views}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recent views */}
                  {stats.recentViews.length > 0 && (
                    <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-[var(--border-strong)] bg-[var(--section-header)]">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Recent Views</p>
                      </div>
                      <div className="divide-y divide-[var(--border-strong)]">
                        {stats.recentViews.map((v, i) => (
                          <div key={i} className="px-4 py-2 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-faint)] shrink-0">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="2" y1="12" x2="22" y2="12"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                              </svg>
                              <span className="text-xs text-[var(--text-secondary)] truncate">
                                {v.country ?? "Unknown"}{v.city ? `, ${v.city}` : ""}
                              </span>
                            </div>
                            <span className="text-[10px] text-[var(--text-faint)] shrink-0">
                              {new Date(v.viewed_at).toLocaleString(undefined, {
                                month: "short", day: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stats.total === 0 && (
                    <p className="text-xs text-[var(--text-faint)] text-center py-8">
                      No views yet — share the report link to start tracking.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
