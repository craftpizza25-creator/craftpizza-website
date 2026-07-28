import { Router, type IRouter } from "express";
import {
  getTelegramSettings,
  saveTelegramSettings,
  sendTelegramMessage,
  type TelegramSettings,
} from "../lib/telegram";

const router: IRouter = Router();

function requireAdmin(req: any, res: any, next: any) {
  const pw = req.headers["x-admin-password"];
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// GET /api/admin/telegram-settings
router.get("/admin/telegram-settings", requireAdmin, async (_req, res): Promise<void> => {
  const settings = await getTelegramSettings();
  // Mask token in response — return only first 8 chars + "…"
  res.json({
    ...settings,
    botToken: settings.botToken
      ? settings.botToken.slice(0, 8) + "…"
      : "",
    botTokenSet: !!settings.botToken,
  });
});

// PUT /api/admin/telegram-settings
router.put("/admin/telegram-settings", requireAdmin, async (req, res): Promise<void> => {
  const { botToken, chatId, enabled } = req.body as Partial<TelegramSettings> & { botToken?: string };

  const current = await getTelegramSettings();

  // If the incoming token is masked (ends with "…"), keep the stored one
  const finalToken =
    botToken && !botToken.endsWith("…") ? botToken : current.botToken;

  await saveTelegramSettings({
    botToken: finalToken,
    chatId:   chatId   ?? current.chatId,
    enabled:  enabled  ?? current.enabled,
  });

  res.json({ ok: true });
});

// POST /api/admin/telegram-test
router.post("/admin/telegram-test", requireAdmin, async (_req, res): Promise<void> => {
  const settings = await getTelegramSettings();

  if (!settings.botToken || !settings.chatId) {
    res.status(400).json({ error: "Brak konfiguracji — wprowadź token i Chat ID." });
    return;
  }

  const ok = await sendTelegramMessage(
    settings.botToken,
    settings.chatId,
    "✅ <b>Craft Pizza</b> — testowe powiadomienie działa poprawnie! 🍕",
    "HTML"
  );

  if (ok) {
    res.json({ ok: true });
  } else {
    res.status(502).json({ error: "Wysyłka nieudana — sprawdź token i Chat ID." });
  }
});

export default router;
