import { auth } from "@/lib/auth";
import { getClient, getReport } from "@/lib/db";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ReportForm } from "./report-form";

export default async function ReportEditorPage(props: {
  params: Promise<{ id: string; reportId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id, reportId } = await props.params;
  const client = getClient(id);
  if (!client || client.user_id !== session.user.id) notFound();

  const report = getReport(reportId);
  if (!report || report.client_id !== id) notFound();

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <header className="border-b border-[#252B35] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="text-[#A0AEC0] hover:text-white transition">
            Clients
          </Link>
          <span className="text-[#252B35]">/</span>
          <Link
            href={`/dashboard/clients/${id}`}
            className="text-[#A0AEC0] hover:text-white transition"
          >
            {client.company_name}
          </Link>
          <span className="text-[#252B35]">/</span>
          <span className="text-white font-medium">
            {report.campaign_name || "Untitled Report"}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium ml-2 ${
              report.status === "published"
                ? "bg-[#00FF9D]/10 text-[#00FF9D]"
                : "bg-[#252B35] text-[#A0AEC0]"
            }`}
          >
            {report.status}
          </span>
        </div>
        {report.slug && report.status === "published" && (
          <Link
            href={`/r/${report.slug}`}
            target="_blank"
            className="text-xs text-[#00E5FF] hover:underline"
          >
            View published report &rarr;
          </Link>
        )}
      </header>

      <ReportForm
        reportId={report.id}
        clientId={id}
        companyName={client.company_name}
        ticker={client.ticker}
        publishedSlug={report.status === "published" && report.slug ? report.slug : null}
        initialMeta={{
          campaign_name: report.campaign_name,
          campaign_start: report.campaign_start || "",
          campaign_end: report.campaign_end || "",
        }}
        initialPayload={JSON.parse(report.payload || "{}")}
      />
    </div>
  );
}
