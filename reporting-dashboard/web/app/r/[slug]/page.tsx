import { getReportBySlug } from "@/lib/db";
import { notFound } from "next/navigation";
import type { ReportPayload } from "@/lib/db";
import { ReportViewer } from "./report-viewer";

export default async function PublicReportPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pdf?: string; print?: string }>;
}) {
  const { slug } = await props.params;
  const { pdf: pdfParam } = await props.searchParams;
  const report = await getReportBySlug(slug);
  if (!report) notFound();

  const payload: ReportPayload = JSON.parse(report.payload || "{}");
  const pdfMode = pdfParam === "1";

  return (
    <ReportViewer
      companyName={report.company_name}
      ticker={report.ticker}
      campaignName={report.campaign_name}
      campaignStart={report.campaign_start}
      campaignEnd={report.campaign_end}
      payload={payload}
      publicSlug={slug}
      pdfMode={pdfMode}
    />
  );
}
