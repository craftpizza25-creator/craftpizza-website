/**
 * Menu seed data — edit here, then run:
 *   pnpm --filter @workspace/db seed
 *
 * To apply to production: republish the app after seeding dev,
 * or ask the agent to run the migration against the live site.
 */

export const menuItems = [
  // ───────────────────────────── PIZZAS ─────────────────────────────
  {
    id: 1,
    name: "Margherita Classica",
    description: "Pomidory San Marzano, mozzarella fior di latte, świeża bazylia, oliwa extra vergine. Oryginał w najlepszym wydaniu.",
    price: 30.00,
    category: "Pizzas",
    isFeatured: true,
  },
  {
    id: 2,
    name: "Diavola",
    description: "Ostra salami kalabryska, pomidory San Marzano, fior di latte, płatki chilli. Pikantność z charakterem.",
    price: 35.00,
    category: "Pizzas",
    isFeatured: true,
  },
  {
    id: 4,
    name: "Funghi",
    description: "Leśne grzyby, krem truflowy, fior di latte, parmigiano, świeży tymianek. Ziemisty i wyrafinowany.",
    price: 35.00,
    category: "Pizzas",
    isFeatured: true,
  },
  {
    id: 5,
    name: "Capricciosa",
    description: "Pomidory San Marzano, mozzarella fior di latte, pieczarki, szynka Cotto.",
    price: 35.00,
    category: "Pizzas",
    isFeatured: false,
  },
  {
    id: 6,
    name: "Pancetta",
    description: "Pancetta, fior di latte, pomidory San Marzano.",
    price: 35.00,
    category: "Pizzas",
    isFeatured: true,
  },
  {
    id: 7,
    name: "Marinara",
    description: "Pomidory San Marzano, czosnek, oregano, oliwa z oliwek. Bez sera. Czysta tradycja neapolitańska.",
    price: 20.00,
    category: "Pizzas",
    isFeatured: false,
  },

  // ─────────────────────────── STARTERS ─────────────────────────────
  {
    id: 8,
    name: "Burrata con Pomodori",
    description: "Kremowa burrata, pomidory heritage, sól morska z Sycylii, dojrzały balsamico, świeża bazylia.",
    price: 11.50,
    category: "Starters",
    isFeatured: false,
  },
  {
    id: 9,
    name: "Bruschetta al Pomodoro",
    description: "Chrupiąca grzanka, ręcznie rozgniecione pomidory, czosnek, świeża bazylia, oliwa extra vergine.",
    price: 7.50,
    category: "Starters",
    isFeatured: false,
  },
  {
    id: 10,
    name: "Arancini Classici",
    description: "Złociste kulki ryżowe z szafranem, wnętrze z rozpływającą się mozzarellą, sos pomidorowy. Trzy sztuki.",
    price: 9.50,
    category: "Starters",
    isFeatured: false,
  },
  {
    id: 11,
    name: "Fritto Misto di Mare",
    description: "Lekko panierowane kalmary, krewetki, szprotki, aioli, cytryna. Prosto z frytownicy.",
    price: 13.50,
    category: "Starters",
    isFeatured: false,
  },

  // ─────────────────────────── DESSERTS ─────────────────────────────
  {
    id: 12,
    name: "Tiramisu della Casa",
    description: "Domowe tiramisu z biszkoptami Savoiardi, mocnym espresso, Marsalą i mascarpone. Przygotowywane codziennie rano.",
    price: 8.00,
    category: "Desserts",
    isFeatured: false,
  },
  {
    id: 13,
    name: "Panna Cotta al Limone",
    description: "Aksamitna panna cotta cytrynowa, kandyzowane cytrusy, okruszki pistacjowe. Lekka i orzeźwiająca.",
    price: 7.50,
    category: "Desserts",
    isFeatured: false,
  },
  {
    id: 14,
    name: "Gelato Artigianale",
    description: "Trzy gałki gelato przygotowywanego każdego dnia. Zapytaj kelnera o dostępne smaki.",
    price: 6.50,
    category: "Desserts",
    isFeatured: false,
  },

  // ──────────────────────────── DRINKS ──────────────────────────────
  {
    id: 15,
    name: "Acqua Naturale / Frizzante",
    description: "Woda mineralna niegazowana lub gazowana, 750 ml.",
    price: 3.50,
    category: "Drinks",
    isFeatured: false,
  },
  {
    id: 16,
    name: "Limonata Artigianale",
    description: "Świeżo wyciśnięte cytryny z Amalfi, woda gazowana, szczypta soli morskiej.",
    price: 4.50,
    category: "Drinks",
    isFeatured: false,
  },
  {
    id: 17,
    name: "Espresso",
    description: "Mieszanka single origin. Krótkie i intensywne.",
    price: 3.00,
    category: "Drinks",
    isFeatured: false,
  },
  {
    id: 18,
    name: "Birra Artigianale",
    description: "Zmieniający się wybór włoskich piw rzemieślniczych. Zapytaj o aktualne piwo z kranu.",
    price: 6.00,
    category: "Drinks",
    isFeatured: false,
  },
];
