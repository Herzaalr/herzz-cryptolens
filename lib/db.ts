import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = process.env.DATABASE_PATH || "./data/news.db";

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    const schema = fs.readFileSync(
      path.join(process.cwd(), "lib/schema.sql"),
      "utf-8",
    );
    db.exec(schema);
  }
  return db;
}
