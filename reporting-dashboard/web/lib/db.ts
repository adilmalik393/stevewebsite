import { turso } from "./turso";
import crypto from "crypto";
import type { InStatement, Row } from "@libsql/client";

// --- Schema ---

let migrationsPromise: Promise<void> | null = null;

/** Runs CREATE TABLE IF NOT EXISTS once per process (covers dev / deploy without instrumentation). */
async function ensureMigrations(): Promise<void> {
  if (!migrationsPromise) {
    migrationsPromise = turso
      .executeMultiple(`
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

    CREATE TABLE IF NOT EXISTS report_view (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL REFERENCES report(id) ON DELETE CASCADE,
      country TEXT,
      country_code TEXT,
      city TEXT,
      viewed_at TEXT NOT NULL DEFAULT (datetime('now'))
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

    CREATE TABLE IF NOT EXISTS signal_deck (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES client(id) ON DELETE CASCADE,
      deck_name TEXT NOT NULL DEFAULT '',
      deck_start TEXT,
      deck_end TEXT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
      slug TEXT UNIQUE,
      payload TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS signal_deck_view (
      id TEXT PRIMARY KEY,
      deck_id TEXT NOT NULL REFERENCES signal_deck(id) ON DELETE CASCADE,
      country TEXT,
      country_code TEXT,
      city TEXT,
      viewed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
      .then(() => undefined)
      .catch((err) => {
        migrationsPromise = null;
        throw err;
      });
  }
  await migrationsPromise;
}

async function exec(stmt: InStatement) {
  await ensureMigrations();
  return turso.execute(stmt);
}

export async function initSchema(): Promise<void> {
  await ensureMigrations();
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

export interface SignalDeck {
  id: string;
  client_id: string;
  deck_name: string;
  deck_start: string | null;
  deck_end: string | null;
  status: "draft" | "published";
  slug: string | null;
  payload: string;
  created_at: string;
  updated_at: string;
}

/** One cell in the 4-quadrant Signal Score breakdown slide. */
export interface SignalDeckQuadrant {
  title: string;
  bullets?: string[];
}

/** One metric row for before/after bar-style comparison (scores 0–100). */
export interface SignalDeckBarMetricRow {
  name: string;
  before: number;
  after: number;
}

/** Structured before/after Signal Score comparison (doc: bar comparison). */
export interface SignalDeckSignalBarCompare {
  beforeLabel?: string;
  afterLabel?: string;
  metrics: SignalDeckBarMetricRow[];
  beforeTotal?: number;
  afterTotal?: number;
}

/** One tier column on the packages slide. */
export interface SignalDeckPricingColumn {
  name: string;
  price: string;
  /** Highlight this tier (e.g. Amplified ⭐). */
  highlight?: boolean;
}

/** One row in the package feature comparison table. */
export interface SignalDeckFeatureRow {
  feature: string;
  starter: boolean;
  amplified: boolean;
  dominance: boolean;
}

/**
 * One slide — fields follow `documents/EDM Signal Deck.docx` (Layout, Text, Subtext,
 * Headers, bullets, bottom highlight / big line / stat bar).
 * Optional `quadrants` / `signalBarCompare` / `pricingColumns` / `featureMatrix` / `visualAccent`
 * power structured visuals in the public deck viewer.
 * Legacy keys (`body`, `subtitle`, `layoutNotes`, `bottomLine`) are mapped on read via
 * `normalizeSignalDeckPayload` in `signal-deck-normalize.ts`.
 */
export interface SignalDeckSlide {
  /** Doc slide name or doc “Title:” (e.g. SLIDE 1 — COVER, Signal Score™). */
  title: string;
  /** Doc “Layout:” */
  layout?: string;
  /** Doc “Text:” — main body block. */
  text?: string;
  /** Doc “Subtext:” */
  subtext?: string;
  /** Doc “Headers:” — e.g. three column headers. */
  headers?: string[];
  /** Bullet lines (Text bullets, Includes, etc.). */
  bullets?: string[];
  /** Doc “Bottom (highlight):”, “Big line:”, “Bottom stat bar:”, “Bottom Text (large):”, “Bottom:”, “Highlight Box:”. */
  bottomHighlight?: string;
  /** Four-quadrant breakdown (doc: Signal Score breakdown). */
  quadrants?: SignalDeckQuadrant[];
  /** Before vs after metrics as grouped bars (doc: Before vs After Signal Score). */
  signalBarCompare?: SignalDeckSignalBarCompare;
  /** 3-column pricing row (doc: Packages). */
  pricingColumns?: SignalDeckPricingColumn[];
  /** Feature × tier matrix (doc: Package comparison table). */
  featureMatrix?: SignalDeckFeatureRow[];
  /** Decorative layer (e.g. doc PPC slide “rising chart”). */
  visualAccent?: "rising_chart";
}

export interface SignalDeckPayload {
  slides?: SignalDeckSlide[];
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
  algo_sentiment_bias?: string;
  campaign_type?: string;
  // Signal Analysis
  pr_score_bullets?: string[];
  // PR Rewrite & Message Upgrade
  pr_rewrite_pairs?: {
    original: string;
    rewrite: string;
  }[];
  message_improvement_notes?: string[];
  // Next PR Guidance
  next_pr_bullets?: string[];
  // Signal Breakdown (each 0-100)
  signal_score_enabled?: boolean;
  execution_before?: number;
  execution_after?: number;
  clarity_before?: number;
  clarity_after?: number;
  distribution_before?: number;
  distribution_after?: number;
  engagement_axis_before?: number;
  engagement_axis_after?: number;
  // Content Deployment
  content_deployment_enabled?: boolean;
  x_threads?: number;
  reddit_posts?: number;
  videos?: number;
  articles?: number;
  emails?: number;
  push_notifications?: number;
  content_deployment_platforms?: {
    platform: string;
    count?: number;
  }[];
  // Distribution Reach
  distribution_enabled?: boolean;
  x_reach?: number;
  reddit_reach?: number;
  discord_reach?: number;
  telegram_reach?: number;
  email_reach?: number;
  x_reach_url?: string;
  reddit_reach_url?: string;
  discord_reach_url?: string;
  telegram_reach_url?: string;
  email_reach_url?: string;
  distribution_channels?: {
    platform: string;
    reach?: number;
    link?: string;
  }[];
  // Engagement
  engagement_enabled?: boolean;
  likes?: number;
  comments?: number;
  shares?: number;
  clicks?: number;
  // Top Content
  top_content?: {
    platform: string;
    engagement_count: number;
    why_it_worked: string;
    content_url?: string;
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
  market_impact_enabled?: boolean;
  market_impact_bullets?: string[];
  // Next Steps
  next_steps_enabled?: boolean;
  recommended_cta_text?: string;
  next_steps_bullets?: string[];
  // Social Posts
  x_post_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  stocktwits_post?: string;
  linkedin_post?: string;
  reddit_post?: string;
}

// --- Client CRUD ---

export async function createClient(
  userId: string,
  data: { company_name: string; ticker?: string; contact_email?: string }
): Promise<Client> {
  const id = genId();
  await exec({
    sql: `INSERT INTO client (id, user_id, company_name, ticker, contact_email) VALUES (?, ?, ?, ?, ?)`,
    args: [id, userId, data.company_name, data.ticker || null, data.contact_email || null],
  });
  return (await getClient(id))!;
}

export async function getClient(id: string): Promise<Client | null> {
  const result = await exec({
    sql: `SELECT * FROM client WHERE id = ?`,
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return toObj<Client>(result.rows[0], result.columns);
}

export async function listClients(
  userId: string
): Promise<(Client & { report_count: number })[]> {
  const result = await exec({
    sql: `SELECT c.*, (SELECT COUNT(*) FROM report r WHERE r.client_id = c.id) AS report_count
          FROM client c WHERE c.user_id = ? ORDER BY c.created_at DESC`,
    args: [userId],
  });
  return result.rows.map((row) =>
    toObj<Client & { report_count: number }>(row, result.columns)
  );
}

export async function deleteClient(id: string): Promise<void> {
  await exec({ sql: `DELETE FROM client WHERE id = ?`, args: [id] });
}

// --- Report CRUD ---

export async function createReport(
  clientId: string,
  data: { campaign_name: string; campaign_start?: string; campaign_end?: string }
): Promise<Report> {
  const id = genId();
  await exec({
    sql: `INSERT INTO report (id, client_id, campaign_name, campaign_start, campaign_end)
          VALUES (?, ?, ?, ?, ?)`,
    args: [id, clientId, data.campaign_name, data.campaign_start || null, data.campaign_end || null],
  });
  return (await getReport(id))!;
}

export async function getReport(id: string): Promise<Report | null> {
  const result = await exec({
    sql: `SELECT * FROM report WHERE id = ?`,
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return toObj<Report>(result.rows[0], result.columns);
}

export async function getReportBySlug(
  slug: string
): Promise<(Report & { company_name: string; ticker: string | null }) | null> {
  const result = await exec({
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
  const result = await exec({
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

  await exec({ sql: `UPDATE report SET ${fields.join(", ")} WHERE id = ?`, args: values });
}

export async function publishReport(id: string): Promise<string> {
  const report = await getReport(id);
  if (!report) throw new Error("Report not found");
  const slug = report.slug || genSlug();
  await exec({
    sql: `UPDATE report SET status = 'published', slug = ?, updated_at = datetime('now') WHERE id = ?`,
    args: [slug, id],
  });
  return slug;
}

export async function unpublishReport(id: string): Promise<void> {
  await exec({
    sql: `UPDATE report SET status = 'draft', updated_at = datetime('now') WHERE id = ?`,
    args: [id],
  });
}

export async function duplicateReport(id: string): Promise<Report> {
  const original = await getReport(id);
  if (!original) throw new Error("Report not found");
  const newId = genId();
  await exec({
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
  await exec({ sql: `DELETE FROM report WHERE id = ?`, args: [id] });
}

// --- Signal deck CRUD ---

export async function createSignalDeck(
  clientId: string,
  data: {
    deck_name: string;
    deck_start?: string;
    deck_end?: string;
    /** JSON string; defaults to "{}" when omitted. */
    payload?: string;
  }
): Promise<SignalDeck> {
  const id = genId();
  const payloadJson = data.payload ?? "{}";
  await exec({
    sql: `INSERT INTO signal_deck (id, client_id, deck_name, deck_start, deck_end, payload)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      clientId,
      data.deck_name,
      data.deck_start || null,
      data.deck_end || null,
      payloadJson,
    ],
  });
  return (await getSignalDeck(id))!;
}

