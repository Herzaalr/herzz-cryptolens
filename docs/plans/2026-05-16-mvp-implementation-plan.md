# Crypto News AI — Implementation Plan

> **Untuk Hermes:** Plan ini dieksekusi pakai `subagent-driven-development` skill, task-by-task dengan TDD + frequent commits. Review tiap task sebelum lanjut ke berikutnya.

**Goal:** Build aggregator crypto news minimalis dengan AI summary (Bahasa Indonesia + English), dark/light mode, deploy ke Vercel, siap submit ke Xiaomi MiMo 100T Token Program sebelum 28 Mei 2026.

**Architecture:** Next.js 16 App Router + Tailwind v4 + shadcn/ui. Cron job fetch RSS tiap 15 menit → AI summarizer (OpenAI-compatible client, env-swappable ke MiMo) → SQLite cache → static-ish feed page dengan ISR. Deploy Vercel free tier. Database SQLite buat MVP, migrate ke Postgres/Turso kalau udah scale.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui, Lucide icons, rss-parser, OpenAI SDK (compatible client), better-sqlite3 (atau libsql/turso buat Vercel-friendly), node-cron / Vercel Cron.

**Target Deadline:** 25 Mei 2026 (3 hari buffer sebelum MiMo deadline 28 Mei).

---

## Decisions Pending (HARUS DIPUTUSIN DULU SEBELUM MULAI)

### 1. Brand Name (pilih satu atau usulin)
- **Cryptolens** — "lens" buat liat crypto news lebih jelas
- **Brief** — singkat padat jelas, simple
- **Stacks** — kayak Hacker News tapi crypto
- **Sumir** — Indonesian, artinya "ringkas/singkat"
- **Alpha Brief** — degen-friendly
- **Cryptonews_** (underscore biar techy) — placeholder yang dipake di mockup

### 2. Bahasa Default
- **A.** English-first, Indonesian sebagai toggle
- **B.** Indonesian-first, English toggle
- **C.** Dual display (kedua bahasa di card yang sama)
- **Recommended: B** — differentiator paling kuat, kompetitor Indonesia masih jarang

### 3. News Categories
- All / DeFi / Regulation / Macro / NFT / Memes / Airdrops
- Atau lebih sederhana: All / Trending / Editor's Pick

### 4. Domain
- Mulai dengan `vercel.app` subdomain (gratis) atau langsung beli `.com` / `.xyz` (sekitar Rp 150k/tahun)?

---

## Phase 1: MVP (Target: 5 hari)

### Task 1: Setup project struktur + dependencies

**Objective:** Project Next.js udah ada, tinggal pasang library yang dibutuhin.

**Files:**
- Sudah ada: `package.json`, `app/`, `tsconfig.json`
- Modify: `package.json` (tambah deps)
- Create: `.env.local.example`
- Create: `.gitignore` entries

**Step 1: Install runtime deps**
```bash
cd /root/cryptonews-ai
npm install rss-parser openai better-sqlite3 date-fns clsx tailwind-merge class-variance-authority lucide-react next-themes
npm install -D @types/better-sqlite3
```

**Step 2: Install shadcn/ui**
```bash
npx shadcn@latest init -d
npx shadcn@latest add button card badge skeleton scroll-area separator dropdown-menu
```

**Step 3: Buat `.env.local.example`**
```
# AI Provider (swap base_url ke MiMo nanti)
AI_API_KEY=
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini

# Cron secret (untuk Vercel Cron auth)
CRON_SECRET=

# Database
DATABASE_PATH=./data/news.db
```

**Step 4: Update .gitignore**
```
.env.local
data/*.db
data/*.db-journal
```

**Step 5: Commit**
```bash
git add -A
git commit -m "chore: setup deps and project structure"
```

---

### Task 2: Database schema + migration

**Objective:** SQLite schema buat news items, sources, dan summaries.

**Files:**
- Create: `lib/db.ts`
- Create: `lib/schema.sql`
- Create: `data/.gitkeep`

**Step 1: Buat schema**

