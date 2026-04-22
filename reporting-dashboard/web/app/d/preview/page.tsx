import { auth } from "@/lib/auth";
import { getClient, getSignalDeck } from "@/lib/db";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { SignalDeckPayload } from "@/lib/db";
import { normalizeSignalDeckPayload } from "@/lib/signal-deck-normalize";
import { DeckViewer } from "../deck-viewer";

export default async function PreviewDeckPage(props: {
  searchParams: Promise<{ deckId?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { deckId } = await props.searchParams;
  if (!deckId) notFound();

  const deck = await getSignalDeck(deckId);
  if (!deck) notFound();

  const client = await getClient(deck.client_id);
  if (!client || client.user_id !== session.user.id) notFound();

  const payload: SignalDeckPayload = normalizeSignalDeckPayload(JSON.parse(deck.payload || "{}"));

  return (
    <DeckViewer
      companyName={client.company_name}
      ticker={client.ticker}
      deckName={deck.deck_name}
      deckStart={deck.deck_start}
      deckEnd={deck.deck_end}
      payload={payload}
      isDraft
    />
  );
}
