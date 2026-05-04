"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClientReportsSection, type ReportListItem } from "./client-reports-section";
import { ClientDecksSection, type DeckListItem } from "./client-decks-section";

type Tab = "reports" | "decks";

export function ClientWorkspace({
  clientId,
  reports,
  decks,
}: {
  clientId: string;
  reports: ReportListItem[];
  decks: DeckListItem[];
}) {
  const sp = useSearchParams();
  const tab: Tab = sp.get("tab") === "decks" ? "decks" : "reports";
  const base = `/dashboard/clients/${clientId}`;

  return (
    <div>
      {/* <div className="flex gap-1 mb-8 p-1 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] w-fit max-w-full overflow-x-auto">
        <Link
          href={base}
          scroll={false}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
            tab === "reports"
              ? "bg-[var(--accent)] text-white shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
          }`}
        >
          Reports
        </Link>
        <Link
          href={`${base}?tab=decks`}
          scroll={false}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
            tab === "decks"
              ? "bg-[var(--accent)] text-white shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
          }`}
        >
          Signal Deck
        </Link>
      </div> */}

      {tab === "reports" ? (
        <ClientReportsSection clientId={clientId} reports={reports} />
      ) : (
        <ClientDecksSection clientId={clientId} decks={decks} />
      )}
    </div>
  );
}
