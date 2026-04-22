"use client";

import type {
  SignalDeckFeatureRow,
  SignalDeckPricingColumn,
  SignalDeckQuadrant,
  SignalDeckSignalBarCompare,
} from "@/lib/db";

function CellCheck({ on }: { on: boolean }) {
  return (
    <span
      className={`tabular-nums font-semibold ${on ? "text-[#00FF9D]" : "text-[#475569]"}`}
      aria-label={on ? "Included" : "Not included"}
    >
      {on ? "✓" : "—"}
    </span>
  );
}

export function DeckQuadrantGrid({ quadrants }: { quadrants: SignalDeckQuadrant[] }) {
  if (!quadrants.length) return null;
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full max-w-5xl"
      role="list"
      aria-label="Signal score breakdown quadrants"
    >
      {quadrants.map((q, i) => (
        <div
          key={i}
          role="listitem"
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent px-4 py-4 md:px-5 md:py-5"
        >
          <div
            className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00E5FF] via-[#7B61FF] to-[#00FF9D] opacity-80"
            aria-hidden
          />
          <h3 className="text-sm md:text-base font-bold font-[family-name:var(--font-montserrat)] text-white tracking-tight mb-3">
            {q.title}
          </h3>
          {(q.bullets || []).length > 0 ? (
            <ul className="space-y-1.5">
              {(q.bullets || []).map((b, j) => (
                <li key={j} className="text-xs md:text-sm text-[#A8B8CC] flex gap-2 items-start">
                  <span className="text-[#00E5FF] mt-1 shrink-0" aria-hidden>
                    ·
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function DeckSignalBarCompare({ data }: { data: SignalDeckSignalBarCompare }) {
  const { metrics, beforeLabel, afterLabel, beforeTotal, afterTotal } = data;
  if (!metrics.length) return null;

  return (
    <div className="w-full max-w-4xl space-y-6" aria-label="Before and after signal score comparison">
      <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-[#475569]" aria-hidden />
          {beforeLabel || "Before"}
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-[#00E5FF]" aria-hidden />
          {afterLabel || "After"}
        </span>
      </div>

      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.name} className="space-y-1.5">
            <div className="flex justify-between gap-3 text-xs font-semibold text-[#94A3B8]">
              <span>{m.name}</span>
              <span className="tabular-nums text-[#64748B]">
                {m.before} → {m.after}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden border border-white/[0.05]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#334155] to-[#475569]"
                  style={{ width: `${m.before}%` }}
                />
              </div>
              <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden border border-white/[0.05]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#7B61FF]"
                  style={{ width: `${m.after}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {(beforeTotal != null || afterTotal != null) && (
        <div className="flex flex-wrap gap-4 md:gap-8 pt-4 border-t border-white/[0.08]">
          {beforeTotal != null ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-3 min-w-[8rem]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">Total before</p>
              <p className="text-2xl md:text-3xl font-black tabular-nums text-[#94A3B8] font-[family-name:var(--font-montserrat)]">
                {beforeTotal}
                <span className="text-sm font-semibold text-[#64748B]"> / 100</span>
              </p>
            </div>
          ) : null}
          {afterTotal != null ? (
            <div className="rounded-xl border border-[#00E5FF]/25 bg-[#00E5FF]/[0.06] px-5 py-3 min-w-[8rem] shadow-[0_0_40px_rgba(0,229,255,0.12)]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#00E5FF]/80 mb-1">Total after</p>
              <p className="text-2xl md:text-3xl font-black tabular-nums text-white font-[family-name:var(--font-montserrat)]">
                {afterTotal}
                <span className="text-sm font-semibold text-[#64748B]"> / 100</span>
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function DeckPricingColumns({ columns }: { columns: SignalDeckPricingColumn[] }) {
  if (!columns.length) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
      {columns.map((c, i) => (
        <div
          key={i}
          className={`relative overflow-hidden rounded-2xl border px-5 py-6 text-center transition-shadow ${
            c.highlight
              ? "border-[#00E5FF]/40 bg-gradient-to-b from-[#00E5FF]/[0.12] to-white/[0.02] shadow-[0_0_48px_rgba(0,229,255,0.15)]"
              : "border-white/[0.08] bg-white/[0.03]"
          }`}
        >
          {c.highlight ? (
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-[#00E5FF]/30"
              aria-hidden
            />
          ) : null}
          <p className="text-xs font-bold uppercase tracking-wider text-[#8B9AAF] mb-2">{c.name}</p>
          <p className="text-xl md:text-2xl font-black font-[family-name:var(--font-montserrat)] text-white tabular-nums">
            {c.price}
          </p>
        </div>
      ))}
    </div>
  );
}

export function DeckFeatureMatrix({ rows }: { rows: SignalDeckFeatureRow[] }) {
  if (!rows.length) return null;
  return (
    <div className="w-full max-w-5xl overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02]">
      <table className="w-full min-w-[520px] text-left text-xs md:text-sm border-collapse">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.04]">
            <th className="px-3 md:px-4 py-3 font-bold text-[#94A3B8] uppercase tracking-wider">Feature</th>
            <th className="px-3 md:px-4 py-3 font-bold text-center text-[#94A3B8] uppercase tracking-wider">Starter</th>
            <th className="px-3 md:px-4 py-3 font-bold text-center text-[#00E5FF] uppercase tracking-wider">
              Amplified ⭐
            </th>
            <th className="px-3 md:px-4 py-3 font-bold text-center text-[#94A3B8] uppercase tracking-wider">Dominance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
              <td className="px-3 md:px-4 py-2.5 font-medium text-[#C5D0E0]">{r.feature}</td>
              <td className="px-3 md:px-4 py-2.5 text-center">
                <CellCheck on={r.starter} />
              </td>
              <td className="px-3 md:px-4 py-2.5 text-center bg-[#00E5FF]/[0.04]">
                <CellCheck on={r.amplified} />
              </td>
              <td className="px-3 md:px-4 py-2.5 text-center">
                <CellCheck on={r.dominance} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Decorative uptrend for PPC-style slides (no real data). */
export function DeckRisingChartBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[min(45%,220px)] opacity-[0.14]" aria-hidden>
      <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="deck-rise-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#060A0F" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="deck-rise-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7B61FF" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
        </defs>
        <path
          d="M0,95 Q60,88 100,75 T200,50 T400,15 L400,120 L0,120 Z"
          fill="url(#deck-rise-fill)"
        />
        <path
          d="M0,95 Q60,88 100,75 T200,50 T400,15"
          fill="none"
          stroke="url(#deck-rise-stroke)"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
