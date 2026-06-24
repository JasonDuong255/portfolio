import fs from "node:fs/promises";
import { Client } from "pg";

const env = await readEnvFile(".env.local");
const connectionString =
  process.env.SUPABASE_DB_URL ?? env.SUPABASE_DB_URL ?? "";

if (!connectionString) {
  throw new Error("SUPABASE_DB_URL is missing from .env.local.");
}

const sql = await fs.readFile("supabase/schema.sql", "utf8");
const client = new Client({
  connectionString: normalizeConnectionString(connectionString),
  ssl: {
    rejectUnauthorized: false
  }
});

try {
  await client.connect();
  await client.query("begin");
  await client.query(sql);
  await client.query("commit");
  console.log("Supabase schema applied successfully.");
} catch (error) {
  await client.query("rollback").catch(() => {});
  throw error;
} finally {
  await client.end().catch(() => {});
}

async function readEnvFile(filePath) {
  try {
    const text = await fs.readFile(filePath, "utf8");
    return Object.fromEntries(
      text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          const key = line.slice(0, index).trim();
          const value = line.slice(index + 1).trim().replace(/^"|"$/g, "");
          return [key, value];
        })
    );
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

function normalizeConnectionString(value) {
  const url = new URL(value);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("uselibpqcompat");
  return url.toString();
}
