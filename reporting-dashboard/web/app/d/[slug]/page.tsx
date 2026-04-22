import { getSignalDeckBySlug, logDeckView } from "@/lib/db";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { SignalDeckPayload } from "@/lib/db";
import { normalizeSignalDeckPayload } from "@/lib/signal-deck-normalize";
import { DeckViewer } from "../deck-viewer";

export default async function PublicDeckPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const deck = await getSignalDeckBySlug(slug);
  if (!deck) notFound();

  const payload: SignalDeckPayload = normalizeSignalDeckPayload(JSON.parse(deck.payload || "{}"));

  try {
    const headersList = await headers();
    const vercelCode = headersList.get("x-vercel-ip-country");
    let countryCode: string | null = vercelCode;
    let city: string | null = headersList.get("x-vercel-ip-city");
    let country: string | null = vercelCode
      ? (new Intl.DisplayNames(["en"], { type: "region" }).of(vercelCode) ?? vercelCode)
      : null;

    if (!country) {
      const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
      const isLocal =
        !ip ||
        ip === "::1" ||
        ip === "127.0.0.1" ||
        ip.startsWith("::ffff:127.") ||
        ip.startsWith("192.168.") ||
        ip.startsWith("10.") ||
        ip.startsWith("172.");
      if (!isLocal) {
        try {
          const geo = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode,city`, {
            next: { revalidate: 0 },
          });
          if (geo.ok) {
            const data = await geo.json();
            country = data.country ?? null;
            countryCode = data.countryCode ?? null;
            city = data.city ?? null;
          }
        } catch {
          // ignore
        }
      }
    }

    await logDeckView(deck.id, country, countryCode, city);
  } catch {
    // never block render
  }

  return (
    <DeckViewer
      companyName={deck.company_name}
      ticker={deck.ticker}
      deckName={deck.deck_name}
      deckStart={deck.deck_start}
      deckEnd={deck.deck_end}
      payload={payload}
    />
  );
}
