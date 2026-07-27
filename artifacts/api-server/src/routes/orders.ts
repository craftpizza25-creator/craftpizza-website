import { Router, type IRouter } from "express";
import { eq, inArray } from "drizzle-orm";
import { db, ordersTable, menuItemsTable } from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  CreateOrderResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { items, orderType, deliveryAddress, specialInstructions, pickupDate, pickupTime, ...rest } = parsed.data;

  // Look up authoritative prices from the database; reject any unknown menu items
  const menuItemIds = items.map((item) => item.menuItemId);
  const menuItems = await db
    .select()
    .from(menuItemsTable)
    .where(inArray(menuItemsTable.id, menuItemIds));

  const menuItemMap = new Map(menuItems.map((mi) => [mi.id, mi]));

  for (const item of items) {
    if (!menuItemMap.has(item.menuItemId)) {
      res.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
      return;
    }
  }

  // Build order items using server-side prices and names; ignore client-supplied price
  const resolvedItems = items.map((item) => {
    const menuItem = menuItemMap.get(item.menuItemId)!;
    return {
      menuItemId: item.menuItemId,
      name: menuItem.name,
      price: parseFloat(menuItem.price),
      quantity: item.quantity,
    };
  });

  const total = resolvedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({
      ...rest,
      orderType,
      deliveryAddress: deliveryAddress ?? null,
      items: resolvedItems,
      total: total.toFixed(2),
      status: "pending",
      specialInstructions: specialInstructions ?? null,
      pickupDate: pickupDate ?? null,
      pickupTime: pickupTime ?? null,
    })
    .returning();

  res.status(201).json(
    CreateOrderResponse.parse({
      ...order,
      total: parseFloat(order.total),
      items: order.items as Array<{ menuItemId: number; name: string; price: number; quantity: number }>,
      deliveryAddress: order.deliveryAddress ?? null,
      specialInstructions: order.specialInstructions ?? null,
    })
  );
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(
    GetOrderResponse.parse({
      ...order,
      total: parseFloat(order.total),
      items: order.items as Array<{ menuItemId: number; name: string; price: number; quantity: number }>,
      deliveryAddress: order.deliveryAddress ?? null,
      specialInstructions: order.specialInstructions ?? null,
    })
  );
});

export default router;
