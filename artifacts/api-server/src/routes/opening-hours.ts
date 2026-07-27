import { Router, type IRouter } from "express";
import { db, openingHoursTable } from "@workspace/db";
import { asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/opening-hours", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(openingHoursTable)
    .orderBy(asc(openingHoursTable.dayIndex));
  res.json(rows);
});

export default router;
