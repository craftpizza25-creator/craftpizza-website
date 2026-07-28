import { pgTable, text, serial } from "drizzle-orm/pg-core";

// Generic key/value settings store
export const appSettingsTable = pgTable("app_settings", {
  id:    serial("id").primaryKey(),
  key:   text("key").notNull().unique(),
  value: text("value"),          // JSON string or plain text
});

export type AppSetting = typeof appSettingsTable.$inferSelect;