`lib/schema.sql`:
```sql
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,           -- hash of url
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  raw_content TEXT,
  published_at INTEGER NOT NULL, -- unix ms
  fetched_at INTEGER NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'pending'  -- pending|summarized|failed
);

CREATE TABLE IF NOT EXISTS summaries (
  article_id TEXT PRIMARY KEY,
  headline_id TEXT NOT NULL,        -- punchy AI headline (Indonesian)
  headline_en TEXT NOT NULL,
  summary_id TEXT NOT NULL,         -- 2-3 sentence summary (Indonesian)
  summary_en TEXT NOT NULL,
  why_matters_id TEXT,
  why_matters_en TEXT,
  sentiment TEXT,                   -- bullish|bearish|neutral
  impact INTEGER,                   -- 1-5
  category TEXT,                    -- defi|regulation|macro|nft|memes|airdrop|other
  tags TEXT,                        -- JSON array
  created_at INTEGER NOT NULL,
  FOREIGN KEY (article_id) REFERENCES articles(id)
);

CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_summaries_created ON summaries(created_at DESC);
```

**Step 2: Buat db helper**

`lib/db.ts`:
```typescript
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = process.env.DATABASE_PATH || "./data/news.db";

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    const schema = fs.readFileSync(
      path.join(process.cwd(), "lib/schema.sql"),
      "utf-8"
    );
    db.exec(schema);
  }
  return db;
}
```

**Step 3: Commit**
```bash
git add -A
git commit -m "feat: add sqlite schema and db helper"
```

---

### Task 3: RSS source fetcher

**Objective:** Fetch RSS dari 6 sumber utama, simpan ke `articles` table.

**Files:**
- Create: `lib/sources.ts`
- Create: `lib/fetcher.ts`
- Create: `app/api/cron/fetch/route.ts`

**Step 1: Define sources**

`lib/sources.ts`:
```typescript
export const RSS_SOURCES = [
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
  { name: "Cointelegraph", url: "https://cointelegraph.com/rss" },
  { name: "Decrypt", url: "https://decrypt.co/feed" },
  { name: "The Block", url: "https://www.theblock.co/rss.xml" },
  { name: "Bankless", url: "https://newsletter.banklesshq.com/feed" },
  { name: "BeInCrypto", url: "https://beincrypto.com/feed/" },
];
```

**Step 2: Buat fetcher**

`lib/fetcher.ts`:
```typescript
import Parser from "rss-parser";
import crypto from "crypto";
import { getDb } from "./db";
import { RSS_SOURCES } from "./sources";

const parser = new Parser({ timeout: 15000 });

export async function fetchAllSources() {
  const db = getDb();
  const insert = db.prepare(`
    INSERT OR IGNORE INTO articles
    (id, url, title, source, source_url, raw_content, published_at, fetched_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let inserted = 0;
  const now = Date.now();

  for (const src of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(src.url);
      for (const item of feed.items.slice(0, 20)) {
        if (!item.link || !item.title) continue;
        const id = crypto.createHash("sha1").update(item.link).digest("hex");
        const pubMs = item.pubDate
          ? new Date(item.pubDate).getTime()
          : now;
        const result = insert.run(
          id,
          item.link,
          item.title,
          src.name,
          src.url,
          item.contentSnippet?.slice(0, 2000) || "",
          pubMs,
          now
        );
        if (result.changes > 0) inserted++;
      }
    } catch (e) {
      console.error(`fetch ${src.name} failed:`, e);
    }
  }
  return { inserted };
}
```

**Step 3: API route untuk cron**

`app/api/cron/fetch/route.ts`:
```typescript
import { fetchAllSources } from "@/lib/fetcher";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    auth !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await fetchAllSources();
  return NextResponse.json(result);
}
```

**Step 4: Test manual**
```bash
npm run dev &
sleep 5
curl http://localhost:3000/api/cron/fetch
# Expected: {"inserted": <number>}
```

**Step 5: Commit**
```bash
git add -A
git commit -m "feat: rss fetcher with cron route"
```

---

### Task 4: AI summarizer

**Objective:** Process pending articles, panggil AI buat generate headline + summary + sentiment dual-language.

**Files:**
- Create: `lib/ai.ts`
- Create: `lib/summarizer.ts`
- Create: `app/api/cron/summarize/route.ts`

**Step 1: AI client**

`lib/ai.ts`:
```typescript
import OpenAI from "openai";

