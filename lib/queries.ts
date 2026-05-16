import { getDb } from "./db";

export type Article = {
  id: string;
  url: string;
  source: string;
  published_at: number;
  headline_id: string;
  headline_en: string;
  summary_id: string;
  summary_en: string;
  why_matters_id: string | null;
  why_matters_en: string | null;
  sentiment: "bullish" | "bearish" | "neutral";
  impact: number;
  category: string;
  is_editor_pick: number;
  tags: string[];
};

type ViewMode = "all" | "trending" | "picks";

export function getLatestArticles(
  limit = 30,
  mode: ViewMode = "all",
): Article[] {
  const db = getDb();
  let where = "";
  let order = "a.published_at DESC";

  if (mode === "trending") {
    // last 24h, ordered by impact * recency
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    where = `AND a.published_at >= ${cutoff}`;
    order = "s.impact DESC, a.published_at DESC";
  } else if (mode === "picks") {
    where = `AND s.is_editor_pick = 1`;
  }

  const rows = db
    .prepare(
      `SELECT a.id, a.url, a.source, a.published_at,
              s.headline_id, s.headline_en, s.summary_id, s.summary_en,
              s.why_matters_id, s.why_matters_en,
              s.sentiment, s.impact, s.category, s.is_editor_pick, s.tags
       FROM summaries s
       JOIN articles a ON a.id = s.article_id
       WHERE a.status = 'summarized' ${where}
       ORDER BY ${order}
       LIMIT ?`,
    )
    .all(limit) as Array<Omit<Article, "tags"> & { tags: string }>;

  return rows.map((r) => ({
    ...r,
    tags: (() => {
      try {
        return JSON.parse(r.tags || "[]");
      } catch {
        return [];
      }
    })(),
  }));
}

export function getStats() {
  const db = getDb();
  const total = (
    db
      .prepare("SELECT COUNT(*) as c FROM articles WHERE status = 'summarized'")
      .get() as { c: number }
  ).c;
  const last24h = (
    db
      .prepare(
        `SELECT COUNT(*) as c FROM articles
         WHERE status = 'summarized' AND published_at >= ?`,
      )
      .get(Date.now() - 24 * 60 * 60 * 1000) as { c: number }
  ).c;
  return { total, last24h };
}
