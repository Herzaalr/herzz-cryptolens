import { getLatestArticles, getStats } from "@/lib/queries";
import { NewsCard } from "@/components/news-card";
import { ViewFilter } from "@/components/view-filter";
import { Suspense } from "react";

export const revalidate = 300; // ISR 5 min

type ViewMode = "all" | "trending" | "picks";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view = (
    ["all", "trending", "picks"].includes(params.view || "")
      ? params.view
      : "all"
  ) as ViewMode;

  let articles: Awaited<ReturnType<typeof getLatestArticles>> = [];
  let stats = { total: 0, last24h: 0 };

  try {
    articles = await getLatestArticles(40, view);
    stats = await getStats();
  } catch (e) {
    // db not initialized yet (build time without data)
    console.error("query error:", e);
  }

  return (
    <div>
      {/* Hero */}
      <section className="mb-8 border-b border-border/60 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Crypto news, <span className="text-muted-foreground">ringkas.</span>
        </h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Singkat, padat, jelas. Dual-language Indonesia & English, di-summary
          AI tiap 15 menit dari 6 sumber crypto teratas.
        </p>
        <div className="mt-3 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
          <span>·</span>
          <span>{stats.total} articles indexed</span>
          <span>·</span>
          <span>{stats.last24h} in last 24h</span>
        </div>
      </section>

      <Suspense fallback={null}>
        <ViewFilter />
      </Suspense>

      <section>
        {articles.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Belum ada news. Cron pertama jalan dalam beberapa menit.
            </p>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              <code>GET /api/cron/fetch</code> →{" "}
              <code>GET /api/cron/summarize</code>
            </p>
          </div>
        ) : (
          articles.map((a) => <NewsCard key={a.id} article={a} />)
        )}
      </section>
    </div>
  );
}
