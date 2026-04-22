import { Suspense } from "react";
import { auth } from "@/lib/auth";
import {
  getClient,
  listReports,
  getReportViewCount,
  listSignalDecks,
  getDeckViewCount,
} from "@/lib/db";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ClientWorkspace } from "./client-workspace";
import { ProfileMenu } from "../../profile-menu";
import { ThemeToggle } from "../../theme-toggle";

export default async function ClientPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await props.params;
  const client = await getClient(id);
  if (!client || client.user_id !== session.user.id) notFound();

  const [reports, decks] = await Promise.all([listReports(id), listSignalDecks(id)]);

  const [viewCounts, deckViewCounts] = await Promise.all([
    Promise.all(
      reports.map((r) =>
        r.status === "published" ? getReportViewCount(r.id) : Promise.resolve(0)
      )
    ),
    Promise.all(
      decks.map((d) =>
        d.status === "published" ? getDeckViewCount(d.id) : Promise.resolve(0)
      )
    ),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-[family-name:var(--font-montserrat)]">
            EDM Signal
          </h1>
          <div className="mt-0.5 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition">
              &larr; Clients
            </Link>
            <span className="text-[var(--border)]">/</span>
            <span className="text-[var(--text-primary)] font-semibold">{client.company_name}</span>
            {client.ticker && (
              <span className="text-xs px-2 py-0.5 rounded bg-[var(--hover-bg)] text-[var(--accent)] font-mono">
                ${client.ticker}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ProfileMenu
            displayName={session.user.name || session.user.email}
            email={session.user.email}
          />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <Suspense
          fallback={
            <div className="h-40 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] animate-pulse" />
          }
        >
          <ClientWorkspace
            clientId={id}
            reports={reports.map((r, i) => ({
              id: r.id,
              campaign_name: r.campaign_name,
              campaign_start: r.campaign_start,
              campaign_end: r.campaign_end,
              status: r.status,
              slug: r.slug,
              view_count: viewCounts[i],
            }))}
            decks={decks.map((d, i) => ({
              id: d.id,
              deck_name: d.deck_name,
              deck_start: d.deck_start,
              deck_end: d.deck_end,
              status: d.status,
              slug: d.slug,
              view_count: deckViewCounts[i],
            }))}
          />
        </Suspense>
      </main>
    </div>
  );
}
