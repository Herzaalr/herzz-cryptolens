// OpenAI-compatible client via plain fetch (more reliable across relays)
export const AI_MODEL = process.env.AI_MODEL || "gpt-5.5";
export const AI_BASE_URL = process.env.AI_BASE_URL || "https://api.openai.com/v1";
export const AI_API_KEY = process.env.AI_API_KEY || "";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatCompletionResponse = {
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number };
};

export async function chatCompletion(opts: {
  model?: string;
  messages: ChatMessage[];
  response_format?: { type: "json_object" };
  temperature?: number;
  max_tokens?: number;
}): Promise<ChatCompletionResponse> {
  const body = {
    model: opts.model || AI_MODEL,
    messages: opts.messages,
    response_format: opts.response_format,
    temperature: opts.temperature,
    max_tokens: opts.max_tokens,
  };

  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI API ${res.status}: ${errText.slice(0, 300)}`);
  }

  const text = await res.text();
  // Some relays return a JSON-encoded string of the response. Unwrap.
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
  } catch {
    throw new Error(`AI API: invalid JSON response: ${text.slice(0, 300)}`);
  }
  return parsed as ChatCompletionResponse;
}
