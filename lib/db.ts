import { createClient, type Client } from "@libsql/client";
import fs from "fs";
import path from "path";

let client: Client | null = null;
let initialized = false;

function buildClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url && url.startsWith("libsql://")) {
    if (!authToken) {
      throw new Error("TURSO_AUTH_TOKEN required when using libsql:// URL");
    }
    return createClient({ url, authToken });
  }

  // Local fallback for dev: file:./data/news.db
  const localUrl = url || `file:${process.env.DATABASE_PATH || "./data/news.db"}`;
  const filePath = localUrl.replace(/^file:/, "");
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return createClient({ url: localUrl });
}

async function bootstrapSchema(c: Client) {
  const schemaPath = path.join(process.cwd(), "lib/schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  // Split on semicolons, ignore empty/comment-only chunks
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const stmt of statements) {
    await c.execute(stmt);
  }
}

export async function getDb(): Promise<Client> {
  if (!client) {
    client = buildClient();
  }
  if (!initialized) {
    await bootstrapSchema(client);
    initialized = true;
  }
  return client;
}
