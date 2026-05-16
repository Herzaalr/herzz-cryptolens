import { summarizePending } from "../lib/summarizer";

(async () => {
  const r = await summarizePending(3);
  console.log("result:", r);
})().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
