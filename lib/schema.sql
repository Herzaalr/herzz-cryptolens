-- Herzz Cryptolens schema
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,           -- sha1(url)
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  raw_content TEXT,
  published_at INTEGER NOT NULL, -- unix ms
  fetched_at INTEGER NOT NULL,
  status TEXT DEFAULT 'pending'  -- pending|summarized|failed
);

CREATE TABLE IF NOT EXISTS summaries (
  article_id TEXT PRIMARY KEY,
  headline_id TEXT NOT NULL,
  headline_en TEXT NOT NULL,
  summary_id TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  why_matters_id TEXT,
  why_matters_en TEXT,
  sentiment TEXT,                -- bullish|bearish|neutral
  impact INTEGER,                -- 1-5
  category TEXT,                 -- defi|regulation|macro|nft|memes|airdrop|other
  is_editor_pick INTEGER DEFAULT 0,
  tags TEXT,                     -- JSON array
  created_at INTEGER NOT NULL,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_summaries_created ON summaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_summaries_pick ON summaries(is_editor_pick);
