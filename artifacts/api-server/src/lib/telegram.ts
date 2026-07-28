import { db, appSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface TelegramSettings {
  botToken: string;
  chatId:   string;
  enabled:  boolean;
}

export async function getTelegramSettings(): Promise<TelegramSettings> {
  const rows = await db
    .select()
    .from(appSettingsTable)
    .where(eq(appSettingsTable.key, "telegram"));

  if (!rows[0]?.value) {
    return { botToken: "", chatId: "", enabled: false };
  }
  try {
    return JSON.parse(rows[0].value) as TelegramSettings;
  } catch {
    return { botToken: "", chatId: "", enabled: false };
  }
}

export async function saveTelegramSettings(settings: TelegramSettings): Promise<void> {
  const value = JSON.stringify(settings);
  await db
    .insert(appSettingsTable)
    .values({ key: "telegram", value })
    .onConflictDoUpdate({ target: appSettingsTable.key, set: { value } });
}

/** Send a plain-text or MarkdownV2 message. Returns true on success. */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
  parseMode: "MarkdownV2" | "HTML" | "" = "HTML"
): Promise<boolean> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const body: Record<string, string> = { chat_id: chatId, text };
  if (parseMode) body.parse_mode = parseMode;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.error("Telegram sendMessage failed:", res.status, err);
    return false;
  }
  return true;
}

interface OrderItem { name: string; price: number; quantity: number }

export async function sendOrderNotification(order: {
  id: number | string;
  customerName: string;
  customerPhone: string;
  pickupDate: string | null;
  pickupTime: string | null;
  specialInstructions: string | null;
}, items: OrderItem[], total: number): Promise<void> {
  const settings = await getTelegramSettings();
  if (!settings.enabled || !settings.botToken || !settings.chatId) return;

  const fmt = (n: number) => n.toFixed(2).replace(".", ",") + " zł";
  const itemLines = items
    .map((i) => `  • ${i.name} ×${i.quantity} — ${fmt(i.price * i.quantity)}`)
    .join("\n");

  const text = [
    `🍕 <b>Nowe zamówienie #${order.id}</b>`,
    ``,
    `👤 ${order.customerName}`,
    `📞 ${order.customerPhone}`,
    `📅 Odbiór: ${order.pickupDate ?? "—"} o ${order.pickupTime ?? "—"}`,
    ``,
    itemLines,
    ``,
    `💰 Razem: <b>${fmt(total)}</b>`,
    order.specialInstructions ? `\n📝 ${order.specialInstructions}` : "",
  ].filter((l) => l !== undefined).join("\n").trim();

  sendTelegramMessage(settings.botToken, settings.chatId, text, "HTML")
    .catch((err) => console.error("Telegram order notification failed:", err));
}
