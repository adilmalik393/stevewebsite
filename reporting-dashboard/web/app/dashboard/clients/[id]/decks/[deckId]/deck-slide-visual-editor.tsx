"use client";

import type {
  SignalDeckBarMetricRow,
  SignalDeckFeatureRow,
  SignalDeckPricingColumn,
  SignalDeckSlide,
} from "@/lib/db";

function clamp100(n: number): number {
  if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
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
      {hint ? <p className="text-[10px] text-[var(--text-faint)] mt-1">{hint}</p> : null}
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

function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border-strong)] rounded-xl text-[var(--text-primary)] text-sm placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-bg)] transition-all resize-y min-h-[72px]"
    />
  );
}

export function DeckSlideVisualEditor({
  slide,
  index,
  updateSlide,
}: {
  slide: SignalDeckSlide;
  index: number;
  updateSlide: (i: number, patch: Partial<SignalDeckSlide>) => void;
}) {
  const patchQuadrant = (qi: number, title: string, bulletsText: string) => {
    const cur = [...(slide.quadrants ?? [])];
    while (cur.length <= qi) cur.push({ title: "" });
    cur[qi] = {
      title,
      bullets: bulletsText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    };
    const packed = cur.filter((q) => q.title.trim());
    updateSlide(index, { quadrants: packed.length ? packed : undefined });
  };

  const commitBar = (metrics: SignalDeckBarMetricRow[], meta?: Partial<NonNullable<SignalDeckSlide["signalBarCompare"]>>) => {
    const packed = metrics.map((r) => ({
      name: r.name.trim(),
      before: clamp100(r.before),
      after: clamp100(r.after),
    })).filter((r) => r.name.length > 0);
    if (!packed.length) {
      updateSlide(index, { signalBarCompare: undefined });
      return;
    }
    const prev = slide.signalBarCompare;
    const M = meta ?? {};
    updateSlide(index, {
      signalBarCompare: {
        beforeLabel:
          "beforeLabel" in M ? M.beforeLabel ?? undefined : (prev?.beforeLabel ?? "Before EDM Signal"),
        afterLabel:
          "afterLabel" in M ? M.afterLabel ?? undefined : (prev?.afterLabel ?? "After EDM Signal"),
        beforeTotal: "beforeTotal" in M ? M.beforeTotal : prev?.beforeTotal,
        afterTotal: "afterTotal" in M ? M.afterTotal : prev?.afterTotal,
        metrics: packed,
      },
    });
  };

  const metricsRows = slide.signalBarCompare?.metrics?.length
    ? slide.signalBarCompare.metrics
    : [];

  const patchMetric = (mi: number, patch: Partial<SignalDeckBarMetricRow>) => {
    const base: SignalDeckBarMetricRow[] =
      metricsRows.length > 0
        ? metricsRows.map((r) => ({ ...r }))
        : [{ name: "", before: 0, after: 0 }];
    while (base.length <= mi) base.push({ name: "", before: 0, after: 0 });
    const prev = base[mi];
    base[mi] = {
      name: patch.name ?? prev.name,
      before: clamp100(patch.before ?? prev.before),
      after: clamp100(patch.after ?? prev.after),
    };
    commitBar(base);
  };

  const patchPricing = (pi: number, col: Partial<SignalDeckPricingColumn>) => {
    const cur: SignalDeckPricingColumn[] = [...(slide.pricingColumns ?? [])];
    while (cur.length <= pi) cur.push({ name: "", price: "" });
    cur[pi] = { ...cur[pi], ...col };
    const packed = cur.filter((c) => c.name.trim() || c.price.trim());
    updateSlide(index, { pricingColumns: packed.length ? packed : undefined });
  };

  const patchFeatureRow = (fi: number, row: Partial<SignalDeckFeatureRow>) => {
    const cur = [...(slide.featureMatrix ?? [])];
    if (!cur[fi]) cur[fi] = { feature: "", starter: false, amplified: false, dominance: false };
    cur[fi] = { ...cur[fi], ...row };
    const packed = cur.filter((r) => r.feature.trim());
    updateSlide(index, { featureMatrix: packed.length ? packed : undefined });
  };

  return (
    <details className="mt-6 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-base)]/40 overflow-hidden">
      <summary className="px-4 py-3 cursor-pointer text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider hover:text-[var(--accent)] select-none">
        Structured visuals (quadrants · bar compare · pricing · feature table)
      </summary>
      <div className="px-4 pb-5 pt-2 space-y-8 border-t border-[var(--border-strong)]">
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-[var(--text-primary)]">4-quadrant breakdown</p>
            {slide.quadrants?.length ? (
              <button
                type="button"
                onClick={() => updateSlide(index, { quadrants: undefined })}
                className="text-[10px] text-[var(--text-faint)] hover:text-[var(--danger)]"
              >
                Clear all
              </button>
            ) : null}
          </div>
          <div className="space-y-4">
            {([0, 1, 2, 3] as const).map((qi) => (
              <div key={qi} className="rounded-lg border border-[var(--border-strong)] p-3 space-y-2">
                <Field label={`Quadrant ${qi + 1} title`}>
                  <Input
                    value={slide.quadrants?.[qi]?.title ?? ""}
                    onChange={(v) =>
                      patchQuadrant(
                        qi,
                        v,
                        (slide.quadrants?.[qi]?.bullets ?? []).join("\n")
                      )
                    }
                    placeholder="e.g. 1. Execution Strength"
                  />
                </Field>
                <Field label="Bullets (one per line)" hint="Optional list under this quadrant.">
                  <TextArea
                    value={(slide.quadrants?.[qi]?.bullets ?? []).join("\n")}
                    onChange={(v) =>
                      patchQuadrant(qi, slide.quadrants?.[qi]?.title ?? "", v)
                    }
                    rows={3}
                    placeholder={"Revenue\nContracts"}
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-[var(--text-primary)]">Before / after bar comparison</p>
            {slide.signalBarCompare ? (
              <button
                type="button"
                onClick={() => updateSlide(index, { signalBarCompare: undefined })}
                className="text-[10px] text-[var(--text-faint)] hover:text-[var(--danger)]"
              >
                Clear
              </button>
            ) : null}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Field label="Before label">
              <Input
                value={slide.signalBarCompare?.beforeLabel ?? ""}
                onChange={(v) => {
                  const m = slide.signalBarCompare?.metrics;
                  if (!m?.length) return;
                  commitBar(m, { beforeLabel: v || undefined });
                }}
                placeholder="Before EDM Signal"
              />
            </Field>
            <Field label="After label">
              <Input
                value={slide.signalBarCompare?.afterLabel ?? ""}
                onChange={(v) => {
                  const m = slide.signalBarCompare?.metrics;
                  if (!m?.length) return;
                  commitBar(m, { afterLabel: v || undefined });
                }}
                placeholder="After EDM Signal"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Total before (0–100)">
              <Input
                type="number"
                value={slide.signalBarCompare?.beforeTotal ?? ""}
                onChange={(v) => {
                  const m = slide.signalBarCompare?.metrics;
                  if (!m?.length) return;
                  commitBar(m, {
                    beforeTotal: v === "" ? undefined : clamp100(Number(v)),
                  });
                }}
              />
            </Field>
            <Field label="Total after (0–100)">
              <Input
                type="number"
                value={slide.signalBarCompare?.afterTotal ?? ""}
                onChange={(v) => {
                  const m = slide.signalBarCompare?.metrics;
                  if (!m?.length) return;
                  commitBar(m, {
                    afterTotal: v === "" ? undefined : clamp100(Number(v)),
                  });
                }}
              />
            </Field>
          </div>
          <div className="space-y-2">
            {(metricsRows.length > 0
              ? metricsRows
              : [{ name: "", before: 0, after: 0 }]
            ).map((row, mi) => (
              <div key={mi} className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[8rem]">
                  <Field label="Metric">
                    <Input
                      value={row.name}
                      onChange={(v) => patchMetric(mi, { name: v })}
                      placeholder="Execution"
                    />
                  </Field>
                </div>
                <div className="w-20">
                  <Field label="Before">
                    <Input
                      type="number"
                      value={row.before}
                      onChange={(v) => patchMetric(mi, { before: Number(v) })}
                    />
                  </Field>
                </div>
                <div className="w-20">
                  <Field label="After">
                    <Input
                      type="number"
                      value={row.after}
                      onChange={(v) => patchMetric(mi, { after: Number(v) })}
                    />
                  </Field>
                </div>
                {metricsRows.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const next = metricsRows.filter((_, i) => i !== mi);
                      commitBar(next);
                    }}
                    className="text-xs text-[var(--danger)] px-2 py-2 shrink-0"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const next = [...metricsRows, { name: "", before: 0, after: 0 }];
                commitBar(next);
              }}
              className="text-xs text-[var(--accent)] font-medium"
            >
              + Add metric row
            </button>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-[var(--text-primary)] mb-3">Pricing columns (packages)</p>
          <div className="space-y-3">
            {([0, 1, 2] as const).map((pi) => (
              <div
                key={pi}
                className="flex flex-wrap gap-2 items-end rounded-lg border border-[var(--border-strong)] p-3"
              >
                <div className="flex-1 min-w-[6rem]">
                  <Field label={`Tier ${pi + 1} name`}>
                    <Input
                      value={slide.pricingColumns?.[pi]?.name ?? ""}
                      onChange={(v) =>
                        patchPricing(pi, {
                          name: v,
                          price: slide.pricingColumns?.[pi]?.price ?? "",
                          highlight: slide.pricingColumns?.[pi]?.highlight,
                        })
                      }
                    />
                  </Field>
                </div>
                <div className="flex-1 min-w-[6rem]">
                  <Field label="Price">
                    <Input
                      value={slide.pricingColumns?.[pi]?.price ?? ""}
                      onChange={(v) =>
                        patchPricing(pi, {
                          name: slide.pricingColumns?.[pi]?.name ?? "",
                          price: v,
                          highlight: slide.pricingColumns?.[pi]?.highlight,
                        })
                      }
                    />
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-xs text-[var(--text-muted)] pb-2 shrink-0">
                  <input
                    type="checkbox"
                    checked={Boolean(slide.pricingColumns?.[pi]?.highlight)}
                    onChange={(e) =>
                      patchPricing(pi, {
                        name: slide.pricingColumns?.[pi]?.name ?? "",
                        price: slide.pricingColumns?.[pi]?.price ?? "",
                        highlight: e.target.checked,
                      })
                    }
                  />
                  Highlight
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-[var(--text-primary)]">Feature comparison table</p>
            <button
              type="button"
              onClick={() => {
                const cur = [...(slide.featureMatrix ?? [])];
                cur.push({ feature: "", starter: false, amplified: false, dominance: false });
                updateSlide(index, { featureMatrix: cur });
              }}
              className="text-xs text-[var(--accent)] font-medium"
            >
              + Row
            </button>
          </div>
          <div className="space-y-2">
            {(slide.featureMatrix?.length ? slide.featureMatrix : []).map((row, fi) => (
              <div
                key={fi}
                className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:items-center rounded-lg border border-[var(--border-strong)] p-2"
              >
                <div className="flex-1 min-w-[10rem]">
                  <Input
                    value={row.feature}
                    onChange={(v) => patchFeatureRow(fi, { feature: v })}
                    placeholder="Feature name"
                  />
                </div>
                {(["starter", "amplified", "dominance"] as const).map((k) => (
                  <label
                    key={k}
                    className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] uppercase shrink-0"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(row[k])}
                      onChange={(e) =>
                        patchFeatureRow(fi, { [k]: e.target.checked } as Partial<SignalDeckFeatureRow>)
                      }
                    />
                    {k === "starter" ? "St" : k === "amplified" ? "Amp" : "Dom"}
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const cur = [...(slide.featureMatrix ?? [])].filter((_, i) => i !== fi);
                    updateSlide(index, { featureMatrix: cur.length ? cur : undefined });
                  }}
                  className="text-xs text-[var(--danger)] self-start sm:self-center"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {slide.featureMatrix?.length ? (
            <button
              type="button"
              onClick={() => updateSlide(index, { featureMatrix: undefined })}
              className="mt-2 text-xs text-[var(--text-faint)] hover:text-[var(--danger)]"
            >
              Clear feature table
            </button>
          ) : null}
        </div>

        <label className="flex items-center gap-2 text-xs text-[var(--text-muted)] cursor-pointer">
          <input
            type="checkbox"
            checked={slide.visualAccent === "rising_chart"}
            onChange={(e) =>
              updateSlide(index, { visualAccent: e.target.checked ? "rising_chart" : undefined })
            }
          />
          Rising chart backdrop (PPC-style accent)
        </label>
      </div>
    </details>
  );
}
