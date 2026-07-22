import { Router } from "express";
import { db } from "@workspace/db";
import { galleryItemsTable } from "@workspace/db";
import { isNull, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

const MIGRATE_TOKEN = "craftpizza-migrate-2025";

// One-shot gallery migration — REMOVE AFTER USE
router.post("/admin/migrate-data-4", async (req, res) => {
  if (req.headers["x-migrate-token"] !== MIGRATE_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Remove old placeholder rows that have no imageUrl
    await db.delete(galleryItemsTable).where(sql`image_url IS NULL OR image_url = ''`);

    // Insert the 6 real photos
    await db.insert(galleryItemsTable).values([
      { imageUrl: "/gallery/pizza-dolce-vita.jpg",  alt: "Pizza Dolce Vita – prosciutto crudo, rukola, pomidorki, Grana Padano", category: "pizza" },
      { imageUrl: "/gallery/pizza-fiamma.jpg",      alt: "Pizza w ogniu – spektakularny moment serwowania", category: "pizza" },
      { imageUrl: "/gallery/pizza-diavola.jpg",     alt: "Pizza Diavola – pikantne salami, pomidory, chilli", category: "pizza" },
      { imageUrl: "/gallery/pizza-prosciutto.jpg",  alt: "Pizza z prosciutto crudo, rukolą i pomidorkami koktajlowymi", category: "pizza" },
      { imageUrl: "/gallery/pizza-margherita.jpg",  alt: "Pizza Margherita – klasyczna, prosto z pieca", category: "pizza" },
      { imageUrl: "/gallery/pizza-craft.jpg",       alt: "Craft Pizza – rzemieślnicze ciasto neapolitańskie", category: "pizza" },
    ]);

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
