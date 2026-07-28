import { Router, type IRouter } from "express";
import { eq, inArray } from "drizzle-orm";
import { db, ordersTable, menuItemsTable } from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  CreateOrderResponse,
} from "@workspace/api-zod";
import nodemailer from "nodemailer";
import { sendOrderNotification } from "../lib/telegram";

const router: IRouter = Router();

const BOX_FEE = 2.00; // Opakowanie kartonowe

// ── Mailer ────────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "craftpizza25@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function esc(v: string): string {
  return v
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

function fmt(price: number): string {
  return `${price.toFixed(2).replace(".", ",")} zł`;
}

function formatDatePolish(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pl-PL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).replace(/^\w/, (c) => c.toUpperCase());
}

// ── HTML helpers ──────────────────────────────────────────────────────────────
const BASE_STYLE = `font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f5f5f0;margin:0;padding:0;`;
const CARD = `background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;margin:24px auto;box-shadow:0 2px 8px rgba(0,0,0,.08);`;
const HEADER = `background:#2d2423;padding:32px 32px 24px;text-align:center;`;
const BODY = `padding:32px;`;
const FOOTER = `background:#f5f5f0;padding:16px 32px;text-align:center;font-size:12px;color:#888;`;
const LABEL = `font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#999;font-weight:600;`;
const VALUE = `font-size:15px;color:#1a1a1a;font-weight:600;margin-top:2px;`;
const DIVIDER = `<tr><td colspan="3" style="padding:0;border-bottom:1px solid #f0ede8;height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
const ORANGE = "#c85a1e";

type ResolvedItem = { menuItemId: number; name: string; price: number; quantity: number };

function itemsTableHtml(items: ResolvedItem[], boxFee: number): string {
  const rows = items.map((it) => `
    <tr>
      <td style="padding:10px 0;color:#1a1a1a;font-size:14px;">${esc(it.name)}</td>
      <td style="padding:10px 0;color:#888;font-size:14px;text-align:center;">${it.quantity}×</td>
      <td style="padding:10px 0;color:#1a1a1a;font-size:14px;text-align:right;font-weight:600;">${fmt(it.price * it.quantity)}</td>
    </tr>
  `).join("");

  const itemsTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const boxFeeRow = boxFee > 0 ? `
        <tr>
          <td colspan="2" style="padding:8px 0;color:#888;font-size:13px;">Opakowanie kartonowe</td>
          <td style="padding:8px 0;color:#888;font-size:13px;text-align:right;">${fmt(boxFee)}</td>
        </tr>` : "";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th style="padding:0 0 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#999;font-weight:600;">Pozycja</th>
          <th style="padding:0 0 8px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#999;font-weight:600;">Ilość</th>
          <th style="padding:0 0 8px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#999;font-weight:600;">Cena</th>
        </tr>
        <tr><td colspan="3" style="border-bottom:1px solid #f0ede8;padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr><td colspan="3" style="border-bottom:1px solid #f0ede8;padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>
        ${boxFeeRow}
        <tr>
          <td colspan="2" style="padding:8px 0;font-weight:700;font-size:16px;color:#1a1a1a;">Do zapłaty</td>
          <td style="padding:8px 0;font-weight:700;font-size:16px;color:${ORANGE};text-align:right;">${fmt(itemsTotal + boxFee)}</td>
        </tr>
      </tfoot>
    </table>
  `;
}

