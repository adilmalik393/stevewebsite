import type {
  SignalDeckBarMetricRow,
  SignalDeckFeatureRow,
  SignalDeckPayload,
  SignalDeckPricingColumn,
  SignalDeckQuadrant,
  SignalDeckSignalBarCompare,
  SignalDeckSlide,
} from "@/lib/db";

function clamp01(n: number): number {
  if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function parseQuadrants(raw: unknown): SignalDeckQuadrant[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out: SignalDeckQuadrant[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const x = item as Record<string, unknown>;
    const title = String(x.title ?? "").trim();
    if (!title) continue;
    let bullets: string[] | undefined;
    if (Array.isArray(x.bullets)) {
      bullets = (x.bullets as unknown[]).map((b) => String(b).trim()).filter(Boolean);
      if (bullets.length === 0) bullets = undefined;
    }
    out.push({ title, bullets });
  }
  return out.length ? out : undefined;
}

function parseBarMetrics(raw: unknown): SignalDeckBarMetricRow[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out: SignalDeckBarMetricRow[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const x = item as Record<string, unknown>;
    const name = String(x.name ?? "").trim();
    if (!name) continue;
    const before = clamp01(Number(x.before));
    const after = clamp01(Number(x.after));
    out.push({ name, before, after });
    if (out.length >= 24) break;
  }
  return out.length ? out : undefined;
}

function parseSignalBarCompare(raw: unknown): SignalDeckSignalBarCompare | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const x = raw as Record<string, unknown>;
  const metrics = parseBarMetrics(x.metrics);
  if (!metrics) return undefined;
  const beforeLabel =
    typeof x.beforeLabel === "string" && x.beforeLabel.trim() ? x.beforeLabel.trim() : undefined;
  const afterLabel =
    typeof x.afterLabel === "string" && x.afterLabel.trim() ? x.afterLabel.trim() : undefined;
  const beforeTotal =
    x.beforeTotal != null && Number.isFinite(Number(x.beforeTotal))
      ? clamp01(Number(x.beforeTotal))
      : undefined;
  const afterTotal =
    x.afterTotal != null && Number.isFinite(Number(x.afterTotal))
      ? clamp01(Number(x.afterTotal))
      : undefined;
  return { beforeLabel, afterLabel, metrics, beforeTotal, afterTotal };
}

function parsePricingColumns(raw: unknown): SignalDeckPricingColumn[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out: SignalDeckPricingColumn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const x = item as Record<string, unknown>;
    const name = String(x.name ?? "").trim();
    const price = String(x.price ?? "").trim();
    if (!name && !price) continue;
    out.push({
      name: name || "Tier",
      price: price || "—",
      highlight: Boolean(x.highlight),
    });
    if (out.length >= 8) break;
  }
  return out.length ? out : undefined;
}

function parseFeatureMatrix(raw: unknown): SignalDeckFeatureRow[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out: SignalDeckFeatureRow[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const x = item as Record<string, unknown>;
    const feature = String(x.feature ?? "").trim();
    if (!feature) continue;
    out.push({
      feature,
      starter: Boolean(x.starter),
      amplified: Boolean(x.amplified),
      dominance: Boolean(x.dominance),
    });
    if (out.length >= 64) break;
  }
  return out.length ? out : undefined;
}

function parseVisualAccent(raw: unknown): "rising_chart" | undefined {
  return raw === "rising_chart" ? "rising_chart" : undefined;
}

/** Accepts stored JSON (new doc-shaped slides or legacy editor payloads) and returns doc-aligned shape. */
export function normalizeSignalDeckPayload(raw: unknown): SignalDeckPayload {
  if (!raw || typeof raw !== "object") {
    return { slides: [{ title: "Untitled slide" }] };
  }
  const o = raw as Record<string, unknown>;
  const slidesRaw = o.slides;
  const slides: SignalDeckSlide[] = [];

  if (Array.isArray(slidesRaw)) {
    for (const item of slidesRaw) {
      if (!item || typeof item !== "object") continue;
      const x = item as Record<string, unknown>;

      const title = String(x.title ?? "Untitled slide").trim() || "Untitled slide";

      const layout =
        (typeof x.layout === "string" && x.layout.trim()) ||
        (typeof x.layoutNotes === "string" && x.layoutNotes.trim()) ||
        undefined;

      const text =
        (typeof x.text === "string" && x.text) ||
        (typeof x.body === "string" && x.body) ||
        undefined;

      const subtext =
        (typeof x.subtext === "string" && x.subtext) ||
        (typeof x.subtitle === "string" && x.subtitle) ||
        undefined;

      let headers: string[] | undefined;
      if (Array.isArray(x.headers)) {
        headers = (x.headers as unknown[]).map((h) => String(h).trim()).filter(Boolean);
        if (headers.length === 0) headers = undefined;
      }

      let bullets: string[] | undefined;
      if (Array.isArray(x.bullets)) {
        bullets = (x.bullets as unknown[]).map((b) => String(b));
        if (bullets.length === 0) bullets = undefined;
      }

      const bottomHighlight =
        (typeof x.bottomHighlight === "string" && x.bottomHighlight.trim()) ||
        (typeof x.bottomLine === "string" && x.bottomLine.trim()) ||
        undefined;

      const quadrants = parseQuadrants(x.quadrants);
      const signalBarCompare = parseSignalBarCompare(x.signalBarCompare);
      const pricingColumns = parsePricingColumns(x.pricingColumns);
      const featureMatrix = parseFeatureMatrix(x.featureMatrix);
      const visualAccent = parseVisualAccent(x.visualAccent);

      const slide: SignalDeckSlide = {
        title,
        layout,
        text,
        subtext,
        headers,
        bullets,
        bottomHighlight,
      };
      if (quadrants) slide.quadrants = quadrants;
      if (signalBarCompare) slide.signalBarCompare = signalBarCompare;
      if (pricingColumns) slide.pricingColumns = pricingColumns;
      if (featureMatrix) slide.featureMatrix = featureMatrix;
      if (visualAccent) slide.visualAccent = visualAccent;

      slides.push(slide);
    }
  }

  if (slides.length === 0) {
    slides.push({ title: "Untitled slide" });
  }

  return { slides };
}
