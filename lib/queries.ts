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

export async function getLatestArticles(
  limit = 30,
  mode: ViewMode = "all",
): Promise<Article[]> {
  const db = await getDb();
  let where = "";
  let order = "a.published_at DESC";

  if (mode === "trending") {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    where = `AND a.published_at >= ${cutoff}`;
    order = "s.impact DESC, a.published_at DESC";
  } else if (mode === "picks") {
    where = `AND s.is_editor_pick = 1`;
  }

  const result = await db.execute({
    sql: `SELECT a.id, a.url, a.source, a.published_at,
            s.headline_id, s.headline_en, s.summary_id, s.summary_en,
            s.why_matters_id, s.why_matters_en,
            s.sentiment, s.impact, s.category, s.is_editor_pick, s.tags
     FROM summaries s
     JOIN articles a ON a.id = s.article_id
     WHERE a.status = 'summarized' ${where}
     ORDER BY ${order}
     LIMIT ?`,
    args: [limit],
  });

  return result.rows.map((r) => {
    const tagsRaw = (r.tags as string | null) || "[]";
    let tags: string[] = [];
    try {
      tags = JSON.parse(tagsRaw);
    } catch {
      tags = [];
    }
    return {
      id: r.id as string,
      url: r.url as string,
      source: r.source as string,
      published_at: Number(r.published_at),
      headline_id: r.headline_id as string,
      headline_en: r.headline_en as string,
      summary_id: r.summary_id as string,
      summary_en: r.summary_en as string,
      why_matters_id: (r.why_matters_id as string | null) ?? null,
      why_matters_en: (r.why_matters_en as string | null) ?? null,
      sentiment: r.sentiment as Article["sentiment"],
      impact: Number(r.impact),
      category: r.category as string,
      is_editor_pick: Number(r.is_editor_pick),
      tags,
    };
  });
}

export async function getStats() {
  const db = await getDb();
  const totalRes = await db.execute(
    "SELECT COUNT(*) as c FROM articles WHERE status = 'summarized'",
  );
  const total = Number(totalRes.rows[0]?.c ?? 0);

  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const last24Res = await db.execute({
    sql: `SELECT COUNT(*) as c FROM articles
          WHERE status = 'summarized' AND published_at >= ?`,
    args: [cutoff],
  });
  const last24h = Number(last24Res.rows[0]?.c ?? 0);

  return { total, last24h };
}
