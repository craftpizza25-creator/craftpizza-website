import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, menuItemsTable } from "@workspace/db";

const router: IRouter = Router();

const PIZZA_TYGODNIA_ID = 22;

function checkAuth(req: { headers: Record<string, string | string[] | undefined> }, adminPassword: string): boolean {
  return req.headers["x-admin-password"] === adminPassword;
}

// GET /api/admin/pizza-tygodnia — return current pizza tygodnia data
router.get("/admin/pizza-tygodnia", async (req, res): Promise<void> => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || !checkAuth(req, adminPassword)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [item] = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.id, PIZZA_TYGODNIA_ID));

  if (!item) {
    res.status(404).json({ error: "Pizza tygodnia not found" });
    return;
  }

  res.json({
    id: item.id,
    name: item.name,
    description: item.description,
    price: parseFloat(item.price),
  });
});

// PUT /api/admin/pizza-tygodnia — update name, ingredients (description), price
router.put("/admin/pizza-tygodnia", async (req, res): Promise<void> => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || !checkAuth(req, adminPassword)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { name, description, price } = req.body as {
    name?: string;
    description?: string;
    price?: number;
  };

  if (!name || !description || price == null) {
    res.status(400).json({ error: "name, description i price są wymagane." });
    return;
  }

  if (typeof price !== "number" || price <= 0) {
    res.status(400).json({ error: "Cena musi być liczbą większą od 0." });
    return;
  }

  const [updated] = await db
    .update(menuItemsTable)
    .set({ name: name.trim(), description: description.trim(), price: price.toFixed(2) })
    .where(eq(menuItemsTable.id, PIZZA_TYGODNIA_ID))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Pizza tygodnia not found" });
    return;
  }

  res.json({
    id: updated.id,
    name: updated.name,
    description: updated.description,
    price: parseFloat(updated.price),
  });
});

export default router;
