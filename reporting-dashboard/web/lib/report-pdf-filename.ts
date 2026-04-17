/** PRD §6.6: `EDM_Signal_Report_{ticker}_{campaign_start}.pdf` — safe for Content-Disposition. */
export function reportPdfFilename(ticker: string | null, campaignStart: string | null): string {
  const safeTicker = (ticker?.trim() ? ticker.trim() : "NO_TICKER").replace(/[^\w-]+/g, "_");
  const safeDate = (campaignStart?.trim() ? campaignStart.trim() : "unknown").replace(/[^\d-]+/g, "");
  return `EDM_Signal_Report_${safeTicker}_${safeDate}.pdf`;
}