// ── Email to restaurant ───────────────────────────────────────────────────────
function buildRestaurantEmail(order: {
  id: number; customerName: string; customerEmail: string; customerPhone: string;
  pickupDate: string | null; pickupTime: string | null;
  specialInstructions: string | null;
}, items: ResolvedItem[], boxFee: number): string {
  const pickupLine = order.pickupDate
    ? `${formatDatePolish(order.pickupDate)}, godz. <strong>${esc(order.pickupTime ?? "")}</strong>`
    : "—";

  return `<!DOCTYPE html><html><body style="${BASE_STYLE}">
<div style="${CARD}">
  <div style="${HEADER}">
    <img src="https://i.imgur.com/placeholder.png" alt="" width="0" height="0"/>
    <p style="color:#c8a97a;font-size:11px;text-transform:uppercase;letter-spacing:.12em;margin:0 0 8px;">Craft Pizza – Nowe zamówienie</p>
    <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;">Zamówienie #${order.id}</h1>
    <p style="color:#c8a97a;margin:8px 0 0;font-size:14px;">📅 ${pickupLine}</p>
  </div>
  <div style="${BODY}">

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:28px;">
      <tr>
        <td style="padding:0 16px 0 0;vertical-align:top;width:33%;">
          <p style="${LABEL}">Klient</p>
          <p style="${VALUE}">${esc(order.customerName)}</p>
        </td>
        <td style="padding:0 16px;vertical-align:top;width:33%;">
          <p style="${LABEL}">Telefon</p>
          <p style="${VALUE}"><a href="tel:${esc(order.customerPhone)}" style="color:${ORANGE};text-decoration:none;">${esc(order.customerPhone)}</a></p>
        </td>
        <td style="padding:0 0 0 16px;vertical-align:top;width:33%;">
          <p style="${LABEL}">E-mail</p>
          <p style="${VALUE}"><a href="mailto:${esc(order.customerEmail)}" style="color:${ORANGE};text-decoration:none;">${esc(order.customerEmail)}</a></p>
        </td>
      </tr>
    </table>

    <hr style="border:none;border-top:1px solid #f0ede8;margin:0 0 24px;"/>
    ${itemsTableHtml(items, boxFee)}

    ${order.specialInstructions ? `
    <div style="background:#fdf9f5;border-left:3px solid ${ORANGE};padding:12px 16px;margin-top:24px;border-radius:0 4px 4px 0;">
      <p style="${LABEL}margin-bottom:4px;">Uwagi do zamówienia</p>
      <p style="margin:0;color:#1a1a1a;font-size:14px;">${esc(order.specialInstructions)}</p>
    </div>` : ""}

    <div style="margin-top:28px;background:#fdf9f5;border-radius:6px;padding:16px 20px;">
      <p style="margin:0 0 8px;font-size:13px;color:#555;">Aby <strong>potwierdzić</strong> zamówienie, odpowiedz na tego e-maila słowem <strong style="color:${ORANGE};">POTWIERDZAM</strong>. Klient oczekuje potwierdzenia przed przystąpieniem do przygotowania zamówienia.</p>
      <p style="margin:0;font-size:12px;color:#888;">Reply-to tego e-maila kieruje bezpośrednio do klienta.</p>
    </div>

  </div>
  <div style="${FOOTER}">Craft Pizza · Łączany · craftpizza25@gmail.com</div>
</div>
</body></html>`;
}

