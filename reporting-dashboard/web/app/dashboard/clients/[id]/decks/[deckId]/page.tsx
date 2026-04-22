import { auth } from "@/lib/auth";
import { getClient, getSignalDeck } from "@/lib/db";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { SignalDeckPayload } from "@/lib/db";
import { normalizeSignalDeckPayload } from "@/lib/signal-deck-normalize";
import { DeckForm } from "./deck-form";

export default async function DeckEditorPage(props: {
  params: Promise<{ id: string; deckId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id, deckId } = await props.params;
  const [client, deck] = await Promise.all([getClient(id), getSignalDeck(deckId)]);

  if (!client || client.user_id !== session.user.id) notFound();
  if (!deck || deck.client_id !== id) notFound();

  const payload: SignalDeckPayload = normalizeSignalDeckPayload(JSON.parse(deck.payload || "{}"));

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border-strong)] bg-[var(--bg-overlay)] px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <Link
            href="/dashboard"
            className="text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors shrink-0"
          >
            Dashboard
          </Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--border-strong)] shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <Link
            href={`/dashboard/clients/${id}?tab=decks`}
            className="text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors truncate max-w-[140px]"
          >
            {client.company_name}
          </Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--border-strong)] shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-[var(--text-primary)] font-medium truncate">{deck.deck_name || "Untitled deck"}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-lg font-semibold shrink-0 ${
              deck.status === "published"
                ? "bg-[var(--success-bg)] text-[var(--success)]"
                : "bg-[var(--border-strong)] text-[var(--text-faint)]"
            }`}
          >
            {deck.status}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {deck.slug && deck.status === "published" && (
            <Link
              href={`/d/${deck.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline"
            >
              View live deck
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </Link>
          )}
        </div>
      </header>

      <DeckForm
        deckId={deck.id}
        clientId={id}
        companyName={client.company_name}
        ticker={client.ticker}
        initialMeta={{
          deck_name: deck.deck_name,
          deck_start: deck.deck_start || "",
          deck_end: deck.deck_end || "",
        }}
        initialPayload={payload}
      />
    </div>
  );
}
