import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClient, getReport, updateReport } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SaveReportBody = {
  payload?: string;
  meta?: {
    campaign_name?: string;
    campaign_start?: string;
    campaign_end?: string;
  };
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ reportId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reportId } = await context.params;
  const report = await getReport(reportId);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const client = await getClient(report.client_id);
  if (!client || client.user_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: SaveReportBody;
  try {
    body = (await request.json()) as SaveReportBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: {
    payload?: string;
    campaign_name?: string;
    campaign_start?: string;
    campaign_end?: string;
  } = {};

  if (typeof body.payload === "string") patch.payload = body.payload;
  if (body.meta?.campaign_name !== undefined) patch.campaign_name = body.meta.campaign_name;
  if (body.meta?.campaign_start !== undefined) patch.campaign_start = body.meta.campaign_start;
  if (body.meta?.campaign_end !== undefined) patch.campaign_end = body.meta.campaign_end;

  await updateReport(reportId, patch);

  return NextResponse.json({ ok: true });
}
