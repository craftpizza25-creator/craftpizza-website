import { db, appSettingsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

export async function seedAppSettings() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      id    SERIAL PRIMARY KEY,
      key   TEXT NOT NULL UNIQUE,
      value TEXT
    )
  `);
  // No default rows needed — settings are created on first PUT
}
