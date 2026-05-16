// Seed dummy data biar UI bisa dipreview tanpa AI key
import { getDb } from "../lib/db";
import crypto from "crypto";

const SEED = [
  {
    title: "Bitcoin tembus $120K, MicroStrategy borong lagi 5,000 BTC",
    source: "CoinDesk",
    url: "https://example.com/btc-120k",
    headline_id: "BTC tembus $120K, MicroStrategy nimbun lagi 5,000 koin",
    headline_en: "BTC breaks $120K as MicroStrategy adds 5,000 more",
    summary_id: "Bitcoin nyentuh ATH baru di $120,400 setelah MicroStrategy umumin pembelian 5,000 BTC senilai $600 juta. Volume trading naik 35% dibanding minggu lalu. Analis nyebut momentum institusional masih panjang.",
    summary_en: "Bitcoin hit a fresh ATH of $120,400 after MicroStrategy announced a 5,000 BTC buy worth $600M. Trading volume jumped 35% week-over-week. Analysts say institutional momentum still has legs.",
    why_matters_id: "Konfirmasi tren institusional makin kuat — sinyal bullish menengah-panjang.",
    why_matters_en: "Confirms accelerating institutional trend — bullish mid-to-long term signal.",
    sentiment: "bullish",
    impact: 5,
    category: "macro",
    tags: ["btc", "microstrategy", "ath", "institutional"],
    minutesAgo: 12,
  },
  {
    title: "SEC settles Coinbase staking case, hands clearer rules to industry",
    source: "The Block",
    url: "https://example.com/sec-coinbase",
    headline_id: "SEC settle kasus staking Coinbase, aturan crypto makin jelas",
    headline_en: "SEC settles Coinbase staking suit, gives industry clearer rules",
    summary_id: "SEC dan Coinbase resmi settle kasus staking-as-a-service. Hasilnya: staking ritel ga lagi otomatis dianggap sekuritas, asal exchange disclose risk. Praktis jadi blueprint regulasi staking AS.",
    summary_en: "SEC and Coinbase reached a settlement on staking-as-a-service. Result: retail staking is no longer automatically classified as a security, provided exchanges disclose risks. Effectively a blueprint for US staking regulation.",
    why_matters_id: "Bisa unlock product staking di banyak exchange AS yang dulu takut SEC.",
    why_matters_en: "Could unlock staking products at many US exchanges previously wary of the SEC.",
    sentiment: "bullish",
    impact: 5,
    category: "regulation",
    tags: ["sec", "coinbase", "staking"],
    minutesAgo: 47,
  },
  {
    title: "Solana DEX volume hits record $4.2B, surpasses Ethereum for 3rd day",
    source: "Decrypt",
    url: "https://example.com/sol-dex",
    headline_id: "DEX Solana cetak rekor $4.2B, libas Ethereum 3 hari berturut",
    headline_en: "Solana DEX volume hits $4.2B record, beats ETH 3 days running",
    summary_id: "Volume DEX Solana harian nembus $4.2 miliar, didorong meme coin trading dan Jupiter aggregator. Ethereum DEX tertinggal di $3.8B. Trend ini sinyal kalo retail liquidity makin geser ke ekosistem yang lebih cepet dan murah.",
    summary_en: "Solana DEX daily volume cracked $4.2B, driven by meme coin trading and Jupiter aggregator. Ethereum DEX trailed at $3.8B. The trend signals retail liquidity migrating to faster, cheaper chains.",
    why_matters_id: "SOL ekosistem makin matang — bagus buat hold SOL & token DeFi-nya.",
    why_matters_en: "Solana ecosystem maturing fast — bullish for SOL and its DeFi tokens.",
    sentiment: "bullish",
    impact: 4,
    category: "defi",
    tags: ["solana", "dex", "jupiter", "volume"],
    minutesAgo: 95,
  },
  {
    title: "Hyperliquid airdrop snapshot leaked, points doubled for OG users",
    source: "Cointelegraph",
    url: "https://example.com/hyperliquid",
    headline_id: "Snapshot airdrop Hyperliquid bocor, point OG digandain",
    headline_en: "Hyperliquid airdrop snapshot leaked, OG points doubled",
    summary_id: "Detail snapshot airdrop Hyperliquid season 2 keluar duluan: user yang trade sebelum Q2 2025 dapet 2x point. Estimasi alokasi $2.8 miliar, distribusi 25 Mei. Wallet eligible bisa cek di portal resmi.",
    summary_en: "Hyperliquid season 2 airdrop snapshot details leaked early: users who traded before Q2 2025 get 2x points. Estimated allocation $2.8B, distribution May 25. Eligible wallets can check the official portal.",
    why_matters_id: "Cek wallet lu sekarang — kalo OG bisa dapet alokasi gede.",
    why_matters_en: "Check your wallet now — OG users could land sizeable allocations.",
    sentiment: "bullish",
    impact: 4,
    category: "airdrop",
    tags: ["hyperliquid", "airdrop", "snapshot"],
    minutesAgo: 145,
  },
  {
    title: "Ethereum gas fees spike 400% as new memecoin launches clog network",
    source: "Bankless",
    url: "https://example.com/eth-gas",
    headline_id: "Gas fee Ethereum naik 400% gara-gara memecoin baru rame banget",
    headline_en: "ETH gas fees spike 400% as memecoin launches clog network",
    summary_id: "Gas fee Ethereum tembus rata-rata 280 gwei, naik 400% dari minggu lalu. Penyebab: 3 launch memecoin viral di Uniswap. User retail komplain swap kecil bisa kena fee $40+. L2 traffic juga naik 60% sebagai escape valve.",
    summary_en: "Ethereum gas hit an average 280 gwei, up 400% from last week. The cause: three viral memecoin launches on Uniswap. Retail users complained small swaps now cost $40+. L2 traffic also jumped 60% as an escape valve.",
    why_matters_id: "Bukti L2 makin perlu — hold ARB / OP / BASE narasi nguat.",
    why_matters_en: "Proof L2s are increasingly necessary — bullish narrative for ARB / OP / BASE.",
    sentiment: "neutral",
    impact: 3,
    category: "memes",
    tags: ["eth", "gas", "memecoin", "l2"],
    minutesAgo: 210,
  },
  {
    title: "BlackRock files for spot SOL ETF, joins Fidelity in race",
    source: "BeInCrypto",
    url: "https://example.com/blackrock-sol",
    headline_id: "BlackRock submit spot SOL ETF, gabung balapan sama Fidelity",
    headline_en: "BlackRock files spot SOL ETF, joins Fidelity in the race",
    summary_id: "BlackRock resmi submit S-1 spot Solana ETF ke SEC. Fidelity udah submit minggu lalu, plus VanEck. SEC ada window 240 hari buat approve atau reject. Solana spot ETF approval bisa unlock institutional flow gede.",
    summary_en: "BlackRock officially filed an S-1 for a spot Solana ETF with the SEC. Fidelity filed last week, plus VanEck. The SEC has a 240-day window to approve or reject. A Solana spot ETF approval could unlock major institutional flows.",
    why_matters_id: "SOL bakal liquid kayak BTC/ETH ETF — institutional pump incoming.",
    why_matters_en: "SOL gets BTC/ETH-tier liquidity — institutional pump incoming.",
    sentiment: "bullish",
    impact: 5,
    category: "regulation",
    tags: ["sol", "etf", "blackrock", "sec"],
    minutesAgo: 320,
  },
  {
    title: "Pudgy Penguins NFT floor hits 28 ETH amid IP licensing deals",
    source: "Decrypt",
    url: "https://example.com/pudgy",
    headline_id: "Floor Pudgy Penguins tembus 28 ETH gara-gara deal lisensi IP",
    headline_en: "Pudgy Penguins floor hits 28 ETH amid IP licensing deals",
    summary_id: "Pudgy Penguins kontrak deal sama Walmart buat plushie eksklusif, naikin floor dari 18 ke 28 ETH dalam 5 hari. Volume mingguan tembus 4,200 ETH. NFT comeback narrative mulai keliatan setelah dingin 18 bulan.",
    summary_en: "Pudgy Penguins inked a Walmart deal for exclusive plushies, pushing the floor from 18 to 28 ETH in 5 days. Weekly volume cracked 4,200 ETH. The NFT comeback narrative is taking shape after 18 months in the cold.",
    why_matters_id: "NFT belum mati. Blue-chip dengan IP nyata mulai relevan lagi.",
    why_matters_en: "NFTs aren't dead. Blue-chips with real IP are relevant again.",
    sentiment: "bullish",
    impact: 3,
    category: "nft",
    tags: ["nft", "pudgy", "walmart", "ip"],
    minutesAgo: 480,
  },
  {
    title: "Aave V4 launches with cross-chain liquidity layer, $200M deposit cap",
    source: "The Block",
    url: "https://example.com/aave-v4",
    headline_id: "Aave V4 rilis dengan cross-chain liquidity, cap deposit $200 juta",
    headline_en: "Aave V4 ships cross-chain liquidity layer, $200M deposit cap",
    summary_id: "Aave V4 udah live di mainnet. Fitur baru: unified cross-chain liquidity layer yang ngehubungin lending market di 8 chain. Cap deposit $200 juta minggu pertama buat safety. APY USDC mulai di 8.4%.",
    summary_en: "Aave V4 went live on mainnet. New feature: a unified cross-chain liquidity layer bridging lending markets across 8 chains. Initial $200M deposit cap for safety. USDC APY starts at 8.4%.",
    why_matters_id: "Lending DeFi jadi makin efisien — TVL Aave bisa tembus rekor lama.",
    why_matters_en: "DeFi lending gets more efficient — Aave TVL could break old records.",
    sentiment: "bullish",
    impact: 4,
    category: "defi",
    tags: ["aave", "defi", "lending", "cross-chain"],
    minutesAgo: 720,
  },
];

