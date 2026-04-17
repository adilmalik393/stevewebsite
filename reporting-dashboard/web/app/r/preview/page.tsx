import { auth } from "@/lib/auth";
import { getReport, getClient } from "@/lib/db";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { ReportPayload } from "@/lib/db";
import { ReportViewer } from "../[slug]/report-viewer";

export default async function PreviewReportPage(props: {
  searchParams: Promise<{ reportId?: string; print?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { reportId } = await props.searchParams;
  if (!reportId) notFound();

  const report = await getReport(reportId);
  if (!report) notFound();

  const client = await getClient(report.client_id);
  if (!client || client.user_id !== session.user.id) notFound();

  const payload: ReportPayload = JSON.parse(report.payload || "{}");

  return (
    <ReportViewer
      companyName={client.company_name}
      ticker={client.ticker}
      campaignName={report.campaign_name}
      campaignStart={report.campaign_start}
      campaignEnd={report.campaign_end}
      payload={payload}
      isDraft
    />
  );
}
