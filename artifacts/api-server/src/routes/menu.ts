import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, menuItemsTable } from "@workspace/db";
import {
  GetMenuItemsQueryParams,
  GetMenuItemParams,
  GetMenuItemResponse,
  GetMenuItemsResponse,
  GetFeaturedMenuItemsResponse,
  GetMenuCategoriesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/menu-items", async (req, res): Promise<void> => {
  const query = GetMenuItemsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const items = query.data.category
    ? await db.select().from(menuItemsTable).where(eq(menuItemsTable.category, query.data.category))
    : await db.select().from(menuItemsTable);

  const mapped = items.map((item) => ({
    ...item,
    price: parseFloat(item.price),
    imageUrl: item.imageUrl ?? null,
  }));

  res.json(GetMenuItemsResponse.parse(mapped));
});

router.get("/menu-items/featured", async (_req, res): Promise<void> => {
  const items = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.isFeatured, true));

  const mapped = items.map((item) => ({
    ...item,
    price: parseFloat(item.price),
    imageUrl: item.imageUrl ?? null,
  }));

  res.json(GetFeaturedMenuItemsResponse.parse(mapped));
});

router.get("/menu-categories", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      name: menuItemsTable.category,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(menuItemsTable)
    .groupBy(menuItemsTable.category);

  res.json(GetMenuCategoriesResponse.parse(rows));
});

router.get("/menu-items/:id", async (req, res): Promise<void> => {
  const params = GetMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.id, params.data.id));

  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  res.json(GetMenuItemResponse.parse({
    ...item,
    price: parseFloat(item.price),
    imageUrl: item.imageUrl ?? null,
  }));
});

export default router;
