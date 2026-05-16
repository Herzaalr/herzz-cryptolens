import { ai, AI_MODEL } from "./ai";
import { getDb } from "./db";

const SYSTEM_PROMPT = `You are a crypto news editor for Herzz Cryptolens. Given an article title + snippet, produce a dual-language summary (Indonesian + English) in JSON format.

STYLE:
- Indonesian: casual, punchy, ringan tapi informatif. Bahasa kayak ngobrol sama temen yang ngerti crypto. Bukan formal news-anchor.
- English: tight, factual, no fluff.
- Never hallucinate facts not in source. If snippet vague, keep summary general — don't invent numbers/quotes.

Output ONLY valid JSON matching this exact schema:
{
  "headline_id": "string max 90 chars, casual Indonesian",
  "headline_en": "string max 90 chars, punchy English",
  "summary_id": "string 2-3 sentences Indonesian",
  "summary_en": "string 2-3 sentences English",
  "why_matters_id": "string 1 sentence: kenapa news ini penting buat user crypto",
  "why_matters_en": "string 1 sentence",
  "sentiment": "bullish | bearish | neutral",
  "impact": 1-5 integer,
  "category": "defi | regulation | macro | nft | memes | airdrop | other",
  "tags": ["max 4 strings, lowercase keywords"]
}`;

type SummaryJson = {
  headline_id: string;
  headline_en: string;
  summary_id: string;
  summary_en: string;
  why_matters_id?: string;
  why_matters_en?: string;
  sentiment: "bullish" | "bearish" | "neutral";
  impact: number;
  category: string;
  tags?: string[];
};

export async function summarizePending(limit = 10) {
  const db = getDb();
  const pending = db
    .prepare(
      `SELECT id, title, raw_content, source FROM articles
       WHERE status = 'pending' ORDER BY published_at DESC LIMIT ?`,
    )
    .all(limit) as Array<{
    id: string;
    title: string;
    raw_content: string | null;
    source: string;
  }>;

  const insert = db.prepare(`
    INSERT OR REPLACE INTO summaries
    (article_id, headline_id, headline_en, summary_id, summary_en,
     why_matters_id, why_matters_en, sentiment, impact, category,
     is_editor_pick, tags, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateStatus = db.prepare(
    `UPDATE articles SET status = ? WHERE id = ?`,
  );

  let ok = 0;
  let failed = 0;

  for (const a of pending) {
    try {
      const completion = await ai.chat.completions.create({
        model: AI_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.6,
        max_tokens: 700,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `SOURCE: ${a.source}\nTITLE: ${a.title}\n\nSNIPPET:\n${a.raw_content || "(no snippet available — base on title only)"}`,
          },
        ],
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      const data = JSON.parse(raw) as SummaryJson;

      // basic validation
      if (!data.headline_id || !data.summary_id) {
        throw new Error("missing required fields");
      }

      const editorPick = (data.impact || 0) >= 4 ? 1 : 0;

      insert.run(
        a.id,
        data.headline_id,
        data.headline_en || data.headline_id,
        data.summary_id,
        data.summary_en || data.summary_id,
        data.why_matters_id || null,
        data.why_matters_en || null,
        data.sentiment || "neutral",
        Number(data.impact) || 3,
        data.category || "other",
        editorPick,
        JSON.stringify(data.tags || []),
        Date.now(),
      );
      updateStatus.run("summarized", a.id);
      ok++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[summarizer] ${a.id} failed:`, msg);
      updateStatus.run("failed", a.id);
      failed++;
    }
  }
  return { ok, failed, processed: pending.length };
}
