"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, ChevronDown, Languages } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { SentimentDot } from "./sentiment-dot";
import { Badge } from "./ui/badge";
import type { Article } from "@/lib/queries";

const IMPACT_LABELS = ["", "Low", "Mild", "Med", "High", "Critical"];

export function NewsCard({ article: a }: { article: Article }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"id" | "en">("id");

  const headline = lang === "id" ? a.headline_id : a.headline_en;
  const summary = lang === "id" ? a.summary_id : a.summary_en;
  const why = lang === "id" ? a.why_matters_id : a.why_matters_en;
  const locale = lang === "id" ? idLocale : enUS;

  return (
    <article
      className="group relative border-b border-border/60 py-5 transition-colors first:pt-0 last:border-b-0"
    >
      {/* Meta row */}
      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
        <SentimentDot s={a.sentiment} />
        <span className="font-mono uppercase tracking-wider">{a.category}</span>
        <span className="text-border">·</span>
        <span className="font-medium">{a.source}</span>
        <span className="text-border">·</span>
        <time>
          {formatDistanceToNow(a.published_at, {
            addSuffix: true,
            locale,
          })}
        </time>
        {a.impact >= 4 && (
          <>
            <span className="text-border">·</span>
            <Badge
              variant="outline"
              className="h-4 border-amber-500/40 bg-amber-500/10 px-1.5 text-[9px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400"
            >
              {IMPACT_LABELS[a.impact]} Impact
            </Badge>
          </>
        )}
      </div>

      {/* Headline */}
      <button
        onClick={() => setOpen(!open)}
        className="block w-full text-left"
      >
        <h2 className="text-base font-semibold leading-snug tracking-tight text-foreground transition-colors hover:text-foreground/80 md:text-lg">
          {headline}
        </h2>
      </button>

      {/* Summary */}
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {summary}
      </p>

      {/* Why matters - only when expanded */}
      {open && why && (
        <div className="mt-3 rounded-md border-l-2 border-emerald-500/60 bg-muted/30 px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {lang === "id" ? "Kenapa penting" : "Why it matters"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">
            {why}
          </p>
        </div>
      )}

      {/* Tags - only when expanded */}
      {open && a.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {a.tags.map((t) => (
            <Badge
              key={t}
              variant="secondary"
              className="h-5 px-1.5 text-[10px] font-mono lowercase"
            >
              #{t}
            </Badge>
          ))}
        </div>
      )}

      {/* Action row */}
      <div className="mt-3 flex items-center gap-4 text-xs">
        <button
          onClick={() => setLang(lang === "id" ? "en" : "id")}
          className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Toggle language"
        >
          <Languages className="h-3 w-3" />
          {lang === "id" ? "EN" : "ID"}
        </button>
        <Link
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          Source <ExternalLink className="h-3 w-3" />
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="ml-auto inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-expanded={open}
        >
          {open
            ? lang === "id"
              ? "Tutup"
              : "Close"
            : lang === "id"
              ? "Detail"
              : "More"}
          <ChevronDown
            className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    </article>
  );
}