// ── Email to customer ─────────────────────────────────────────────────────────
function buildCustomerEmail(order: {
  id: number; customerName: string;
  pickupDate: string | null; pickupTime: string | null;
}, items: ResolvedItem[], boxFee: number): string {
  const pickupLine = order.pickupDate
    ? `${formatDatePolish(order.pickupDate)}, godz. <strong>${esc(order.pickupTime ?? "")}</strong>`
    : "—";
  const firstName = esc(order.customerName.split(" ")[0]);

  return `<!DOCTYPE html><html><body style="${BASE_STYLE}">
<div style="${CARD}">
  <div style="${HEADER}">
    <p style="color:#c8a97a;font-size:11px;text-transform:uppercase;letter-spacing:.12em;margin:0 0 8px;">Craft Pizza</p>
    <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;">Dziękujemy, ${firstName}!</h1>
    <p style="color:#c8a97a;margin:8px 0 0;font-size:14px;">Zamówienie #${order.id} zostało przyjęte</p>
  </div>
  <div style="${BODY}">

    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
      Twoje zamówienie zostało zapisane. Prosimy o <strong>potwierdzenie odbioru</strong> — wystarczy odpowiedzieć na tego e-maila wpisując słowo <strong style="color:${ORANGE};">POTWIERDZAM</strong>. Po potwierdzeniu przystąpimy do przygotowania zamówienia.
    </p>

    <!-- Pickup info -->
    <div style="background:#fdf9f5;border-radius:8px;padding:20px 24px;margin-bottom:28px;">
      <p style="${LABEL}margin-bottom:4px;">Termin i miejsce odbioru</p>
      <p style="margin:0 0 4px;font-size:16px;color:#1a1a1a;font-weight:700;">📅 ${pickupLine}</p>
      <p style="margin:0;font-size:14px;color:#555;">📍 Craft Pizza · Łączany (k. Skawiny)</p>
    </div>

    <!-- Items -->
    ${itemsTableHtml(items, boxFee)}

    <!-- Payment & no-show clause -->
    <div style="margin-top:28px;background:#fff8f0;border:1px solid #f5d8c0;border-radius:8px;padding:20px 24px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#a04010;text-transform:uppercase;letter-spacing:.06em;">⚠️ Warunki zamówienia i płatności</p>
      <ul style="margin:0;padding-left:18px;color:#555;font-size:13px;line-height:1.8;">
        <li>Zamówienie staje się <strong>wiążące z chwilą jego potwierdzenia</strong> przez klienta (odpowiedź POTWIERDZAM) oraz potwierdzenia przez Craft Pizza.</li>
        <li>Płatność jest <strong>wymagana przy odbiorze</strong> — gotówką lub kartą.</li>
        <li>W przypadku <strong>nieodebrania potwierdzonego zamówienia</strong> w wybranym terminie Craft Pizza zastrzega sobie prawo do obciążenia klienta <strong>pełnym kosztem zamówienia</strong> (${fmt(items.reduce((s, i) => s + i.price * i.quantity, 0) + boxFee)}).</li>
        <li>Anulowanie zamówienia jest możliwe wyłącznie przez kontakt mailowy lub telefoniczny <strong>co najmniej 2 godziny przed wybranym terminem odbioru.</strong></li>
      </ul>
    </div>

    <div style="margin-top:28px;background:#f5f5f0;border-radius:8px;padding:20px 24px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#555;">Aby <strong>potwierdzić zamówienie</strong>, odpowiedz na tego e-maila:</p>
      <p style="margin:0;font-size:22px;font-weight:700;color:${ORANGE};letter-spacing:.06em;">POTWIERDZAM</p>
      <p style="margin:8px 0 0;font-size:12px;color:#888;">Odpowiedź trafi bezpośrednio do Craft Pizza.</p>
    </div>

    <p style="margin:24px 0 0;font-size:13px;color:#888;text-align:center;line-height:1.6;">
      W razie pytań: <a href="mailto:craftpizza25@gmail.com" style="color:${ORANGE};">craftpizza25@gmail.com</a><br/>
      Instagram: <a href="https://instagram.com/craftpizza" style="color:${ORANGE};">@craftpizza</a>
    </p>

  </div>
  <div style="${FOOTER}">
    Craft Pizza · Łączany · craftpizza25@gmail.com<br/>
    <span style="font-size:10px;color:#aaa;">Wiadomość wygenerowana automatycznie po złożeniu zamówienia na craftpizza.pl</span>
  </div>
</div>
</body></html>`;
}

// ── Routes ────────────────────────────────────────────────────────────────────
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

  const hasPizza = resolvedItems.some(item => menuItemMap.get(item.menuItemId)?.category === "Pizzas");
  const appliedBoxFee = hasPizza ? BOX_FEE : 0;
  const total = resolvedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + appliedBoxFee;

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

  // ── Send emails (non-blocking — failures logged, not surfaced to customer) ──
  const orderForEmail = {
    id: order.id as unknown as number,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    pickupDate: order.pickupDate ?? null,
    pickupTime: order.pickupTime ?? null,
    specialInstructions: order.specialInstructions ?? null,
  };

  // 1. Notify restaurant
  transporter.sendMail({
    from: '"Craft Pizza – Zamówienia" <craftpizza25@gmail.com>',
    to: "craftpizza25@gmail.com",
    replyTo: order.customerEmail,
    subject: `🍕 Nowe zamówienie #${orderForEmail.id} – odbiór ${order.pickupDate ?? ""} o ${order.pickupTime ?? ""}`,
    html: buildRestaurantEmail(orderForEmail, resolvedItems, appliedBoxFee),
  }).catch((err) => console.error("Restaurant order email failed:", err));

  // 2. Confirm to customer
  transporter.sendMail({
    from: '"Craft Pizza" <craftpizza25@gmail.com>',
    to: order.customerEmail,
    replyTo: "craftpizza25@gmail.com",
    subject: `Zamówienie #${orderForEmail.id} przyjęte – Craft Pizza 🍕`,
    html: buildCustomerEmail(orderForEmail, resolvedItems, appliedBoxFee),
  }).catch((err) => console.error("Customer order email failed:", err));

  // 3. Telegram notification (non-blocking)
  sendOrderNotification(orderForEmail, resolvedItems, total)
    .catch((err) => console.error("Telegram notification failed:", err));

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
