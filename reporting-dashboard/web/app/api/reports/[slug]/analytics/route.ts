import { auth } from "@/lib/auth";
import { getReport, getReportViewStats } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  props: { params: Promise<{ slug: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await props.params;
  const report = await getReport(slug);
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stats = await getReportViewStats(slug);
  return NextResponse.json(stats);
}
