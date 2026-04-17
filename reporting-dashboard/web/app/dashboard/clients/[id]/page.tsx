import { auth } from "@/lib/auth";
import { getClient, listReports } from "@/lib/db";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { addReport, removeReport, publish, unpublish, duplicate } from "../../actions";
import { PublishButton, DuplicateButton } from "./report-actions";

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
        {/* New Report Form */}
        <form
          action={addReport}
          className="mb-8 rounded-xl border border-[#252B35] bg-[#151A22] p-6"
        >
          <input type="hidden" name="clientId" value={id} />
          <h3 className="text-sm font-semibold text-[#A0AEC0] uppercase tracking-wider mb-4">
            New campaign report
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#A0AEC0] mb-1">Campaign name *</label>
              <input
                name="campaign_name"
                required
                placeholder="Q1 2026 Signal Campaign"
                className="w-full px-3 py-2 bg-[#0B0F14] border border-[#252B35] rounded-lg text-white text-sm placeholder-[#4A5568] focus:outline-none focus:border-[#00E5FF] transition"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A0AEC0] mb-1">Start date</label>
              <input
                name="campaign_start"
                type="date"
                className="w-full px-3 py-2 bg-[#0B0F14] border border-[#252B35] rounded-lg text-white text-sm focus:outline-none focus:border-[#00E5FF] transition"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A0AEC0] mb-1">End date</label>
              <input
                name="campaign_end"
                type="date"
                className="w-full px-3 py-2 bg-[#0B0F14] border border-[#252B35] rounded-lg text-white text-sm focus:outline-none focus:border-[#00E5FF] transition"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-[#00E5FF] text-[#0B0F14] font-semibold rounded-lg text-sm hover:bg-[#00CCE5] transition"
          >
            Create report
          </button>
        </form>

        {/* Reports List */}
        <h2 className="text-xl font-bold mb-4">Reports</h2>
        {reports.length === 0 ? (
          <div className="rounded-xl border border-[#252B35] bg-[#151A22] p-12 text-center">
            <p className="text-[#4A5568]">No reports yet. Create one above.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-[#252B35] bg-[#151A22] p-4 flex items-center justify-between hover:border-[#353B45] transition"
              >
                <Link
                  href={`/dashboard/clients/${id}/reports/${report.id}`}
                  className="flex-1"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white">
                      {report.campaign_name || "Untitled"}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        report.status === "published"
                          ? "bg-[#00FF9D]/10 text-[#00FF9D]"
                          : "bg-[#252B35] text-[#A0AEC0]"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A5568] mt-1">
                    {report.campaign_start || "No dates"}{" "}
                    {report.campaign_end ? `→ ${report.campaign_end}` : ""}
                  </p>
                </Link>
                <div className="flex items-center gap-2 ml-4">
                  {report.slug && report.status === "published" && (
                    <Link
                      href={`/r/${report.slug}`}
                      target="_blank"
                      className="text-xs text-[#00E5FF] hover:underline"
                    >
                      View
                    </Link>
                  )}
                  <PublishButton reportId={report.id} status={report.status} slug={report.slug} />
                  <DuplicateButton reportId={report.id} clientId={id} />
                  <form action={removeReport}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="clientId" value={id} />
                    <button type="submit" className="text-xs text-[#4A5568] hover:text-[#FF4D4D] transition">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
