import { auth } from "@/lib/auth";
import { getClient, listReports } from "@/lib/db";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ClientReportsSection } from "./client-reports-section";

export default async function ClientPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await props.params;
  const client = getClient(id);
  if (!client || client.user_id !== session.user.id) notFound();

  const reports = listReports(id);

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <header className="border-b border-[#252B35] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[#A0AEC0] hover:text-white text-sm transition">
            &larr; Clients
          </Link>
          <span className="text-[#252B35]">/</span>
          <h1 className="text-lg font-bold font-[family-name:var(--font-montserrat)]">
            {client.company_name}
          </h1>
          {client.ticker && (
            <span className="text-xs px-2 py-0.5 rounded bg-[#252B35] text-[#00E5FF] font-mono">
              ${client.ticker}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <ClientReportsSection
          clientId={id}
          reports={reports.map((r) => ({
            id: r.id,
            campaign_name: r.campaign_name,
            campaign_start: r.campaign_start,
            campaign_end: r.campaign_end,
            status: r.status,
            slug: r.slug,
          }))}
        />
      </main>
    </div>
  );
}
