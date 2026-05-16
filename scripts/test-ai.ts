import { chatCompletion, AI_MODEL } from "../lib/ai";

(async () => {
  console.log("Model:", AI_MODEL);
  console.log("Base URL:", process.env.AI_BASE_URL);
  const r = await chatCompletion({
    model: AI_MODEL,
    messages: [
      { role: "user", content: 'Reply with JSON: {"hello": "world"}' },
    ],
    response_format: { type: "json_object" },
    max_tokens: 50,
  });
  console.log("FULL RESPONSE:", JSON.stringify(r, null, 2));
})().catch((e) => {
  console.error("ERROR:", e.message);
  console.error(e);
});
