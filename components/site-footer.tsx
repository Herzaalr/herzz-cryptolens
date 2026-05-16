import { Heart } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  const aiLabel = process.env.NEXT_PUBLIC_AI_LABEL || "DeepSeek V3";
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row md:justify-between md:px-6">
        <p className="flex items-center gap-1.5">
          Built with{" "}
          <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> by{" "}
          <Link
            href="https://github.com/Herzaalr"
            target="_blank"
            className="font-medium text-foreground hover:underline"
          >
            Herzaalr
          </Link>
        </p>
        <div className="flex items-center gap-4">
          <span className="font-mono">Powered by {aiLabel}</span>
          <Link
            href="https://github.com/Herzaalr"
            target="_blank"
            className="font-medium hover:text-foreground"
            aria-label="GitHub"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
