"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "trending", label: "Trending" },
  { key: "picks", label: "Editor's Pick" },
] as const;

export function ViewFilter() {
  const params = useSearchParams();
  const current = params.get("view") || "all";

  return (
    <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-border/60 pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {FILTERS.map((f) => {
        const active = current === f.key;
        return (
          <Link
            key={f.key}
            href={f.key === "all" ? "/" : `/?view=${f.key}`}
            className={`relative shrink-0 px-3 py-2 text-sm transition-colors ${
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
            {active && (
              <span className="absolute inset-x-3 -bottom-px h-px bg-foreground" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
