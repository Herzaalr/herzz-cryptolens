# Herzz Cryptolens — MiMo 100T Submission Draft

## Form Field Plan

### 01. Email
younglexbaliklagi1@gmail.com
(burner Gmail, GitHub-linked)

### 02. Agent Tool
**Hermes Agent** (autonomous AI development agent — yang gw pake buat build seluruh project ini)

### 03. Primary Model Series
**Claude** (Opus/Sonnet 4.7 dari Kiro provider; juga pake GPT-5.5 dari freemodel.dev relay)

### 04. Project Description (target 100-300 words, casual technical tone)

---

**Herzz Cryptolens** is a minimalist crypto news aggregator built for retail crypto users in Indonesia and Southeast Asia. The core problem: existing crypto news outlets (CoinDesk, Cointelegraph, Decrypt) are formal, English-only, and verbose — leaving non-native English speakers without a fast, casual way to keep up with the market.

**How it works:**
1. **RSS fetcher** pulls from 6 top crypto sources (CoinDesk, Cointelegraph, Decrypt, The Block, Bankless, BeInCrypto) every 15 minutes via cron
2. **AI summarizer pipeline** sends each article title + snippet to an LLM with a strict JSON schema, generating dual-language output: punchy Indonesian headline, English headline, 2-3 sentence summary in both languages, "why it matters" reasoning, sentiment classification (bullish/bearish/neutral), impact rating (1-5), and category tags
3. **SQLite cache** stores results, served via Next.js ISR (5-min revalidation)
4. **Per-card language toggle** — users flip between ID/EN inline without page reload

**Differentiator:** Casual Indonesian tone ("BTC jebol $78K", "Strategy mau buyback notes") that crypto Twitter natives actually use, not formal news-anchor translation. Plus impact rating + sentiment dot for instant scanning.

**Built with:** Next.js 16, React 19, Tailwind v4, shadcn/ui, better-sqlite3, OpenAI-compatible AI client (env-pluggable), rss-parser, Vercel Cron.

**Why MiMo (Phase 2 plan):**
- MiMo V2.5 multilingual native support → upgrade summary quality for ID + EN
- **MiMo TTS Series** integration → "Dengerin" (listen) button per article streaming AI voice version of every summary
- **MiMo image gen** → AI cover thumbnails per article matching minimal aesthetic
- The pipeline is intentionally provider-agnostic — swapping `AI_BASE_URL` env var to MiMo endpoint is the only change required.

**Current status:** MVP live on local dev, GitHub public, 23 real articles indexed and AI-summarized, 0 failure rate across 15 production summarizations. Ready for Vercel deploy + MiMo integration upon Token Plan approval.

### 05. Proof of Usage (upload files)

Files to attach:
1. `9router-token-usage.png` — 1,189 lifetime requests, 30M+ tokens, $115 cost across Claude / GPT-5.5
2. `cryptolens-feed-screenshot.png` — live feed showing real AI-summarized news in Bahasa Indonesia
3. `github-repo-screenshot.png` — public GitHub showing project structure + commit history

**GitHub link field:**
https://github.com/Herzaalr/herzz-cryptolens

**Live demo (after Vercel deploy):**
https://herzz-cryptolens.vercel.app
