"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type ReportItem = {
  id: string;
  campaign_name: string;
  status: string;
};

export function ReportSwitcher({
  clientId,
  currentReportId,
  currentName,
  reports,
}: {
  clientId: string;
  currentReportId: string;
  currentName: string;
  reports: ReportItem[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const others = reports.filter((r) => r.id !== currentReportId);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
          open
            ? "bg-[#00E5FF]/10 border-[#00E5FF]/40 text-[#00E5FF]"
            : "bg-[#111720] border-[#1E2633] text-white hover:border-[#2E3A4E]"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#00E5FF] shrink-0" />
        <span className="max-w-[180px] truncate">{currentName || "Untitled Report"}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 rounded-2xl border border-[#1E2633] bg-[#0D1117] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#1E2633] bg-[#0F1620]">
            <p className="text-[10px] font-bold text-[#8B9BB4] uppercase tracking-widest">
              Switch Report
            </p>
          </div>

          {/* Current report */}
          <div className="px-3 py-2 border-b border-[#1E2633]">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#00E5FF]/8 border border-[#00E5FF]/20">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#00E5FF] truncate">
                  {currentName || "Untitled Report"}
                </p>
                <p className="text-[10px] text-[#4A5568]">Current</p>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-[#00E5FF] shrink-0"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>

          {/* Other reports */}
          <div className="max-h-64 overflow-y-auto py-2 px-3 space-y-1">
            {others.length === 0 ? (
              <p className="text-xs text-[#4A5568] text-center py-4">No other reports</p>
            ) : (
              others.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/dashboard/clients/${clientId}/reports/${r.id}`);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[#1A2233] transition-all group"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      r.status === "published" ? "bg-[#00FF9D]" : "bg-[#3A4558]"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#A0AEC0] group-hover:text-white truncate transition-colors">
                      {r.campaign_name || "Untitled Report"}
                    </p>
                    <p className="text-[10px] text-[#4A5568]">
                      {r.status === "published" ? "Published" : "Draft"}
                    </p>
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-[#4A5568] group-hover:text-[#00E5FF] shrink-0 transition-colors"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-[#1E2633]">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push(`/dashboard/clients/${clientId}`);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#8B9BB4] hover:text-white hover:bg-[#1A2233] transition-all"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              All reports
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
