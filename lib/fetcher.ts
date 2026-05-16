import Parser from "rss-parser";
import crypto from "crypto";
import { getDb } from "./db";
import { RSS_SOURCES } from "./sources";

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "HerzzCryptolens/1.0 (+rss-aggregator)" },
});

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchAllSources() {
  const db = await getDb();

  let inserted = 0;
  let scanned = 0;
  const now = Date.now();
  const errors: string[] = [];

  for (const src of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(src.url);
      for (const item of feed.items.slice(0, 15)) {
        if (!item.link || !item.title) continue;
        scanned++;
        const id = crypto.createHash("sha1").update(item.link).digest("hex");
        const pubMs = item.pubDate ? new Date(item.pubDate).getTime() : now;
        const snippet = stripHtml(
          item.contentSnippet || item.content || item.summary || "",
        ).slice(0, 1500);

        const result = await db.execute({
          sql: `INSERT OR IGNORE INTO articles
                (id, url, title, source, source_url, raw_content, published_at, fetched_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [id, item.link, item.title.trim(), src.name, src.url, snippet, pubMs, now],
        });
        if (result.rowsAffected > 0) inserted++;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${src.name}: ${msg}`);
      console.error(`[fetcher] ${src.name} failed:`, msg);
    }
  }
  return { inserted, scanned, errors };
}
