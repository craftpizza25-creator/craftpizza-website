import { Router } from "express";
import { db } from "@workspace/db";
import { galleryItemsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();
const MIGRATE_TOKEN = "craftpizza-migrate-2025";

// One-shot gallery migration — REMOVE AFTER USE
router.post("/admin/migrate-data-5", async (req, res) => {
  if (req.headers["x-migrate-token"] !== MIGRATE_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Update rows that have imageUrls found online
    const updates: Array<{ id: number; imageUrl: string }> = [
      { id: 19, imageUrl: "/gallery/wood-fired-oven.jpg" },
      { id: 20, imageUrl: "/gallery/margherita-oven.jpg" },
      { id: 21, imageUrl: "/gallery/restaurant-interior.jpg" },
      { id: 22, imageUrl: "/gallery/chef-dough.jpg" },
      { id: 23, imageUrl: "/gallery/burrata.png" },
      { id: 24, imageUrl: "/gallery/dining-room.jpg" },
      { id: 25, imageUrl: "/gallery/tiramisu.jpg" },
      { id: 26, imageUrl: "/gallery/pizza-diavola-2.jpg" },
    ];

    for (const { id, imageUrl } of updates) {
      await db.update(galleryItemsTable).set({ imageUrl }).where(eq(galleryItemsTable.id, id));
    }

    // Delete rows with no imageUrl (ids 19 wood-fired-oven, 27 terrace — no good photos found)
    await db.delete(galleryItemsTable).where(sql`image_url IS NULL OR image_url = ''`);

    return res.json({ success: true, updated: updates.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
