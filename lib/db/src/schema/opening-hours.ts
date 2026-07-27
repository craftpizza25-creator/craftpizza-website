import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";

export const openingHoursTable = pgTable("opening_hours", {
  id: serial("id").primaryKey(),
  dayIndex: serial("day_index"),          // 0 = Poniedziałek … 6 = Niedziela
  dayName: text("day_name").notNull(),
  openTime: text("open_time"),            // HH:MM or null
  closeTime: text("close_time"),          // HH:MM or null
  isClosed: boolean("is_closed").notNull().default(false),
});

export type OpeningHour = typeof openingHoursTable.$inferSelect;
