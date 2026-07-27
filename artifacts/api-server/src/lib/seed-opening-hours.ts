import { db, openingHoursTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const DEFAULTS = [
  { dayIndex: 0, dayName: "Poniedziałek", openTime: null,    closeTime: null,    isClosed: true  },
  { dayIndex: 1, dayName: "Wtorek",       openTime: null,    closeTime: null,    isClosed: true  },
  { dayIndex: 2, dayName: "Środa",        openTime: "12:00", closeTime: "21:00", isClosed: false },
  { dayIndex: 3, dayName: "Czwartek",     openTime: "12:00", closeTime: "21:00", isClosed: false },
  { dayIndex: 4, dayName: "Piątek",       openTime: "12:00", closeTime: "22:00", isClosed: false },
  { dayIndex: 5, dayName: "Sobota",       openTime: "12:00", closeTime: "22:00", isClosed: false },
  { dayIndex: 6, dayName: "Niedziela",    openTime: "12:00", closeTime: "21:00", isClosed: false },
];

export async function seedOpeningHours() {
  // Create table if it doesn't exist yet (handles production cold-start before publish migration)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS opening_hours (
      id         SERIAL PRIMARY KEY,
      day_index  INTEGER NOT NULL,
      day_name   TEXT NOT NULL,
      open_time  TEXT,
      close_time TEXT,
      is_closed  BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);

  const existing = await db.select().from(openingHoursTable);
  if (existing.length > 0) return;

  await db.insert(openingHoursTable).values(DEFAULTS);
}
