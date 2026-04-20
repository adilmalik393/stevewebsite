import { turso } from "./turso";
import crypto from "crypto";
import type { Row } from "@libsql/client";

// --- Schema ---

export async function initSchema() {
  await turso.executeMultiple(`
    CREATE TABLE IF NOT EXISTS client (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      ticker TEXT,
      contact_email TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS report (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES client(id) ON DELETE CASCADE,
      campaign_name TEXT NOT NULL DEFAULT '',
      campaign_start TEXT,
      campaign_end TEXT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
      slug TEXT UNIQUE,
      payload TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS asset (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL REFERENCES report(id) ON DELETE CASCADE,
      kind TEXT NOT NULL DEFAULT 'screenshot',
      file_path TEXT NOT NULL,
      platform TEXT,
      engagement_count INTEGER,
      caption TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// --- Helpers ---

function toObj<T>(row: Row, columns: string[]): T {
  return Object.fromEntries(columns.map((col, i) => [col, row[i]])) as T;
}

function genId(): string {
  return crypto.randomBytes(12).toString("base64url");
}

function genSlug(): string {
  return crypto.randomBytes(7).toString("base64url").slice(0, 10);
}

// --- Types ---

export interface Client {
  id: string;
  user_id: string;
  company_name: string;
  ticker: string | null;
  contact_email: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  client_id: string;
  campaign_name: string;
  campaign_start: string | null;
  campaign_end: string | null;
  status: "draft" | "published";
  slug: string | null;
  payload: string;
  created_at: string;
  updated_at: string;
}

export interface ReportPayload {
  // Cover
  prepared_by?: string;
  // Executive Summary
  total_reach?: number;
  total_engagements?: number;
  signal_score_before?: number;
  signal_score_after?: number;
  assets_deployed?: number;
  // Signal Breakdown (each 0-100)
  execution_before?: number;
  execution_after?: number;
  clarity_before?: number;
  clarity_after?: number;
  distribution_before?: number;
  distribution_after?: number;
  engagement_axis_before?: number;
  engagement_axis_after?: number;
  // Content Deployment
  x_threads?: number;
  reddit_posts?: number;
  videos?: number;
  articles?: number;
  emails?: number;
  push_notifications?: number;
  // Distribution Reach
  x_reach?: number;
  reddit_reach?: number;
  discord_reach?: number;
  telegram_reach?: number;
  email_reach?: number;
  // Engagement
  likes?: number;
  comments?: number;
  shares?: number;
  clicks?: number;
  // Top Content
  top_content?: {
    platform: string;
    engagement_count: number;
    why_it_worked: string;
    screenshot_id?: string;
    screenshot_data_url?: string;
  }[];
  // PPC (optional)
  ppc_enabled?: boolean;
  impressions?: number;
  ctr?: number;
  cpc?: number;
  video_views?: number;
  // Influencer (optional)
  influencer_enabled?: boolean;
  influencers_activated?: number;
  influencer_reach?: number;
  influencer_engagement?: number;
  // Market Impact
  market_impact_bullets?: string[];
  // Next Steps
  recommended_cta_text?: string;
  next_steps_bullets?: string[];
}

// --- Client CRUD ---

export async function createClient(
  userId: string,
  data: { company_name: string; ticker?: string; contact_email?: string }
): Promise<Client> {
  const id = genId();
  await turso.execute({
    sql: `INSERT INTO client (id, user_id, company_name, ticker, contact_email) VALUES (?, ?, ?, ?, ?)`,
    args: [id, userId, data.company_name, data.ticker || null, data.contact_email || null],
  });
  return (await getClient(id))!;
}

export async function getClient(id: string): Promise<Client | null> {
  const result = await turso.execute({
    sql: `SELECT * FROM client WHERE id = ?`,
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return toObj<Client>(result.rows[0], result.columns);
}

export async function listClients(
  userId: string
): Promise<(Client & { report_count: number })[]> {
  const result = await turso.execute({
    sql: `SELECT c.*, (SELECT COUNT(*) FROM report r WHERE r.client_id = c.id) AS report_count
          FROM client c WHERE c.user_id = ? ORDER BY c.created_at DESC`,
    args: [userId],
  });
  return result.rows.map((row) =>
    toObj<Client & { report_count: number }>(row, result.columns)
  );
}

export async function deleteClient(id: string): Promise<void> {
  await turso.execute({ sql: `DELETE FROM client WHERE id = ?`, args: [id] });
}

// --- Report CRUD ---

export async function createReport(
  clientId: string,
  data: { campaign_name: string; campaign_start?: string; campaign_end?: string }
): Promise<Report> {
  const id = genId();
  await turso.execute({
    sql: `INSERT INTO report (id, client_id, campaign_name, campaign_start, campaign_end)
          VALUES (?, ?, ?, ?, ?)`,
    args: [id, clientId, data.campaign_name, data.campaign_start || null, data.campaign_end || null],
  });
  return (await getReport(id))!;
}

export async function getReport(id: string): Promise<Report | null> {
  const result = await turso.execute({
    sql: `SELECT * FROM report WHERE id = ?`,
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return toObj<Report>(result.rows[0], result.columns);
}

export async function getReportBySlug(
  slug: string
): Promise<(Report & { company_name: string; ticker: string | null }) | null> {
  const result = await turso.execute({
    sql: `SELECT r.*, c.company_name, c.ticker FROM report r
          JOIN client c ON c.id = r.client_id
          WHERE r.slug = ? AND r.status = 'published'`,
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  return toObj<Report & { company_name: string; ticker: string | null }>(
    result.rows[0],
    result.columns
  );
}

export async function listReports(clientId: string): Promise<Report[]> {
  const result = await turso.execute({
    sql: `SELECT * FROM report WHERE client_id = ? ORDER BY created_at DESC`,
    args: [clientId],
  });
  return result.rows.map((row) => toObj<Report>(row, result.columns));
}

export async function updateReport(
  id: string,
  data: Partial<{
    campaign_name: string;
    campaign_start: string;
    campaign_end: string;
    payload: string;
  }>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | null)[] = [];

  if (data.campaign_name !== undefined) { fields.push("campaign_name = ?"); values.push(data.campaign_name); }
  if (data.campaign_start !== undefined) { fields.push("campaign_start = ?"); values.push(data.campaign_start); }
  if (data.campaign_end !== undefined) { fields.push("campaign_end = ?"); values.push(data.campaign_end); }
  if (data.payload !== undefined) { fields.push("payload = ?"); values.push(data.payload); }

  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  values.push(id);

  await turso.execute({ sql: `UPDATE report SET ${fields.join(", ")} WHERE id = ?`, args: values });
}

export async function publishReport(id: string): Promise<string> {
  const report = await getReport(id);
  if (!report) throw new Error("Report not found");
  const slug = report.slug || genSlug();
  await turso.execute({
    sql: `UPDATE report SET status = 'published', slug = ?, updated_at = datetime('now') WHERE id = ?`,
    args: [slug, id],
  });
  return slug;
}

export async function unpublishReport(id: string): Promise<void> {
  await turso.execute({
    sql: `UPDATE report SET status = 'draft', updated_at = datetime('now') WHERE id = ?`,
    args: [id],
  });
}

export async function duplicateReport(id: string): Promise<Report> {
  const original = await getReport(id);
  if (!original) throw new Error("Report not found");
  const newId = genId();
  await turso.execute({
    sql: `INSERT INTO report (id, client_id, campaign_name, campaign_start, campaign_end, payload)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      newId,
      original.client_id,
      `${original.campaign_name} (copy)`,
      original.campaign_start,
      original.campaign_end,
      original.payload,
    ],
  });
  return (await getReport(newId))!;
}

export async function deleteReport(id: string): Promise<void> {
  await turso.execute({ sql: `DELETE FROM report WHERE id = ?`, args: [id] });
}

export default turso;
