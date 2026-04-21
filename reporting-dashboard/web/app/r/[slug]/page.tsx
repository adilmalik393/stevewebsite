import { getReportBySlug, logReportView } from "@/lib/db";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
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

  // Track the view (skip for PDF/print renders)
  if (!pdfMode) {
    try {
      const headersList = await headers();

      // Vercel injects geo headers automatically (2-letter ISO code e.g. "US", "PK")
      const vercelCode = headersList.get("x-vercel-ip-country");
      let countryCode: string | null = vercelCode;
      let city: string | null = headersList.get("x-vercel-ip-city");
      // Convert 2-letter code to full country name using Intl API
      let country: string | null = vercelCode
        ? (new Intl.DisplayNames(["en"], { type: "region" }).of(vercelCode) ?? vercelCode)
        : null;

      // Fallback: use ip-api.com when running outside Vercel
      if (!country) {
        const ip =
          headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
        const isLocal = !ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("::ffff:127.") || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.");
        if (!isLocal) {
          try {
            const geo = await fetch(
              `http://ip-api.com/json/${ip}?fields=country,countryCode,city`,
              { next: { revalidate: 0 } }
            );
            if (geo.ok) {
              const data = await geo.json();
              country = data.country ?? null;
              countryCode = data.countryCode ?? null;
              city = data.city ?? null;
            }
          } catch {
            // geo lookup failed — log without location
          }
        }
      }

      await logReportView(report.id, country, countryCode, city);
    } catch {
      // never block the page render if analytics fail
    }
  }

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