function main() {
  const db = getDb();
  const insertArticle = db.prepare(`
    INSERT OR REPLACE INTO articles
    (id, url, title, source, source_url, raw_content, published_at, fetched_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'summarized')
  `);
  const insertSummary = db.prepare(`
    INSERT OR REPLACE INTO summaries
    (article_id, headline_id, headline_en, summary_id, summary_en,
     why_matters_id, why_matters_en, sentiment, impact, category,
     is_editor_pick, tags, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();
  let count = 0;

  for (const s of SEED) {
    const id = crypto.createHash("sha1").update(s.url).digest("hex");
    const pub = now - s.minutesAgo * 60 * 1000;
    insertArticle.run(
      id,
      s.url,
      s.title,
      s.source,
      `https://${s.source.toLowerCase().replace(/ /g, "")}.com/rss`,
      s.title,
      pub,
      now,
    );
    insertSummary.run(
      id,
      s.headline_id,
      s.headline_en,
      s.summary_id,
      s.summary_en,
      s.why_matters_id,
      s.why_matters_en,
      s.sentiment,
      s.impact,
      s.category,
      s.impact >= 4 ? 1 : 0,
      JSON.stringify(s.tags),
      now,
    );
    count++;
  }

  console.log(`Seeded ${count} articles.`);
}

main();
