import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const db = new Database(path.join(process.cwd(), "data", "app.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// --- Schema ---

db.exec(`
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

// --- Helpers ---

function genId(): string {
  return crypto.randomBytes(12).toString("base64url");
}

function genSlug(): string {
  return crypto.randomBytes(7).toString("base64url").slice(0, 10);
}

// --- Client CRUD ---

export interface Client {
  id: string;
  user_id: string;
  company_name: string;
  ticker: string | null;
  contact_email: string | null;
  created_at: string;
}

export function createClient(
  userId: string,
  data: { company_name: string; ticker?: string; contact_email?: string }
): Client {
  const id = genId();
  db.prepare(
    `INSERT INTO client (id, user_id, company_name, ticker, contact_email) VALUES (?, ?, ?, ?, ?)`
  ).run(id, userId, data.company_name, data.ticker || null, data.contact_email || null);
  return getClient(id)!;
}

export function getClient(id: string): Client | null {
  return db.prepare(`SELECT * FROM client WHERE id = ?`).get(id) as Client | null;
}

export function listClients(userId: string): (Client & { report_count: number })[] {
  return db
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM report r WHERE r.client_id = c.id) AS report_count
       FROM client c WHERE c.user_id = ? ORDER BY c.created_at DESC`
    )
    .all(userId) as (Client & { report_count: number })[];
}

export function deleteClient(id: string): void {
  db.prepare(`DELETE FROM client WHERE id = ?`).run(id);
}

// --- Report CRUD ---

export interface Report {
  id: string;
  client_id: string;
  campaign_name: string;
  campaign_start: string | null;
  campaign_end: string | null;
  status: "draft" | "published";
  slug: string | null;
  payload: string; // JSON string
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

export function createReport(
  clientId: string,
  data: { campaign_name: string; campaign_start?: string; campaign_end?: string }
): Report {
  const id = genId();
  db.prepare(
    `INSERT INTO report (id, client_id, campaign_name, campaign_start, campaign_end)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, clientId, data.campaign_name, data.campaign_start || null, data.campaign_end || null);
  return getReport(id)!;
}

export function getReport(id: string): Report | null {
  return db.prepare(`SELECT * FROM report WHERE id = ?`).get(id) as Report | null;
}

export function getReportBySlug(slug: string): (Report & { company_name: string; ticker: string | null }) | null {
  return db
    .prepare(
      `SELECT r.*, c.company_name, c.ticker FROM report r
       JOIN client c ON c.id = r.client_id
       WHERE r.slug = ? AND r.status = 'published'`
    )
    .get(slug) as (Report & { company_name: string; ticker: string | null }) | null;
}

export function listReports(clientId: string): Report[] {
  return db
    .prepare(`SELECT * FROM report WHERE client_id = ? ORDER BY created_at DESC`)
    .all(clientId) as Report[];
}

export function updateReport(
  id: string,
  data: Partial<{
    campaign_name: string;
    campaign_start: string;
    campaign_end: string;
    payload: string;
  }>
): void {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.campaign_name !== undefined) { fields.push("campaign_name = ?"); values.push(data.campaign_name); }
  if (data.campaign_start !== undefined) { fields.push("campaign_start = ?"); values.push(data.campaign_start); }
  if (data.campaign_end !== undefined) { fields.push("campaign_end = ?"); values.push(data.campaign_end); }
  if (data.payload !== undefined) { fields.push("payload = ?"); values.push(data.payload); }

  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE report SET ${fields.join(", ")} WHERE id = ?`).run(...values);
}

export function publishReport(id: string): string {
  const report = getReport(id);
  if (!report) throw new Error("Report not found");
  const slug = report.slug || genSlug();
  db.prepare(`UPDATE report SET status = 'published', slug = ?, updated_at = datetime('now') WHERE id = ?`).run(
    slug,
    id
  );
  return slug;
}

export function unpublishReport(id: string): void {
  db.prepare(`UPDATE report SET status = 'draft', updated_at = datetime('now') WHERE id = ?`).run(id);
}

export function duplicateReport(id: string): Report {
  const original = getReport(id);
  if (!original) throw new Error("Report not found");
  const newId = genId();
  db.prepare(
    `INSERT INTO report (id, client_id, campaign_name, campaign_start, campaign_end, payload)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    newId,
    original.client_id,
    `${original.campaign_name} (copy)`,
    original.campaign_start,
    original.campaign_end,
    original.payload
  );
  return getReport(newId)!;
}

export function deleteReport(id: string): void {
  db.prepare(`DELETE FROM report WHERE id = ?`).run(id);
}

export default db;
