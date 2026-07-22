import { Router } from "express";
import { db } from "@workspace/db";
import { menuItemsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

const router = Router();

const MIGRATE_TOKEN = "craftpizza-migrate-2025";

// One-shot data migration endpoint — REMOVE AFTER USE
router.post("/admin/migrate-data", async (req, res) => {
  if (req.headers["x-migrate-token"] !== MIGRATE_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const updates = [
      { id: 1,  name: "Margherita Classica", price: 30.00, description: "Pomidory San Marzano, mozzarella fior di latte, świeża bazylia, oliwa extra vergine. Oryginał w najlepszym wydaniu." },
      { id: 2,  name: "Diavola",             price: 35.00, description: "Ostra salami kalabryska, pomidory San Marzano, fior di latte, płatki chilli. Pikantność z charakterem." },
      { id: 3,  name: "Quattro Formaggi",    price: 17.00, description: "Fior di latte, gorgonzola, pecorino romano, parmigiano reggiano, miód." },
      { id: 4,  name: "Funghi e Tartufo",    price: 18.50, description: "Leśne grzyby, krem truflowy, fior di latte, parmigiano, świeży tymianek. Ziemisty i wyrafinowany." },
      { id: 5,  name: "Capricciosa",         price: 35.00, description: "Pomidory San Marzano, mozzarella fior di latte, pieczarki, szynka Cotto." },
      { id: 6,  name: "Prosciutto e Rucola", price: 19.00, description: "Fior di latte, baza San Marzano, prosciutto crudo San Daniele, rukola, golony parmigiano." },
      { id: 7,  name: "Marinara",            price: 20.00, description: "Pomidory San Marzano, czosnek, oregano, oliwa z oliwek. Bez sera. Czysta tradycja neapolitańska." },
      { id: 8,  name: "Burrata con Pomodori",price: 11.50, description: "Kremowa burrata, pomidory heritage, sól morska z Sycylii, dojrzały balsamico, świeża bazylia." },
      { id: 9,  name: "Bruschetta al Pomodoro", price: 7.50, description: "Chrupiąca grzanka, ręcznie rozgniecione pomidory, czosnek, świeża bazylia, oliwa extra vergine." },
      { id: 10, name: "Arancini Classici",   price: 9.50,  description: "Złociste kulki ryżowe z szafranem, wnętrze z rozpływającą się mozzarellą, sos pomidorowy. Trzy sztuki." },
      { id: 11, name: "Fritto Misto di Mare",price: 13.50, description: "Lekko panierowane kalmary, krewetki, szprotki, aioli, cytryna. Prosto z frytownicy." },
      { id: 12, name: "Tiramisu della Casa", price: 8.00,  description: "Domowe tiramisu z biszkoptami Savoiardi, mocnym espresso, Marsalą i mascarpone. Przygotowywane codziennie rano." },
      { id: 13, name: "Panna Cotta al Limone", price: 7.50, description: "Aksamitna panna cotta cytrynowa, kandyzowane cytrusy, okruszki pistacjowe. Lekka i orzeźwiająca." },
      { id: 14, name: "Gelato Artigianale",  price: 6.50,  description: "Trzy gałki gelato przygotowywanego każdego dnia. Zapytaj kelnera o dostępne smaki." },
      { id: 15, name: "Acqua Naturale / Frizzante", price: 3.50, description: "Woda mineralna niegazowana lub gazowana, 750 ml." },
      { id: 16, name: "Limonata Artigianale",price: 4.50,  description: "Świeżo wyciśnięte cytryny z Amalfi, woda gazowana, szczypta soli morskiej." },
      { id: 17, name: "Espresso",            price: 3.00,  description: "Mieszanka single origin. Krótkie i intensywne." },
      { id: 18, name: "Birra Artigianale",   price: 6.00,  description: "Zmieniający się wybór włoskich piw rzemieślniczych. Zapytaj o aktualne piwo z kranu." },
    ];

    for (const item of updates) {
      await db.update(menuItemsTable)
        .set({ name: item.name, price: String(item.price), description: item.description })
        .where(eq(menuItemsTable.id, item.id));
    }

    return res.json({ success: true, updated: updates.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
