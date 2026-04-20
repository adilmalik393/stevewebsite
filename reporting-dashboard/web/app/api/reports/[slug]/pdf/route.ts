import { NextResponse } from "next/server";
import { chromium } from "playwright";
import { getReportBySlug } from "@/lib/db";
import { reportPdfFilename } from "@/lib/report-pdf-filename";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function baseUrlForPdf(): string {
  const raw =
    process.env.PDF_BASE_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://127.0.0.1:3000";
  return raw.replace(/\/$/, "");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const report = await getReportBySlug(slug);
  if (!report) {
    return NextResponse.json({ error: "Report not found or not published" }, { status: 404 });
  }

  const filename = reportPdfFilename(report.ticker, report.campaign_start);
  const origin = baseUrlForPdf();
  const url = `${origin}/r/${encodeURIComponent(slug)}?pdf=1`;

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector("html[data-pdf-ready='true']", { timeout: 60_000 });
    await page.emulateMedia({ media: "print" });

    const pdfBuffer = await page.pdf({
      printBackground: true,
      format: "A4",
      landscape: true,
      margin: { top: "12px", right: "12px", bottom: "12px", left: "12px" },
    });

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF render failed";
    console.error("[pdf]", message, err);
    return NextResponse.json(
      { error: "PDF generation failed", detail: message },
      { status: 500 }
    );
  } finally {
    await browser?.close().catch(() => {});
  }
}
