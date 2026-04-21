import { auth } from "@/lib/auth";
import { getClient, listReports, getReportViewCount } from "@/lib/db";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ClientReportsSection } from "./client-reports-section";
import { ProfileMenu } from "../../profile-menu";
import { ThemeToggle } from "../../theme-toggle";

export default async function ClientPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await props.params;
  const client = await getClient(id);
  if (!client || client.user_id !== session.user.id) notFound();

  const reports = await listReports(id);

  // Fetch view counts for all published reports in parallel
  const viewCounts = await Promise.all(
    reports.map((r) =>
      r.status === "published" ? getReportViewCount(r.id) : Promise.resolve(0)
    )
  );

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
        <ClientReportsSection
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
        />
      </main>
    </div>
  );
}