export async function getSignalDeck(id: string): Promise<SignalDeck | null> {
  const result = await exec({
    sql: `SELECT * FROM signal_deck WHERE id = ?`,
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return toObj<SignalDeck>(result.rows[0], result.columns);
}

export async function getSignalDeckBySlug(
  slug: string
): Promise<(SignalDeck & { company_name: string; ticker: string | null }) | null> {
  const result = await exec({
    sql: `SELECT d.*, c.company_name, c.ticker FROM signal_deck d
          JOIN client c ON c.id = d.client_id
          WHERE d.slug = ? AND d.status = 'published'`,
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  return toObj<SignalDeck & { company_name: string; ticker: string | null }>(
    result.rows[0],
    result.columns
  );
}

export async function listSignalDecks(clientId: string): Promise<SignalDeck[]> {
  const result = await exec({
    sql: `SELECT * FROM signal_deck WHERE client_id = ? ORDER BY created_at DESC`,
    args: [clientId],
  });
  return result.rows.map((row) => toObj<SignalDeck>(row, result.columns));
}

export async function updateSignalDeck(
  id: string,
  data: Partial<{
    deck_name: string;
    deck_start: string;
    deck_end: string;
    payload: string;
  }>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | null)[] = [];

  if (data.deck_name !== undefined) {
    fields.push("deck_name = ?");
    values.push(data.deck_name);
  }
  if (data.deck_start !== undefined) {
    fields.push("deck_start = ?");
    values.push(data.deck_start);
  }
  if (data.deck_end !== undefined) {
    fields.push("deck_end = ?");
    values.push(data.deck_end);
  }
  if (data.payload !== undefined) {
    fields.push("payload = ?");
    values.push(data.payload);
  }

  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  values.push(id);

  await exec({
    sql: `UPDATE signal_deck SET ${fields.join(", ")} WHERE id = ?`,
    args: values,
  });
}

export async function publishSignalDeck(id: string): Promise<string> {
  const deck = await getSignalDeck(id);
  if (!deck) throw new Error("Deck not found");
  const slug = deck.slug || genSlug();
  await exec({
    sql: `UPDATE signal_deck SET status = 'published', slug = ?, updated_at = datetime('now') WHERE id = ?`,
    args: [slug, id],
  });
  return slug;
}

export async function unpublishSignalDeck(id: string): Promise<void> {
  await exec({
    sql: `UPDATE signal_deck SET status = 'draft', updated_at = datetime('now') WHERE id = ?`,
    args: [id],
  });
}

export async function duplicateSignalDeck(id: string): Promise<SignalDeck> {
  const original = await getSignalDeck(id);
  if (!original) throw new Error("Deck not found");
  const newId = genId();
  await exec({
    sql: `INSERT INTO signal_deck (id, client_id, deck_name, deck_start, deck_end, payload)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      newId,
      original.client_id,
      `${original.deck_name} (copy)`,
      original.deck_start,
      original.deck_end,
      original.payload,
    ],
  });
  return (await getSignalDeck(newId))!;
}

export async function deleteSignalDeck(id: string): Promise<void> {
  await exec({ sql: `DELETE FROM signal_deck WHERE id = ?`, args: [id] });
}

// --- Report View Analytics ---

export async function logReportView(
  reportId: string,
  country?: string | null,
  countryCode?: string | null,
  city?: string | null
): Promise<void> {
  const id = genId();
  await exec({
    sql: `INSERT INTO report_view (id, report_id, country, country_code, city) VALUES (?, ?, ?, ?, ?)`,
    args: [id, reportId, country ?? null, countryCode ?? null, city ?? null],
  });
}

export interface ReportViewStats {
  total: number;
  byCountry: { country: string | null; country_code: string | null; views: number }[];
  recentViews: { viewed_at: string; country: string | null; city: string | null }[];
}

export async function getReportViewStats(reportId: string): Promise<ReportViewStats> {
  const [totalResult, byCountryResult, recentResult] = await Promise.all([
    exec({
      sql: `SELECT COUNT(*) as total FROM report_view WHERE report_id = ?`,
      args: [reportId],
    }),
    exec({
      sql: `SELECT country, country_code, COUNT(*) as views
            FROM report_view WHERE report_id = ?
            GROUP BY country, country_code ORDER BY views DESC LIMIT 20`,
      args: [reportId],
    }),
    exec({
      sql: `SELECT viewed_at, country, city FROM report_view
            WHERE report_id = ? ORDER BY viewed_at DESC LIMIT 10`,
      args: [reportId],
    }),
  ]);

  return {
    total: Number(totalResult.rows[0][0]),
    byCountry: byCountryResult.rows.map((r) =>
      toObj<{ country: string | null; country_code: string | null; views: number }>(
        r,
        byCountryResult.columns
      )
    ),
    recentViews: recentResult.rows.map((r) =>
      toObj<{ viewed_at: string; country: string | null; city: string | null }>(
        r,
        recentResult.columns
      )
    ),
  };
}

export async function getReportViewCount(reportId: string): Promise<number> {
  const result = await exec({
    sql: `SELECT COUNT(*) as total FROM report_view WHERE report_id = ?`,
    args: [reportId],
  });
  return Number(result.rows[0][0]);
}

export async function logDeckView(
  deckId: string,
  country?: string | null,
  countryCode?: string | null,
  city?: string | null
): Promise<void> {
  const id = genId();
  await exec({
    sql: `INSERT INTO signal_deck_view (id, deck_id, country, country_code, city) VALUES (?, ?, ?, ?, ?)`,
    args: [id, deckId, country ?? null, countryCode ?? null, city ?? null],
  });
}

export async function getDeckViewCount(deckId: string): Promise<number> {
  const result = await exec({
    sql: `SELECT COUNT(*) as total FROM signal_deck_view WHERE deck_id = ?`,
    args: [deckId],
  });
  return Number(result.rows[0][0]);
}

export default turso;
