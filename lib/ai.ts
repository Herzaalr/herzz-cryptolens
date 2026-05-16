import OpenAI from "openai";

export const ai = new OpenAI({
  apiKey: process.env.AI_API_KEY || "missing-key",
  baseURL: process.env.AI_BASE_URL || "https://api.deepseek.com/v1",
});

export const AI_MODEL = process.env.AI_MODEL || "deepseek-chat";
