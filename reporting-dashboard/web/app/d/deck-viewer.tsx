"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SignalDeckPayload } from "@/lib/db";
import { normalizeSignalDeckPayload } from "@/lib/signal-deck-normalize";
import {
  DeckFeatureMatrix,
  DeckPricingColumns,
  DeckQuadrantGrid,
  DeckRisingChartBackdrop,
  DeckSignalBarCompare,
} from "@/components/deck-slide-visuals";

/** Matches Report 4 wordmark (`report-viewer.tsx` — `EdmLogoMark`). */
function EdmLogoMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-baseline gap-1.5 shrink-0 opacity-90 select-none ${className}`}
      aria-label="EDM Signal"
    >
      <span className="font-[family-name:var(--font-montserrat)] text-lg sm:text-xl font-black text-white tracking-tight leading-none">
        EDM
      </span>
      <span className="font-[family-name:var(--font-montserrat)] text-[9px] sm:text-[10px] font-bold text-white/80 uppercase tracking-[0.22em] pb-0.5">
        Signal
      </span>
    </div>
  );
}

/** Same shell as Report 4 `Slide` — full viewport slide height. */
function DeckSlideShell({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div
      id={id}
      className={`pdf-slide min-h-[100dvh] min-h-screen flex flex-col justify-center px-5 md:px-12 py-10 md:py-14 ${className}`}
    >
      {children}
    </div>
  );
}

function sectionLabelForSlide(index: number, total: number): string {
  return `Slide ${index + 1} of ${total} · Signal deck`;
}

export function DeckViewer({
  companyName,
  ticker,
  deckName,
  deckStart,
  deckEnd,
  payload,
  isDraft,
}: {
  companyName: string;
  ticker: string | null;
  deckName: string;
  deckStart: string | null;
  deckEnd: string | null;
  payload: SignalDeckPayload;
  isDraft?: boolean;
}) {
  const pl = useMemo(() => normalizeSignalDeckPayload(payload), [payload]);
  const slides = pl.slides?.length ? pl.slides : [{ title: "Untitled", text: "" }];
  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(index, slides.length - 1);
  const slide = slides[safeIndex];
  const total = slides.length;

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(slides.length - 1, i + 1));
  }, [slides.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  const textLines = (slide.text || "").split("\n");
  /** Slide 1: first line of `text` as hero headline, following lines as accent tagline (Report 4 cover feel). */
  const isCoverSlide =
    safeIndex === 0 && textLines.filter((l) => l.trim()).length > 0;
  const showRisingAccent = slide.visualAccent === "rising_chart";

  return (
    <div className="relative min-h-[100dvh] bg-[#060A0F] text-white font-[family-name:var(--font-inter)] selection:bg-[#00E5FF]/20">
      {/* Ambient background — Report 4 */}
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% -5%, rgba(0,229,255,0.08) 0%, transparent 65%)," +
            "radial-gradient(ellipse 60% 50% at 95% 10%, rgba(123,97,255,0.06) 0%, transparent 55%)," +
            "radial-gradient(ellipse 50% 40% at 5% 90%, rgba(0,255,157,0.04) 0%, transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <div className="relative z-[1]">
        {/* Top-left meta — glass pill like Report 4 controls */}
        <div className="no-print fixed top-4 left-4 z-50 max-w-[min(100vw-2rem,20rem)]">
          <div className="rounded-2xl border border-white/[0.08] bg-[#060A0F]/90 backdrop-blur-xl px-4 py-2.5 shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shrink-0" aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7B61FF] font-[family-name:var(--font-montserrat)]">
                Signal deck
              </span>
            </div>
            <p className="text-xs font-semibold text-white truncate leading-snug">{companyName}</p>
            {ticker ? (
              <p className="text-[10px] font-mono text-[#94A3B8] mt-0.5">${ticker}</p>
            ) : null}
            <p className="text-[10px] text-[#64748B] truncate mt-1.5">{deckName}</p>
            <p className="text-[10px] text-[#5C6573] tabular-nums mt-0.5">
              {deckStart || "—"}
              {deckEnd ? ` — ${deckEnd}` : ""}
            </p>
            {isDraft ? (
              <span className="inline-block mt-2 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.06] text-[#8B9AAF] border border-white/[0.08]">
                Draft preview
              </span>
            ) : null}
          </div>
        </div>

        {/* Top-right nav — Report 4 */}
        <div className="no-print fixed top-4 right-4 z-50 flex items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-[#060A0F]/90 backdrop-blur-xl px-3 py-2 text-xs shadow-2xl">
          <button
            type="button"
            onClick={goPrev}
            disabled={safeIndex <= 0}
            className="px-2 py-1 text-[#8B9AAF] hover:text-white transition-colors rounded-lg hover:bg-white/5 disabled:opacity-35 disabled:pointer-events-none"
          >
            ← Prev
          </button>
          <span className="text-[#2A3442] px-1 tabular-nums">
            {safeIndex + 1} / {total}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={safeIndex >= total - 1}
            className="px-2 py-1 text-[#8B9AAF] hover:text-white transition-colors rounded-lg hover:bg-white/5 disabled:opacity-35 disabled:pointer-events-none"
          >
            Next →
          </button>
        </div>

        {isDraft ? (
          <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
            <span className="rotate-[-25deg] text-[10rem] font-extrabold tracking-[0.3em] text-white/[0.025] select-none">
              DRAFT
            </span>
          </div>
        ) : null}

        <div className="no-print fixed bottom-5 left-1/2 -translate-x-1/2 z-50 text-[11px] text-[#2A3442] tracking-[0.2em] uppercase">
          EDM Signal Deck
        </div>

        <DeckSlideShell id={`deck-slide-${safeIndex}`} className="justify-center py-8 md:py-12 scroll-mt-24">
          <div className="relative max-w-6xl mx-auto w-full px-5 md:px-12 flex flex-col min-h-[min(100dvh,860px)] md:min-h-[720px]">
            <header className="flex flex-row items-start justify-between gap-6 shrink-0 pb-6 md:pb-8 border-b border-white/[0.06]">
              <div className="flex flex-col gap-2 shrink-0">
                <EdmLogoMark />
                <span className="text-[10px] font-mono tabular-nums" style={{ color: "#A0AEC0" }}>
                  {safeIndex + 1} / {total}
                </span>
              </div>
              <div className="text-right min-w-0 max-w-[min(100%,28rem)] pl-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-[family-name:var(--font-montserrat)] text-white tracking-tight leading-snug whitespace-pre-wrap">
                  {slide.title || "Untitled"}
                </h2>
                <p className="mt-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                  {sectionLabelForSlide(safeIndex, total)}
                </p>
              </div>
            </header>

            <main className="flex-1 flex flex-col justify-center py-6 md:py-10 min-h-0">
              {slide.layout ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64748B] mb-5 whitespace-pre-wrap">
                  Layout · {slide.layout}
                </p>
              ) : null}

              <div className={showRisingAccent ? "relative" : undefined}>
                {showRisingAccent ? <DeckRisingChartBackdrop /> : null}

                <div className={showRisingAccent ? "relative z-[1] space-y-8 md:space-y-10" : "space-y-8 md:space-y-10"}>
                  {isCoverSlide ? (
                    <div className="space-y-6 md:space-y-8">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-[family-name:var(--font-montserrat)] tracking-tight leading-[1.08]">
                        <span className="bg-gradient-to-r from-white via-[#E2E8F0] to-[#94A3B8] bg-clip-text text-transparent whitespace-pre-wrap">
                          {textLines[0]?.trim() || slide.title}
                        </span>
                      </h1>
                      {textLines.slice(1).some((l) => l.trim()) ? (
                        <p className="text-lg md:text-xl text-[#00E5FF] font-medium max-w-2xl leading-relaxed whitespace-pre-wrap">
                          {textLines
                            .slice(1)
                            .join("\n")
                            .trim()}
                        </p>
                      ) : null}
                      {slide.subtext ? (
                        <p className="text-sm md:text-base text-[#8B9AAF] max-w-2xl leading-relaxed whitespace-pre-wrap border-l-2 border-[#00E5FF]/40 pl-4">
                          {slide.subtext}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      {slide.quadrants && slide.quadrants.length > 0 ? (
                        <DeckQuadrantGrid quadrants={slide.quadrants} />
                      ) : null}
                      {slide.signalBarCompare && slide.signalBarCompare.metrics.length > 0 ? (
                        <DeckSignalBarCompare data={slide.signalBarCompare} />
                      ) : null}
                      {slide.pricingColumns && slide.pricingColumns.length > 0 ? (
                        <DeckPricingColumns columns={slide.pricingColumns} />
                      ) : null}
                      {slide.featureMatrix && slide.featureMatrix.length > 0 ? (
                        <DeckFeatureMatrix rows={slide.featureMatrix} />
                      ) : null}

                      {slide.text?.trim() || slide.subtext?.trim() ? (
                        <div className="space-y-6">
                          {slide.text?.trim() ? (
                            <p className="text-sm md:text-base text-[#C5D0E0] whitespace-pre-wrap leading-relaxed max-w-3xl">
                              {slide.text}
                            </p>
                          ) : null}
                          {slide.subtext?.trim() ? (
                            <p className="text-base md:text-lg text-[#00E5FF] font-medium whitespace-pre-wrap leading-snug max-w-3xl">
                              {slide.subtext}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>

              {(slide.headers || []).filter(Boolean).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-8">
                  {(slide.headers || [])
                    .filter(Boolean)
                    .map((h, i) => (
                      <div
                        key={i}
                        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-center"
                      >
                        <div
                          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/50 to-transparent"
                          aria-hidden
                        />
                        <p className="text-xs font-semibold text-[#8B9AAF] leading-snug">{h}</p>
                      </div>
                    ))}
                </div>
              ) : null}

              {(slide.bullets || []).filter(Boolean).length > 0 ? (
                <ul className="mt-8 space-y-3 max-w-3xl">
                  {(slide.bullets || [])
                    .filter(Boolean)
                    .map((b, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span
                          className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00E5FF] shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                          aria-hidden
                        />
                        <span className="text-sm text-[#C5D0E0] leading-relaxed">{b}</span>
                      </li>
                    ))}
                </ul>
              ) : null}

              {slide.bottomHighlight ? (
                <p className="mt-10 pt-6 md:pt-8 border-t border-white/[0.06] text-base md:text-lg lg:text-xl font-semibold text-center leading-snug max-w-3xl mx-auto whitespace-pre-wrap bg-gradient-to-r from-[#00E5FF] via-[#7B61FF] to-[#00FF9D] bg-clip-text text-transparent">
                  {slide.bottomHighlight}
                </p>
              ) : null}
            </main>

            <footer className="mt-auto flex flex-row items-center justify-end pt-5 md:pt-6 border-t border-white/[0.06] shrink-0">
              <span className="text-[11px] font-medium tracking-wide" style={{ color: "#A0AEC0" }}>
                EDM Signal Deck
              </span>
            </footer>
          </div>
        </DeckSlideShell>
      </div>
    </div>
  );
}
