"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { publishDeck } from "../../../../actions";
import type { SignalDeckPayload, SignalDeckSlide } from "@/lib/db";
import { minimalDeckFallback } from "@/lib/signal-deck-template";
import { normalizeSignalDeckPayload } from "@/lib/signal-deck-normalize";
import { DeckSlideVisualEditor } from "./deck-slide-visual-editor";

/** Sidebar + main form show this many slide blocks until expanded. */
const SLIDES_PREVIEW_COUNT = 5;

function SlideOutlineIcon({ className = "" }: { className?: string }) {
  const cls = `w-4 h-4 shrink-0 ${className}`;
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 8h10M7 12h6M7 16h8" />
    </svg>
  );
}

function DeckSection({
  id,
  title,
  children,
  accent = false,
  actions,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  accent?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className={`rounded-2xl border mb-6 overflow-hidden scroll-mt-20 ${
        accent
          ? "border-[var(--accent-border)] bg-[var(--bg-card)]"
          : "border-[var(--border-strong)] bg-[var(--bg-card)]"
      }`}
    >
      <div
        className={`px-6 py-4 border-b flex items-center justify-between gap-3 ${
          accent
            ? "border-[var(--accent-border-sm)] bg-[var(--accent-bg-sub)]"
            : "border-[var(--border-strong)] bg-[var(--section-header)]"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={accent ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}>
            <SlideOutlineIcon />
          </span>
          <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-wide uppercase truncate">
            {title}
          </h3>
        </div>
        {actions}
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

function TextArea({
  value,
  onChange,
  rows = 4,
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
      className="w-full px-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border-strong)] rounded-xl text-[var(--text-primary)] text-sm placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-bg)] transition-all resize-y min-h-[100px]"
    />
  );
}

export function DeckForm({
  deckId,
  clientId,
  companyName,
  ticker,
  initialMeta,
  initialPayload,
}: {
  deckId: string;
  clientId: string;
  companyName: string;
  ticker: string | null;
  initialMeta: { deck_name: string; deck_start: string; deck_end: string };
  initialPayload: SignalDeckPayload;
}) {
  const [meta, setMeta] = useState(initialMeta);
  const [p, setP] = useState<SignalDeckPayload>(() =>
    normalizeSignalDeckPayload({
      ...initialPayload,
      slides:
        initialPayload.slides && initialPayload.slides.length > 0
          ? initialPayload.slides
          : minimalDeckFallback().slides,
    })
  );
  const [activeId, setActiveId] = useState<string>("deck-meta");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  /** When false and deck has >5 slides, sidebar + main list only the first five; then “show all” / add. */
  const [slidesFormExpanded, setSlidesFormExpanded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const updateSlide = useCallback((index: number, patch: Partial<SignalDeckSlide>) => {
    setP((prev) => {
      const slides = [...(prev.slides || [])];
      slides[index] = { ...slides[index], ...patch };
      return { ...prev, slides };
    });
  }, []);

  const addSlide = useCallback(() => {
    setP((prev) => ({
      ...prev,
      slides: [...(prev.slides || []), { title: `New slide ${(prev.slides?.length || 0) + 1}` }],
    }));
    setSlidesFormExpanded(true);
  }, []);

  const removeSlide = useCallback((index: number) => {
    setP((prev) => {
      const slides = [...(prev.slides || [])].filter((_, i) => i !== index);
      const next = slides.length ? slides : (minimalDeckFallback().slides ?? []);
      return normalizeSignalDeckPayload({ ...prev, slides: next });
    });
  }, []);

  const updateBullet = useCallback((slideIndex: number, bulletIndex: number, text: string) => {
    setP((prev) => {
      const slides = [...(prev.slides || [])];
      const s = { ...slides[slideIndex] };
      const bullets = [...(s.bullets || [])];
      bullets[bulletIndex] = text;
      s.bullets = bullets;
      slides[slideIndex] = s;
      return { ...prev, slides };
    });
  }, []);

  const addBullet = useCallback((slideIndex: number) => {
    setP((prev) => {
      const slides = [...(prev.slides || [])];
      const s = { ...slides[slideIndex] };
      s.bullets = [...(s.bullets || []), ""];
      slides[slideIndex] = s;
      return { ...prev, slides };
    });
  }, []);

  const removeBullet = useCallback((slideIndex: number, bulletIndex: number) => {
    setP((prev) => {
      const slides = [...(prev.slides || [])];
      const s = { ...slides[slideIndex] };
      s.bullets = (s.bullets || []).filter((_, i) => i !== bulletIndex);
      slides[slideIndex] = s;
      return { ...prev, slides };
    });
  }, []);

  const persistDraft = useCallback(
    async (payload: SignalDeckPayload, nextMeta: typeof meta) => {
      const res = await fetch(`/api/deck-drafts/${deckId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: JSON.stringify(payload),
          meta: nextMeta,
        }),
      });
      if (!res.ok) {
        let detail = "";
        try {
          const j = (await res.json()) as { error?: string };
          if (j?.error) detail = `: ${j.error}`;
        } catch {
          /* ignore */
        }
        throw new Error(`Failed to save draft (${res.status})${detail}`);
      }
    },
    [deckId]
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

  const slides = p.slides || [];

  const activeSlideIndex = useMemo(() => {
    const m = /^deck-slide-(\d+)$/.exec(activeId);
    return m ? Number(m[1]) : -1;
  }, [activeId]);

  const slideNavEntries = useMemo(
    () =>
      slidesFormExpanded || slides.length <= SLIDES_PREVIEW_COUNT
        ? slides.map((slide, i) => ({ slide, i }))
        : slides.slice(0, SLIDES_PREVIEW_COUNT).map((slide, i) => ({ slide, i })),
    [slides, slidesFormExpanded]
  );

  useEffect(() => {
    if (activeSlideIndex >= SLIDES_PREVIEW_COUNT) setSlidesFormExpanded(true);
  }, [activeSlideIndex]);

  useEffect(() => {
    if (slides.length <= SLIDES_PREVIEW_COUNT) setSlidesFormExpanded(false);
  }, [slides.length]);

  useEffect(() => {
    const ids = ["deck-meta", ...slides.map((_, i) => `deck-slide-${i}`)];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      { root: null, rootMargin: "-10% 0px -40% 0px", threshold: [0.06, 0.12, 0.2, 0.35] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [slides.length, slidesFormExpanded]);

  const scrollToId = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <aside className="hidden lg:flex flex-col w-56 border-r border-[var(--border-strong)] bg-[var(--bg-overlay)] sticky top-0 h-screen">
        <div className="p-4 border-b border-[var(--border-strong)]">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Slides
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
          <p className="text-[10px] text-[var(--text-faint)] mt-2 leading-snug">
            Fields match EDM Signal Deck.docx (Layout, Text, Subtext, Headers, bullets, bottom highlight).
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Deck sections">
          <ul className="space-y-0.5">
            <li>
              <a
                href="#deck-meta"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId("deck-meta");
                }}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                  activeId === "deck-meta"
                    ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border-sm)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                <span
                  className={
                    activeId === "deck-meta"
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-faint)] group-hover:text-[var(--text-muted)]"
                  }
                >
                  <SlideOutlineIcon />
                </span>
                <span className="text-xs font-medium">Deck details</span>
              </a>
            </li>
            {slideNavEntries.map(({ slide, i }) => {
              const sid = `deck-slide-${i}`;
              const navLabel = slide.title.length > 44 ? `${slide.title.slice(0, 42)}…` : slide.title;
              return (
                <li key={sid}>
                  <a
                    href={`#${sid}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId(sid);
                    }}
                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                      activeId === sid
                        ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border-sm)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    <span
                      className={
                        activeId === sid
                          ? "text-[var(--accent)]"
                          : "text-[var(--text-faint)] group-hover:text-[var(--text-muted)]"
                      }
                    >
                      <SlideOutlineIcon />
                    </span>
                    <span className="text-xs font-medium leading-snug">
                      <span className="text-[var(--text-faint)] tabular-nums mr-1">{i + 1}.</span>
                      {navLabel}
                    </span>
                  </a>
                </li>
              );
            })}
            {slides.length > SLIDES_PREVIEW_COUNT && !slidesFormExpanded ? (
              <li className="pt-1">
                <button
                  type="button"
                  onClick={() => setSlidesFormExpanded(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--accent)] border border-dashed border-[var(--accent-border)] hover:bg-[var(--accent-bg-sub)] transition-all text-left"
                >
                  + {slides.length - SLIDES_PREVIEW_COUNT} more slides · show all
                </button>
              </li>
            ) : null}
            {slides.length > SLIDES_PREVIEW_COUNT && slidesFormExpanded ? (
              <li className="pt-1">
                <button
                  type="button"
                  disabled={activeSlideIndex >= SLIDES_PREVIEW_COUNT}
                  title={
                    activeSlideIndex >= SLIDES_PREVIEW_COUNT
                      ? "Scroll to slide 5 or earlier to hide the rest"
                      : undefined
                  }
                  onClick={() => setSlidesFormExpanded(false)}
                  className="w-full px-3 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left"
                >
                  Show first {SLIDES_PREVIEW_COUNT} only
                </button>
              </li>
            ) : null}
            <li className="pt-2 mt-1 border-t border-[var(--border-strong)]">
              <button
                type="button"
                onClick={addSlide}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add slide
              </button>
            </li>
          </ul>
        </nav>
        <div className="p-3 border-t border-[var(--border-strong)]">
          <a
            href={`/dashboard/clients/${clientId}?tab=decks`}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to client
          </a>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <DeckSection id="deck-meta" title="Deck details" accent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Deck name" hint="Dashboard + deck header (not a doc slide field).">
                <Input
                  value={meta.deck_name}
                  onChange={(v) => setMeta((m) => ({ ...m, deck_name: v }))}
                  placeholder="Q2 2026 Signal Deck"
                />
              </Field>
              <Field label="Start date">
                <Input
                  type="date"
                  value={meta.deck_start}
                  onChange={(v) => setMeta((m) => ({ ...m, deck_start: v }))}
                />
              </Field>
              <Field label="End date">
                <Input
                  type="date"
                  value={meta.deck_end}
                  onChange={(v) => setMeta((m) => ({ ...m, deck_end: v }))}
                />
              </Field>
            </div>
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-[var(--accent-bg-sub)] border border-[var(--accent-border-sm)]">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center text-[var(--accent)] text-sm font-bold">
                {companyName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{companyName}</p>
                {ticker && <p className="text-xs text-[var(--accent)]">${ticker}</p>}
              </div>
            </div>
          </DeckSection>

          <div className="flex items-center justify-between gap-4 mb-2">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Slides (doc fields)
            </p>
            <button
              type="button"
              onClick={addSlide}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add slide
            </button>
          </div>

          {slideNavEntries.map(({ slide, i }) => {
            const sid = `deck-slide-${i}`;
            return (
              <DeckSection
                key={sid}
                id={sid}
                title={slide.title || `Slide ${i + 1}`}
                accent={i === 0}
                actions={
                  slides.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeSlide(i)}
                      className="text-xs font-medium text-[var(--danger)] hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  ) : undefined
                }
              >
                <Field label="Title" hint='Doc slide name or “Title:” line (e.g. SLIDE 1 — COVER, Signal Score™).'>
                  <Input
                    value={slide.title}
                    onChange={(v) => updateSlide(i, { title: v })}
                    placeholder="SLIDE 1 — COVER"
                  />
                </Field>
                <div className="mt-4 space-y-4">
                  <Field label="Layout" hint='Doc “Layout:” — composition / visual direction.'>
                    <TextArea
                      value={slide.layout ?? ""}
                      onChange={(v) => updateSlide(i, { layout: v || undefined })}
                      rows={2}
                      placeholder="Centered title · Background: gradient + subtle stock chart overlay"
                    />
                  </Field>
                  <Field label="Text" hint='Doc “Text:” — main headline and body copy for the slide.'>
                    <TextArea
                      value={slide.text ?? ""}
                      onChange={(v) => updateSlide(i, { text: v || undefined })}
                      rows={5}
                      placeholder="Main text block…"
                    />
                  </Field>
                  <Field label="Subtext" hint='Doc “Subtext:” — supporting line under the main text.'>
                    <TextArea
                      value={slide.subtext ?? ""}
                      onChange={(v) => updateSlide(i, { subtext: v || undefined })}
                      rows={2}
                      placeholder="Supporting line…"
                    />
                  </Field>
                  <Field label="Headers" hint='Doc “Headers:” — one header per line (e.g. three column titles).'>
                    <TextArea
                      value={(slide.headers || []).join("\n")}
                      onChange={(v) => {
                        const headers = v
                          .split("\n")
                          .map((l) => l.trim())
                          .filter(Boolean);
                        updateSlide(i, { headers: headers.length ? headers : undefined });
                      }}
                      rows={3}
                      placeholder="Algorithm Blind\nWrong Distribution\nNo Amplification"
                    />
                  </Field>
                  <Field label="Bottom highlight" hint='Doc “Bottom (highlight):”, “Big line:”, “Bottom stat bar:”, “Bottom Text (large):”, “Bottom:”, or “Highlight Box:”.'>
                    <TextArea
                      value={slide.bottomHighlight ?? ""}
                      onChange={(v) => updateSlide(i, { bottomHighlight: v || undefined })}
                      rows={2}
                      placeholder="Visibility ≠ Attention · Attention ≠ Action"
                    />
                  </Field>
                </div>
                <DeckSlideVisualEditor slide={slide} index={i} updateSlide={updateSlide} />
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Bullets
                    </label>
                    <button
                      type="button"
                      onClick={() => addBullet(i)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Add bullet
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(slide.bullets || []).map((b, j) => (
                      <div key={j} className="flex gap-2 items-center">
                        <span className="text-[var(--success)] text-xs shrink-0">•</span>
                        <Input value={b} onChange={(v) => updateBullet(i, j, v)} placeholder="Bullet" />
                        <button
                          type="button"
                          onClick={() => removeBullet(i, j)}
                          className="text-xs text-[var(--text-faint)] hover:text-[var(--danger)] transition-colors p-2 rounded-lg hover:bg-[var(--danger-bg)] shrink-0"
                          aria-label="Remove bullet"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </DeckSection>
            );
          })}

          {slides.length > SLIDES_PREVIEW_COUNT && !slidesFormExpanded ? (
            <div className="rounded-2xl border border-dashed border-[var(--accent-border)] bg-[var(--accent-bg-sub)] p-6 mb-6 space-y-3">
              <p className="text-sm text-[var(--text-muted)]">
                Showing slides <span className="font-semibold text-[var(--text-primary)]">1–{SLIDES_PREVIEW_COUNT}</span> of{" "}
                <span className="tabular-nums">{slides.length}</span>.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSlidesFormExpanded(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border-sm)] text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Show slides {SLIDES_PREVIEW_COUNT + 1}–{slides.length} ({slides.length - SLIDES_PREVIEW_COUNT} more)
                </button>
                <button
                  type="button"
                  onClick={addSlide}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add slide
                </button>
              </div>
            </div>
          ) : null}

          {slides.length > SLIDES_PREVIEW_COUNT && slidesFormExpanded ? (
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                disabled={activeSlideIndex >= SLIDES_PREVIEW_COUNT}
                title={
                  activeSlideIndex >= SLIDES_PREVIEW_COUNT
                    ? "Scroll to slide 5 or earlier to collapse the list"
                    : undefined
                }
                onClick={() => setSlidesFormExpanded(false)}
                className="text-xs font-semibold text-[var(--text-faint)] hover:text-[var(--text-muted)] underline-offset-2 hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
              >
                Show first {SLIDES_PREVIEW_COUNT} slides only
              </button>
            </div>
          ) : null}

          <div className="h-24" />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-overlay)]/95 backdrop-blur border-t border-[var(--border-strong)] px-6 py-3 flex items-center justify-between gap-4 lg:left-56">
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
            onClick={() => window.open(`/d/preview?deckId=${deckId}`, "_blank")}
            className="px-4 py-2 text-xs font-medium border border-[var(--border-strong)] text-[var(--text-muted)] rounded-xl hover:text-[var(--text-primary)] hover:border-[var(--hover-border)] transition-all"
          >
            Preview
          </button>
          <button
            type="button"
            disabled={publishing}
            onClick={async () => {
              setPublishing(true);
              try {
                await persistDraft(p, meta);
                const slug = await publishDeck(deckId);
                const url = `${window.location.origin}/d/${slug}`;
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
  );
}
