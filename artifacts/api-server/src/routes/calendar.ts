import { Router, type IRouter } from "express";
import { db, calendarEventsTable } from "@workspace/db";
import { GetCalendarEventsResponse } from "@workspace/api-zod";
import { eq, gte, asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/calendar-events", async (req, res): Promise<void> => {
  const { from } = req.query as { from?: string };

  const fromDate = from ?? new Date().toISOString().slice(0, 10); // default: today

  const items = await db
    .select()
    .from(calendarEventsTable)
    .where(
      eq(calendarEventsTable.isPublished, true)
    )
    .orderBy(asc(calendarEventsTable.date), asc(calendarEventsTable.startTime));

  // filter client-side to avoid complex drizzle date comparison on text col
  const filtered = items.filter((e) => e.date >= fromDate);

  res.json(GetCalendarEventsResponse.parse(filtered));
});

export default router;
