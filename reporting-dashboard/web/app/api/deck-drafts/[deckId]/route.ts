import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getClient, getSignalDeck, updateSignalDeck } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SaveDeckBody = {
  payload?: string;
  meta?: {
    deck_name?: string;
    deck_start?: string;
    deck_end?: string;
  };
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ deckId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deckId } = await context.params;
    const deck = await getSignalDeck(deckId);
    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const client = await getClient(deck.client_id);
    if (!client || client.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: SaveDeckBody;
    try {
      body = (await request.json()) as SaveDeckBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const patch: {
      payload?: string;
      deck_name?: string;
      deck_start?: string;
      deck_end?: string;
    } = {};

    if (typeof body.payload === "string") patch.payload = body.payload;
    if (body.meta?.deck_name !== undefined) patch.deck_name = body.meta.deck_name;
    if (body.meta?.deck_start !== undefined) patch.deck_start = body.meta.deck_start;
    if (body.meta?.deck_end !== undefined) patch.deck_end = body.meta.deck_end;

    await updateSignalDeck(deckId, patch);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[deck-drafts PATCH]", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
