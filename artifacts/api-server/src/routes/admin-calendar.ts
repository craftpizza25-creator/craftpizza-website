import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, calendarEventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const VALID_TYPES = ["event", "closure", "special", "announcement"] as const;
type EventType = typeof VALID_TYPES[number];

// ── Auth middleware ─────────────────────────────────────────────────────────
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const provided =
    (req.headers["x-admin-password"] as string | undefined) ??
    (req.query["adminPassword"] as string | undefined);

  if (!process.env.ADMIN_PASSWORD || provided !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// ── Manual validation ───────────────────────────────────────────────────────
function validateCreateBody(body: unknown): { data: { title: string; description?: string; date: string; startTime?: string; endTime?: string; type: EventType } } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid body" };
  const b = body as Record<string, unknown>;
  if (!b.title || typeof b.title !== "string" || b.title.trim() === "") return { error: "title is required" };
  if (!b.date || typeof b.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(b.date)) return { error: "date must be YYYY-MM-DD" };
  if (!VALID_TYPES.includes(b.type as EventType)) return { error: `type must be one of: ${VALID_TYPES.join(", ")}` };
  if (b.startTime && (typeof b.startTime !== "string" || !/^\d{2}:\d{2}$/.test(b.startTime))) return { error: "startTime must be HH:MM" };
  if (b.endTime && (typeof b.endTime !== "string" || !/^\d{2}:\d{2}$/.test(b.endTime))) return { error: "endTime must be HH:MM" };
  return {
    data: {
      title:       (b.title as string).trim(),
      description: typeof b.description === "string" ? b.description : undefined,
      date:        b.date as string,
      startTime:   b.startTime as string | undefined,
      endTime:     b.endTime as string | undefined,
      type:        b.type as EventType,
    },
  };
}

// ── GET  /api/admin/calendar-events  (all, incl. past) ─────────────────────
router.get("/admin/calendar-events", requireAdmin, async (_req, res): Promise<void> => {
  const items = await db
    .select()
    .from(calendarEventsTable)
    .orderBy(calendarEventsTable.date);
  res.json(items);
});

// ── POST /api/admin/calendar-events ─────────────────────────────────────────
router.post("/admin/calendar-events", requireAdmin, async (req, res): Promise<void> => {
  const validated = validateCreateBody(req.body);
  if ("error" in validated) {
    res.status(400).json({ error: validated.error });
    return;
  }
  const { data } = validated;

  const [event] = await db
    .insert(calendarEventsTable)
    .values({
      title:       data.title,
      description: data.description ?? null,
      date:        data.date,
      startTime:   data.startTime ?? null,
      endTime:     data.endTime ?? null,
      type:        data.type,
      isPublished: true,
    })
    .returning();

  res.status(201).json(event);
});

// ── DELETE /api/admin/calendar-events/:id ──────────────────────────────────
router.delete("/admin/calendar-events/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(calendarEventsTable).where(eq(calendarEventsTable.id, id));
  res.status(204).send();
});

export default router;
