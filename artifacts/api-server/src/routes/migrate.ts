import { Router } from "express";
import { db } from "@workspace/db";
import { menuItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const MIGRATE_TOKEN = "craftpizza-migrate-2025";

// One-shot data migration endpoint — REMOVE AFTER USE
router.post("/admin/migrate-data-3", async (req, res) => {
  if (req.headers["x-migrate-token"] !== MIGRATE_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await db.update(menuItemsTable).set({ description: "Ostre salami, pomidory San Marzano, mozzarella fior di latte, płatki chilli. Pikantność z charakterem." }).where(eq(menuItemsTable.name, "Diavola"));
    await db.update(menuItemsTable).set({ description: "Leśne grzyby/pieczarki, pomidory San Marzano, mozzarella fior di latte. Ziemisty i wyrafinowany." }).where(eq(menuItemsTable.name, "Funghi"));
    await db.update(menuItemsTable).set({ description: "Pancetta arrotolata, mozzarella fior di latte, pomidory San Marzano, czerwona cebula." }).where(eq(menuItemsTable.name, "Pancetta"));
    await db.update(menuItemsTable).set({ price: "22.00" }).where(eq(menuItemsTable.name, "Burrata con Pomodori"));
    await db.update(menuItemsTable).set({ price: "15.00" }).where(eq(menuItemsTable.name, "Bruschetta al Pomodoro"));
    await db.update(menuItemsTable).set({ price: "18.00" }).where(eq(menuItemsTable.name, "Tiramisu della Casa"));
    await db.update(menuItemsTable).set({ price: "18.00" }).where(eq(menuItemsTable.name, "Panna Cotta al Limone"));
    await db.update(menuItemsTable).set({ price: "18.00" }).where(eq(menuItemsTable.name, "Gelato Artigianale"));
    await db.update(menuItemsTable).set({ description: "Woda mineralna niegazowana lub gazowana, 500 ml.", price: "10.00" }).where(eq(menuItemsTable.name, "Acqua Naturale / Frizzante"));
    await db.update(menuItemsTable).set({ price: "10.00" }).where(eq(menuItemsTable.name, "Limonata Artigianale"));
    await db.update(menuItemsTable).set({ price: "10.00" }).where(eq(menuItemsTable.name, "Espresso"));
    await db.update(menuItemsTable).set({ price: "20.00" }).where(eq(menuItemsTable.name, "Birra Artigianale"));
    await db.delete(menuItemsTable).where(eq(menuItemsTable.name, "Arancini Classici"));
    await db.delete(menuItemsTable).where(eq(menuItemsTable.name, "Fritto Misto di Mare"));
    await db.insert(menuItemsTable).values({
      name: "Dolce Vita",
      description: "Pomidory San Marzano, mozzarella fior di latte, szynka Prosciutto Crudo, rukola, pomidorki koktajlowe, płatki Grana Padano, oliwa extra vergine, balsamico.",
      price: "37.00",
      category: "Pizzas",
      isAvailable: true,
      isFeatured: false,
    });
    await db.insert(menuItemsTable).values({
      name: "Focaccia Prosciutto",
      description: "Focaccia, mozzarella, pesto basilico, rukola, prosciutto crudo.",
      price: "30.00",
      category: "Starters",
      isAvailable: true,
      isFeatured: false,
    });
    await db.insert(menuItemsTable).values({
      name: "Cappuccino",
      description: "Intensywny smak kawy, puszysta mleczna pianka. Szybkie wyraziste pobudzenie.",
      price: "12.00",
      category: "Drinks",
      isAvailable: true,
      isFeatured: false,
    });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