export const ai = new OpenAI({
  apiKey: process.env.AI_API_KEY!,
  baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1",
});

export const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";
```

**Step 2: Summarizer dengan strict JSON schema**

`lib/summarizer.ts`:
```typescript
import { ai, AI_MODEL } from "./ai";
import { getDb } from "./db";

const SYSTEM_PROMPT = `You are a crypto news editor. Given a raw article title + snippet, produce a concise dual-language summary in JSON format. Be punchy but accurate. Indonesian style: casual but informative (avoid formal news-anchor tone). Never hallucinate facts not in source.

Output ONLY valid JSON matching this schema:
{
  "headline_id": "string (max 80 chars, casual Indonesian)",
  "headline_en": "string (max 80 chars, punchy English)",
  "summary_id": "string (2-3 sentences Indonesian)",
  "summary_en": "string (2-3 sentences English)",
  "why_matters_id": "string (1 sentence: why this matters to crypto users)",
  "why_matters_en": "string (1 sentence)",
  "sentiment": "bullish | bearish | neutral",
  "impact": 1 | 2 | 3 | 4 | 5,
  "category": "defi | regulation | macro | nft | memes | airdrop | other",
  "tags": ["string", ...max 4]
}`;

export async function summarizePending(limit = 10) {
  const db = getDb();
  const pending = db
    .prepare(
      `SELECT id, title, raw_content, source FROM articles
       WHERE status = 'pending' ORDER BY published_at DESC LIMIT ?`
    )
    .all(limit) as Array<{ id: string; title: string; raw_content: string; source: string }>;

  const insert = db.prepare(`
    INSERT OR REPLACE INTO summaries
    (article_id, headline_id, headline_en, summary_id, summary_en,
     why_matters_id, why_matters_en, sentiment, impact, category, tags, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateStatus = db.prepare(
    `UPDATE articles SET status = ? WHERE id = ?`
  );

  let ok = 0;
  let failed = 0;

  for (const a of pending) {
    try {
      const completion = await ai.chat.completions.create({
        model: AI_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.6,
        max_tokens: 600,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `SOURCE: ${a.source}\nTITLE: ${a.title}\n\nSNIPPET:\n${a.raw_content || "(no snippet)"}`,
          },
        ],
      });

      const data = JSON.parse(completion.choices[0].message.content || "{}");
      insert.run(
        a.id,
        data.headline_id,
        data.headline_en,
        data.summary_id,
        data.summary_en,
        data.why_matters_id,
        data.why_matters_en,
        data.sentiment,
        data.impact,
        data.category,
        JSON.stringify(data.tags || []),
        Date.now()
      );
      updateStatus.run("summarized", a.id);
      ok++;
    } catch (e) {
      console.error(`summarize ${a.id} failed:`, e);
      updateStatus.run("failed", a.id);
      failed++;
    }
  }
  return { ok, failed };
}
```

**Step 3: Cron route**

`app/api/cron/summarize/route.ts`:
```typescript
import { summarizePending } from "@/lib/summarizer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    auth !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await summarizePending(15);
  return NextResponse.json(result);
}
```

**Step 4: Test**
```bash
curl http://localhost:3000/api/cron/summarize
# Expected: {"ok": N, "failed": M}
```

**Step 5: Commit**
```bash
git add -A
git commit -m "feat: ai summarizer with dual-language json output"
```

---

### Task 5: UI — Layout + Theme Toggle

**Objective:** Layout root + dark/light theme switcher pakai `next-themes`.

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/theme-provider.tsx`
- Create: `components/theme-toggle.tsx`
- Create: `components/site-header.tsx`
- Modify: `app/globals.css` (theme tokens)

**Step 1: Theme provider**

`components/theme-provider.tsx`:
```tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

**Step 2: Theme toggle**

`components/theme-toggle.tsx`:
```tsx
"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

**Step 3: Site header**

`components/site-header.tsx`:
```tsx
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="font-mono text-base font-semibold tracking-tight">
          {process.env.NEXT_PUBLIC_BRAND || "Brief_"}
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

**Step 4: Update root layout**

`app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Brief — Crypto news, AI ringkas",
  description: "Crypto news yang singkat, padat, jelas. Powered by AI.",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SiteHeader />
          <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 5: Commit**
```bash
git add -A
git commit -m "feat: layout, theme provider, dark/light toggle"
```

---

### Task 6: Feed page — News cards

**Objective:** Halaman utama nge-render news card dari `summaries` table, urut dari terbaru.

**Files:**
- Modify: `app/page.tsx`
- Create: `components/news-card.tsx`
- Create: `components/sentiment-dot.tsx`
- Create: `lib/queries.ts`

**Step 1: Query helper**

`lib/queries.ts`:
```typescript
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
  tags: string[];
};

export function getLatestArticles(limit = 30, category?: string): Article[] {
  const db = getDb();
  const where = category && category !== "all" ? "AND s.category = ?" : "";
  const params = category && category !== "all" ? [limit, category] : [limit];
  const rows = db
    .prepare(
      `SELECT a.id, a.url, a.source, a.published_at,
              s.headline_id, s.headline_en, s.summary_id, s.summary_en,
              s.why_matters_id, s.why_matters_en,
              s.sentiment, s.impact, s.category, s.tags
       FROM summaries s
       JOIN articles a ON a.id = s.article_id
       WHERE a.status = 'summarized' ${where}
       ORDER BY a.published_at DESC
       LIMIT ?`
    )
    .all(...params.reverse()) as any[];

  return rows.map((r) => ({ ...r, tags: JSON.parse(r.tags || "[]") }));
}
```

**Step 2: Sentiment dot**

`components/sentiment-dot.tsx`:
```tsx
export function SentimentDot({ s }: { s: "bullish" | "bearish" | "neutral" }) {
  const color =
    s === "bullish"
      ? "bg-emerald-500"
      : s === "bearish"
        ? "bg-rose-500"
        : "bg-zinc-400";
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${color}`}
      aria-label={s}
    />
  );
}
```

**Step 3: News card**

`components/news-card.tsx`:
```tsx
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ExternalLink } from "lucide-react";
import { SentimentDot } from "./sentiment-dot";
import type { Article } from "@/lib/queries";

export function NewsCard({ article: a }: { article: Article }) {
  return (
    <article className="group border-b border-border py-5 last:border-b-0">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <SentimentDot s={a.sentiment} />
        <span className="font-mono uppercase tracking-wide">{a.category}</span>
        <span>·</span>
        <span>{a.source}</span>
        <span>·</span>
        <time>
          {formatDistanceToNow(a.published_at, { addSuffix: true, locale: idLocale })}
        </time>
      </div>
      <h2 className="text-lg font-semibold leading-snug tracking-tight">
        {a.headline_id}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {a.summary_id}
      </p>
      {a.why_matters_id && (
        <p className="mt-3 text-xs text-foreground/80 italic">
          → {a.why_matters_id}
        </p>
      )}
      <div className="mt-3 flex items-center gap-3 text-xs">
        <Link
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          Read source <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}
```

**Step 4: Feed page**

`app/page.tsx`:
```tsx
import { getLatestArticles } from "@/lib/queries";
import { NewsCard } from "@/components/news-card";

export const revalidate = 300; // 5 menit ISR

export default function Home() {
  const articles = getLatestArticles(30);
  return (
    <div>
      {articles.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-20">
          Belum ada news. Tunggu cron job pertama jalan.
        </p>
      ) : (
        articles.map((a) => <NewsCard key={a.id} article={a} />)
      )}
    </div>
  );
}
```

**Step 5: Commit**
```bash
git add -A
git commit -m "feat: news feed page with cards"
```

---

### Task 7: Category filter

**Objective:** Filter chips di atas feed (All / DeFi / Regulation / Macro / NFT / Memes / Airdrop).

**Files:**
- Create: `components/category-filter.tsx`
- Modify: `app/page.tsx` (gunakan searchParams)

(Detail code di-fill saat eksekusi.)

---

### Task 8: Polish UI — typography, spacing, micro-interactions

**Objective:** Bikin minimalis bener — kayak Linear / Vercel / Reflect aesthetic.

**Items:**
- Inter buat body, JetBrains Mono buat brand & metadata
- Border subtle, no shadows, generous spacing
- Transition smooth (theme switch, hover)
- Focus ring accessible
- Mobile: max-w-3xl, padding rapih
- Loading skeleton waktu fetch

---

### Task 9: SEO + meta + favicon

**Objective:** Open Graph image, sitemap, robots, favicon, manifest. Penting buat MiMo evaluator.

**Items:**
- `app/opengraph-image.tsx` (generate via Next ImageResponse)
- `app/sitemap.ts`
- `app/robots.ts`
- Favicon set (light/dark)

---

### Task 10: Vercel deploy + cron config

**Objective:** Deploy ke Vercel, setup Vercel Cron untuk fetch + summarize tiap 15 menit. Cuma Vercel Cron ga support SQLite write di serverless — perlu migrate ke **Turso (libsql)** atau **Vercel Postgres**.

**Decision Point Mid-Implementation:** SQLite vs Turso.
- **SQLite + VPS host (railway.app / fly.io):** simpler tapi perlu host
- **Turso (libsql, free tier):** edge-friendly, drop-in replacement
- **Recommended: Turso** — free tier 9GB, drop-in replacement, deploy clean ke Vercel

**Files (kalo Turso):**
- Modify: `lib/db.ts` → pakai `@libsql/client`
- Create: `vercel.json`

```json
{
  "crons": [
    { "path": "/api/cron/fetch", "schedule": "*/15 * * * *" },
    { "path": "/api/cron/summarize", "schedule": "*/15 * * * *" }
  ]
}
```

---

### Task 11: README + project documentation

**Objective:** README yang clean buat MiMo evaluator. Sertain:
- What it is, screenshot
- Tech stack
- Why MiMo (multi-language summarization, casual tone)
- Roadmap (Phase 2 = MiMo TTS audio version, Phase 3 = mobile PWA)
- License

---

### Task 12: Submit ke MiMo 100T

**Objective:** Isi form dengan project description detail, link demo, GitHub repo (boleh public), screenshots, technical merit.

**Bahan submit:**
- Demo URL: `https://[brand].vercel.app`
- GitHub URL: public repo
- Project description (detailed): 2-3 paragraf — apa yang dibangun, knapa pake MiMo (multi-language, edge inference, TTS roadmap)
- Email: cek dari `~/.agent/credentials/email.env`
- Phase 2 plan: integrate MiMo V2.5 (text), MiMo TTS (audio version), MiMo image (cover thumbnails)

---

## Phase 2: Post-MiMo Approval (after API key arrives)

- Swap base_url ke `https://api.xiaomimimo.com/v1`, model ke `mimo-v2.5-pro`
- Audio version: tiap article punya tombol "Dengerin" → MiMo TTS streaming
- AI cover thumbnails per article (DALL-E or MiMo image)
- "Trending narrative" tracker — clustering similar topics 24-jam window
- Multi-page: `/article/[id]` halaman detail dengan full analysis

## Phase 3: Long-term

- User account + bookmark
- Push notification high-impact news
- PWA mobile-first
- Feed personalization
- "Alpha digest" daily email
- Affiliate (exchange referral)

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| RSS sources rate-limit | Stagger fetch, cache aggressively |
| AI cost ngebludak before MiMo approve | Pakai gpt-4o-mini ($0.15/1M input), batas 15 article per cron run |
| SQLite ga jalan di Vercel | Migrate ke Turso early (Task 10) |
| MiMo evaluator ga kasih approve | Web tetep usable sebagai project portofolio |
| Datacenter IP keblokir RSS | RSS biasanya open, tapi backup pake aggregator API (CryptoPanic) |

---

## Definition of Done (MVP)

- [ ] Web deployed live di Vercel
- [ ] Min 30 articles muncul, semua udah ke-summarize AI
- [ ] Dark/light mode work
- [ ] Mobile responsive
- [ ] Lighthouse score > 90
- [ ] Cron jalan otomatis tiap 15 menit
- [ ] GitHub repo public, README rapih
- [ ] Submitted ke MiMo 100T
