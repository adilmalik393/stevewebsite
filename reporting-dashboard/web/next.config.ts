import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "playwright",
    "playwright-core",
    "@sparticuz/chromium",
    "@libsql/client",
  ],
  /**
   * @sparticuz/chromium loads brotli-compressed binaries from `node_modules/.../bin/`.
   * Next file tracing only follows JS imports — without this, Vercel deploys omit `bin/` and
   * executablePath() throws "input directory .../bin does not exist".
   */
  outputFileTracingIncludes: {
    // Narrower than `/*` — only API routes under /api/reports (PDF + analytics share trace scope is OK).
    "/api/reports/**": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
