import { Router, type IRouter } from "express";
import { db, openingHoursTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function requireAdmin(req: any, res: any, next: any) {
  const pw = req.headers["x-admin-password"];
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// PUT /api/admin/opening-hours
// Body: array of { id, openTime, closeTime, isClosed }
router.put("/admin/opening-hours", requireAdmin, async (req, res): Promise<void> => {
  const rows: { id: number; openTime: string | null; closeTime: string | null; isClosed: boolean }[] =
    req.body;

  if (!Array.isArray(rows)) {
    res.status(400).json({ error: "Expected an array" });
    return;
  }

  await Promise.all(
    rows.map((row) =>
      db
        .update(openingHoursTable)
        .set({
          openTime:  row.isClosed ? null : (row.openTime  ?? null),
          closeTime: row.isClosed ? null : (row.closeTime ?? null),
          isClosed:  row.isClosed,
        })
        .where(eq(openingHoursTable.id, row.id))
    )
  );

  const updated = await db
    .select()
    .from(openingHoursTable)
    .orderBy(openingHoursTable.dayIndex);

  res.json(updated);
});

export default router;
