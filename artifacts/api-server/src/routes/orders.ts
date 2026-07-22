import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
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

  const { items, orderType, deliveryAddress, specialInstructions, ...rest } = parsed.data;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({
      ...rest,
      orderType,
      deliveryAddress: deliveryAddress ?? null,
      items: items,
      total: total.toFixed(2),
      status: "pending",
      specialInstructions: specialInstructions ?? null,
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
