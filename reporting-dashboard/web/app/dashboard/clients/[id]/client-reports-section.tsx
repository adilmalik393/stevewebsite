"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { addReport, removeReport } from "../../actions";
import { DuplicateButton, PublishButton } from "./report-actions";
import { IconDelete, IconView, iconClass } from "./report-icons";

export type ReportListItem = {
  id: string;
  campaign_name: string;
  campaign_start: string | null;
  campaign_end: string | null;
  status: string;
  slug: string | null;
  view_count?: number;
};

type StatusFilter = "all" | "draft" | "published";

function CreateReportSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-[var(--accent)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--accent-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition"
    >
      {pending ? "Creating..." : "Create report"}
    </button>
  );
}

export function ClientReportsSection({
  clientId,
  reports,
}: {
  clientId: string;
  reports: ReportListItem[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      const name = (r.campaign_name || "").toLowerCase();
      const dates = `${r.campaign_start ?? ""} ${r.campaign_end ?? ""}`.toLowerCase();
      return name.includes(q) || dates.includes(q) || r.status.includes(q);
    });
  }, [reports, search, statusFilter]);

  const closeCreate = useCallback(() => setCreateOpen(false), []);

  useEffect(() => {
    if (!createOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCreate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [createOpen, closeCreate]);

  useEffect(() => {
    if (!filterOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [filterOpen]);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reports…"
          className="flex-1 min-w-0 px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--accent)] transition"
          aria-label="Search reports"
        />
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2.5 bg-[var(--accent)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--accent-hover)] transition whitespace-nowrap"
          >
            Create report
          </button>
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition whitespace-nowrap ${
                filterOpen || statusFilter !== "all"
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-bg)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--hover-border)] bg-[var(--bg-surface)]"
              }`}
            >
              Filter
            </button>
            {filterOpen && (
              <div
                className="absolute right-0 top-full mt-2 z-40 min-w-[180px] rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] py-1 shadow-xl"
                role="menu"
              >
                {(
                  [
                    ["all", "All reports"],
                    ["draft", "Draft only"],
                    ["published", "Published only"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setStatusFilter(value);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm transition ${
                      statusFilter === value
                        ? "text-[var(--accent)] bg-[var(--accent-bg)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Reports</h2>
      {reports.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-12 text-center">
          <p className="text-[var(--text-faint)]">No reports yet. Create one with Create report.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-12 text-center">
          <p className="text-[var(--text-faint)]">No reports match your search or filter.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex items-center justify-between hover:border-[var(--hover-border)] transition"
            >
              <Link href={`/dashboard/clients/${clientId}/reports/${report.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-[var(--text-primary)] truncate">
                    {report.campaign_name || "Untitled"}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${
                      report.status === "published"
                        ? "bg-[var(--success-bg)] text-[var(--success)]"
                        : "text-[var(--text-faint)]"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-faint)] mt-1 flex items-center gap-3">
                  <span>
                    {report.campaign_start || "No dates"}{" "}
                    {report.campaign_end ? `→ ${report.campaign_end}` : ""}
                  </span>
                  {report.status === "published" && (
                    <span className="flex items-center gap-1 text-[var(--text-muted)]">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      {report.view_count ?? 0}
                    </span>
                  )}
                </p>
              </Link>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {report.slug && report.status === "published" && (
                  <Link
                    href={`/r/${report.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--accent)] border border-transparent hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border-sm)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                    title="View public report"
                    aria-label="View public report"
                  >
                    <IconView className={iconClass()} />
                  </Link>
                )}
                <PublishButton reportId={report.id} status={report.status} />
                <DuplicateButton reportId={report.id} clientId={clientId} />
                <form action={removeReport}>
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="clientId" value={clientId} />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--text-faint)] border border-transparent hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] hover:border-[var(--danger-border)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]"
                    title="Delete"
                    aria-label="Delete"
                  >
                    <IconDelete className={iconClass()} />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCreate();
          }}
        >
          <div
            className="w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-report-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3
                id="new-report-title"
                className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
              >
                New campaign report
              </h3>
              <button
                type="button"
                onClick={closeCreate}
                className="text-[var(--text-faint)] hover:text-[var(--text-primary)] text-lg leading-none px-1"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form action={addReport} className="space-y-4">
              <input type="hidden" name="clientId" value={clientId} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">Campaign name *</label>
                  <input
                    name="campaign_name"
                    required
                    placeholder="Q1 2026 Signal Campaign"
                    className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--accent)] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">Start date</label>
                  <input
                    name="campaign_start"
                    type="date"
                    className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">End date</label>
                  <input
                    name="campaign_end"
                    type="date"
                    className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <CreateReportSubmitButton />
                <button
                  type="button"
                  onClick={closeCreate}
                  className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--hover-border)] hover:text-[var(--text-primary)] transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
