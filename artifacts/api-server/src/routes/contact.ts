import { Router, type IRouter } from "express";
import { db, contactSubmissionsTable } from "@workspace/db";
import { SubmitContactBody, SubmitContactResponse } from "@workspace/api-zod";
import nodemailer from "nodemailer";

const router: IRouter = Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "craftpizza25@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

router.post("/contact", async (req, res): Promise<void> => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [submission] = await db
    .insert(contactSubmissionsTable)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      message: parsed.data.message,
    })
    .returning();

  // Send email notification to restaurant
  try {
    await transporter.sendMail({
      from: '"Craft Pizza – Formularz" <craftpizza25@gmail.com>',
      to: "craftpizza25@gmail.com",
      replyTo: parsed.data.email,
      subject: `Nowa wiadomość od ${parsed.data.name}`,
      text: [
        `Imię i nazwisko: ${parsed.data.name}`,
        `E-mail: ${parsed.data.email}`,
        parsed.data.phone ? `Telefon: ${parsed.data.phone}` : "",
        "",
        `Wiadomość:`,
        parsed.data.message,
      ]
        .filter((l) => l !== undefined)
        .join("\n"),
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
          <h2 style="margin-top:0;color:#1a1a1a">Nowa wiadomość z craftpizza.pl</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#6b7280;width:140px">Imię i nazwisko</td><td style="padding:8px 0;font-weight:600">${parsed.data.name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">E-mail</td><td style="padding:8px 0"><a href="mailto:${parsed.data.email}">${parsed.data.email}</a></td></tr>
            ${parsed.data.phone ? `<tr><td style="padding:8px 0;color:#6b7280">Telefon</td><td style="padding:8px 0">${parsed.data.phone}</td></tr>` : ""}
          </table>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
          <p style="color:#6b7280;margin-bottom:4px">Wiadomość:</p>
          <p style="white-space:pre-wrap;color:#1a1a1a">${parsed.data.message}</p>
        </div>
      `,
    });
  } catch (err) {
    // Log but don't fail the request — submission is already saved to DB
    console.error("Failed to send contact email:", err);
  }

  res.status(201).json(
    SubmitContactResponse.parse({
      ...submission,
      phone: submission.phone ?? null,
    })
  );
});

export default router;
