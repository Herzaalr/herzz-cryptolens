type Sentiment = "bullish" | "bearish" | "neutral";

export function SentimentDot({ s }: { s: Sentiment }) {
  const map = {
    bullish: { color: "bg-emerald-500", ring: "ring-emerald-500/20", label: "Bullish" },
    bearish: { color: "bg-rose-500", ring: "ring-rose-500/20", label: "Bearish" },
    neutral: { color: "bg-zinc-400", ring: "ring-zinc-400/20", label: "Neutral" },
  } as const;
  const { color, ring, label } = map[s] ?? map.neutral;
  return (
    <span
      title={label}
      className={`inline-flex h-2 w-2 rounded-full ${color} ring-2 ${ring}`}
      aria-label={label}
    />
  );
}
