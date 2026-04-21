import { NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Browser } from "playwright-core";
import { getReportBySlug } from "@/lib/db";
import { reportPdfFilename } from "@/lib/report-pdf-filename";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const execFileAsync = promisify(execFile);

/** Viewport matching A4 landscape at ~96dpi (same aspect as Playwright `format: "A4", landscape: true`). */
const PDF_VIEWPORT = {
  width: Math.round((297 / 25.4) * 96),
  height: Math.round((210 / 25.4) * 96),
} as const;

function baseUrlForPdf(): string {
  const raw =
    process.env.PDF_BASE_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://127.0.0.1:3000";
  return raw.replace(/\/$/, "");
}

/**
 * Vercel, AWS Lambda (OpenNext, Amplify, SST, etc.): use @sparticuz/chromium.
 * Do not run `playwright install` or the Playwright CLI — bundles often omit `lib/program`
 * and the CLI fails with MODULE_NOT_FOUND on `/var/task`.
 */
function useServerlessChromiumBundle(): boolean {
  if (process.env.VERCEL === "1") return true;
  // Lambda always sets AWS_EXECUTION_ENV (e.g. AWS_Lambda_nodejs20.x); do not rely on
  // AWS_LAMBDA_FUNCTION_VERSION alone (not always present in some runtimes).
  if (process.env.AWS_EXECUTION_ENV?.startsWith("AWS_Lambda")) return true;
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return true;
  if (process.env.LAMBDA_TASK_ROOT) return true;
  if (process.env.AWS_LAMBDA_LOG_GROUP_NAME) return true;
  // Bundlers sometimes strip Lambda env vars; cwd stays /var/task on Lambda.
  try {
    const cwd = process.cwd();
    if (cwd === "/var/task" || cwd.startsWith("/var/task/")) return true;
  } catch {
    /* ignore */
  }
  return false;
}

/** Full `playwright` npm package includes this file; tree-shaken / Lambda bundles often omit it — cli.js then crashes with MODULE_NOT_FOUND. */
function isPlaywrightPackageComplete(): boolean {
  return existsSync(path.join(process.cwd(), "node_modules", "playwright", "lib", "program.js"));
}

function isMissingPlaywrightExecutable(message: string): boolean {
  return (
    message.includes("Executable doesn't exist") ||
    message.includes("Please run the following command to download new browsers")
  );
}

/**
 * Sparticuz only inflates `al2023.tar.br` (libnspr4.so, libnss3.so, …) when `isRunningInAmazonLinux2023`
 * is true at **first** `@sparticuz/chromium` import. Vercel Fluid Compute sometimes omits AWS_* until
 * later — without al2023, `/tmp/chromium` exits with "libnspr4.so: cannot open shared object file".
 * @see https://github.com/Sparticuz/chromium/pull/340
 */
function prepareSparticuzServerlessEnv(): void {
  const major = Number.parseInt(process.versions.node.split(".")[0] ?? "20", 10);
  const vercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";
  const lambdaLike =
    Boolean(process.env.AWS_EXECUTION_ENV?.startsWith("AWS_Lambda")) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.LAMBDA_TASK_ROOT);
  let cwdIsLambdaTask = false;
  try {
    const cwd = process.cwd();
    cwdIsLambdaTask = cwd === "/var/task" || cwd.startsWith("/var/task/");
  } catch {
    /* ignore */
  }

  if (!vercel && !lambdaLike && !cwdIsLambdaTask) return;

  process.env.AWS_LAMBDA_JS_RUNTIME ??= `nodejs${major}.x`;
  if (!process.env.AWS_EXECUTION_ENV?.includes("AWS_Lambda")) {
    process.env.AWS_EXECUTION_ENV = `AWS_Lambda_nodejs${major}.x`;
  }
}

async function ensureChromiumInstalled(): Promise<void> {
  if (useServerlessChromiumBundle()) return;
  if (!isPlaywrightPackageComplete()) {
    throw new Error(
      "Playwright package is incomplete (missing lib/program.js); cannot run playwright install. Use serverless Chromium."
    );
  }
  const cli = path.join(process.cwd(), "node_modules", "playwright", "cli.js");
  await access(cli);
  await execFileAsync(process.execPath, [cli, "install", "chromium"], {
    cwd: process.cwd(),
    env: process.env,
    timeout: 180_000,
  });
}

/** Vercel/AWS: bundled Chromium via @sparticuz/chromium + playwright-core (no download step). */
async function launchBrowserServerless(): Promise<Browser> {
  prepareSparticuzServerlessEnv();

  const { chromium: playwrightChromium } = await import("playwright-core");
  const serverlessChromium = (await import("@sparticuz/chromium")).default;

  const executablePath = await serverlessChromium.executablePath();
  const al2023Lib = path.join(os.tmpdir(), "al2023", "lib");
  const chromiumDir = path.dirname(executablePath);
  const merged = [al2023Lib, chromiumDir, process.env.LD_LIBRARY_PATH]
    .filter(Boolean)
    .join(":")
    .split(":")
    .filter((p, i, a) => p && a.indexOf(p) === i);
  process.env.LD_LIBRARY_PATH = merged.join(":");

  return playwrightChromium.launch({
    args: serverlessChromium.args,
    executablePath,
    env: { ...process.env, LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH },
    headless: true,
  });
}

async function launchBrowserLocal(): Promise<Browser> {
  const launchConfig = {
    headless: true as const,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  };

  const { chromium } = await import("playwright");
  try {
    return await chromium.launch(launchConfig);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!isMissingPlaywrightExecutable(message)) throw err;
    if (useServerlessChromiumBundle() || !isPlaywrightPackageComplete()) {
      return launchBrowserServerless();
    }
    await ensureChromiumInstalled();
    return chromium.launch(launchConfig);
  }
}

async function launchBrowserWithFallback(): Promise<Browser> {
  if (useServerlessChromiumBundle()) {
    return launchBrowserServerless();
  }
  // Deployed bundles often ship a partial `playwright` (cli stub only) — never call its install.
  if (!isPlaywrightPackageComplete()) {
    return launchBrowserServerless();
  }
  return launchBrowserLocal();
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
    browser = await launchBrowserWithFallback();
    const page = await browser.newPage();
    await page.setViewportSize(PDF_VIEWPORT);
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
