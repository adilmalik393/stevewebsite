import { turso } from "@/lib/turso";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Delete all views with no country data (localhost test views)
    await turso.execute(`DELETE FROM report_view WHERE country IS NULL`);
    return NextResponse.json({ ok: true, message: "Cleared unknown views" });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
