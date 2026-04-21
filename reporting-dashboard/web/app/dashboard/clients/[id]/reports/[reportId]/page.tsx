import { auth } from "@/lib/auth";
import { getClient, getReport, listReports } from "@/lib/db";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ReportForm } from "./report-form";
import { ReportSwitcher } from "./report-switcher";
import { AnalyticsModal } from "./analytics-modal";

export default async function ReportEditorPage(props: {
  params: Promise<{ id: string; reportId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id, reportId } = await props.params;
  const [client, report, allReports] = await Promise.all([
    getClient(id),
    getReport(reportId),
    listReports(id),
  ]);

  if (!client || client.user_id !== session.user.id) notFound();
  if (!report || report.client_id !== id) notFound();

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
            href={`/dashboard/clients/${id}`}
            className="text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors truncate max-w-[120px]"
          >
            {client.company_name}
          </Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--border-strong)] shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <ReportSwitcher
            clientId={id}
            currentReportId={reportId}
            currentName={report.campaign_name || "Untitled Report"}
            reports={allReports.map((r) => ({
              id: r.id,
              campaign_name: r.campaign_name,
              status: r.status,
            }))}
          />
          <span
            className={`text-xs px-2 py-0.5 rounded-lg font-semibold shrink-0 ${
              report.status === "published"
                ? "bg-[var(--success-bg)] text-[var(--success)]"
                : "bg-[var(--border-strong)] text-[var(--text-faint)]"
            }`}
          >
            {report.status}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {report.status === "published" && (
            <AnalyticsModal reportId={report.id} />
          )}
          {report.slug && report.status === "published" && (
            <Link
              href={`/r/${report.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline"
            >
              View live report
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </Link>
          )}
        </div>
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
