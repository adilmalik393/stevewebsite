import { getReportBySlug } from "@/lib/db";
import { notFound } from "next/navigation";
import type { ReportPayload } from "@/lib/db";
import { ReportViewer } from "./report-viewer";

export default async function PublicReportPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const report = getReportBySlug(slug);
  if (!report) notFound();

  const payload: ReportPayload = JSON.parse(report.payload || "{}");

  return (
    <ReportViewer
      companyName={report.company_name}
      ticker={report.ticker}
      campaignName={report.campaign_name}
      campaignStart={report.campaign_start}
      campaignEnd={report.campaign_end}
      payload={payload}
    />
  );
}
