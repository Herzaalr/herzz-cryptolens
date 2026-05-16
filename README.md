# Herzz Cryptolens

> Crypto news yang singkat, padat, jelas. Dual-language AI summary (Indonesia + English) dari 6 sumber crypto teratas, refresh tiap 15 menit.

**Live demo:** [herzz-cryptolens.vercel.app](https://herzz-cryptolens.vercel.app)

![og](./public/og-preview.png)

---

## What it is

Aggregator crypto news minimalis. Bukan portal informasi yang berlembar-lembar — tiap card cuma:
- **1 headline punchy** (AI-generated, casual Indonesian or English)
- **2-3 sentence summary** dual-language
- **"Why it matters"** — alasan kenapa news ini relevan ke user crypto
- **Sentiment** (bullish / bearish / neutral) + **impact rating** (1-5)

Filter cuma 3: **All** / **Trending** (24 jam, by impact) / **Editor's Pick** (impact ≥ 4).

## Why I built this

Crypto news yang ada sekarang panjang, formal, dan English-only. Buat user Indonesia yang baru masuk crypto — atau yang udah lama tapi cape baca essai panjang — nggak ada yang ngerangkum cepet pake bahasa nyantai.

Cryptolens nge-fix itu. Dual-language di card yang sama (toggle ID/EN per artikel), tone-nya casual tapi akurat, dan minimal banget biar fokus ke isi.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind v4** + shadcn/ui (Radix primitives)
- **better-sqlite3** local / **Turso (libsql)** untuk Vercel
- **OpenAI-compatible AI client** — pluggable, default DeepSeek V3 (`api.deepseek.com/v1`)
- **rss-parser** untuk fetch 6 source: CoinDesk, Cointelegraph, Decrypt, The Block, Bankless, BeInCrypto
- **next-themes** untuk dark/light mode (default dark)
- **Vercel Cron** untuk schedule fetch + summarize tiap 15 menit

## How it works

```
RSS feeds → /api/cron/fetch → SQLite (articles, status='pending')
SQLite → /api/cron/summarize → AI → SQLite (summaries, dual-language)
SQLite → app/page.tsx (ISR 5 min) → User
```

## Setup local

```bash
git clone https://github.com/Herzaalr/herzz-cryptolens
cd herzz-cryptolens
npm install
cp .env.local.example .env.local
# isi AI_API_KEY (DeepSeek atau OpenAI-compatible)
npm run dev
```

Untuk seed dummy data:
```bash
npx tsx scripts/seed.ts
```

Manual trigger fetch & summarize:
```bash
curl http://localhost:3000/api/cron/fetch
curl http://localhost:3000/api/cron/summarize
```

## Environment

```
NEXT_PUBLIC_BRAND="Herzz Cryptolens"
NEXT_PUBLIC_AI_LABEL="DeepSeek V3"

AI_API_KEY=                        # required
AI_BASE_URL=https://api.deepseek.com/v1
AI_MODEL=deepseek-chat

CRON_SECRET=                       # for Vercel Cron auth
DATABASE_PATH=./data/news.db
```

## Roadmap

### Phase 1 — MVP (current)
- [x] RSS fetcher (6 sources)
- [x] AI summarizer (dual-language JSON output)
- [x] Sentiment + impact rating
- [x] Editor's Pick auto-flag (impact ≥ 4)
- [x] Dark/light theme
- [x] Per-card language toggle
- [ ] Vercel deploy + Cron
- [ ] Migrate ke Turso (libsql)

### Phase 2 — MiMo Integration
- [ ] Swap AI provider ke Xiaomi MiMo V2.5
- [ ] **Audio version** per article — MiMo TTS streaming, "Dengerin" button
- [ ] AI cover thumbnails — MiMo image gen
- [ ] Multimodal: video summary scraping (YouTube crypto channels) → MiMo video understanding

### Phase 3 — Long-term
- [ ] Halaman detail artikel `/article/[id]` dengan full analysis
- [ ] Trending narrative tracker (clustering 24h window)
- [ ] User account + bookmark + push notification
- [ ] PWA mobile-first
- [ ] Daily "Alpha digest" email

## Why MiMo (Phase 2 plan)

Project ini built supaya mudah swap AI provider. Phase 2 plan-nya ke Xiaomi MiMo V2.5 karena:

1. **MiMo V2.5 support multilingual native** — perfect buat dual-language pipeline.
2. **MiMo TTS series** — bisa generate audio version setiap artikel langsung dari summary, no extra TTS provider needed.
3. **MiMo image** — AI cover thumbnails per article cocok banget buat aesthetic minimalis.
4. **Edge-friendly inference** — 15-minute refresh cycle butuh latensi rendah dan cost predictable.

Begitu Token Plan approved, swap-nya literally cuma 3 env var.

## License

MIT — by [Herzaalr](https://github.com/Herzaalr).
