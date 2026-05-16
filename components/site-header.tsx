import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const brand = process.env.NEXT_PUBLIC_BRAND || "Herzz Cryptolens";
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 font-mono text-sm font-semibold tracking-tight"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 transition-all group-hover:bg-emerald-400" />
          <span>{brand}</span>
          <span className="text-muted-foreground">_</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
