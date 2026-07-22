import { Router } from "express";
import { db } from "@workspace/db";
import { menuItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const MIGRATE_TOKEN = "craftpizza-migrate-2025";

// One-shot data migration endpoint — REMOVE AFTER USE
router.post("/admin/migrate-data-2", async (req, res) => {
  if (req.headers["x-migrate-token"] !== MIGRATE_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Delete Quattro Formaggi
    await db.delete(menuItemsTable).where(eq(menuItemsTable.name, "Quattro Formaggi"));

    // Rename Funghi e Tartufo → Funghi, price → 35
    await db.update(menuItemsTable)
      .set({ name: "Funghi", price: "35.00" })
      .where(eq(menuItemsTable.name, "Funghi e Tartufo"));

    // Rename Prosciutto e Rucola → Pancetta, new description, price → 35
    await db.update(menuItemsTable)
      .set({
        name: "Pancetta",
        price: "35.00",
        description: "Pancetta, fior di latte, pomidory San Marzano.",
      })
      .where(eq(menuItemsTable.name, "Prosciutto e Rucola"));

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
