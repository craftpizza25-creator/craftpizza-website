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
    description: "Ostre salami, pomidory San Marzano, mozzarella fior di latte, płatki chilli. Pikantność z charakterem.",
    price: 35.00,
    category: "Pizzas",
    isFeatured: true,
  },
  {
    id: 3,
    name: "Funghi",
    description: "Leśne grzyby/pieczarki, pomidory San Marzano, mozzarella fior di latte. Ziemisty i wyrafinowany.",
    price: 35.00,
    category: "Pizzas",
    isFeatured: true,
  },
  {
    id: 4,
    name: "Capricciosa",
    description: "Pomidory San Marzano, mozzarella fior di latte, pieczarki, szynka Cotto.",
    price: 35.00,
    category: "Pizzas",
    isFeatured: false,
  },
  {
    id: 5,
    name: "Pancetta",
    description: "Pancetta arrotolata, mozzarella fior di latte, pomidory San Marzano, czerwona cebula.",
    price: 35.00,
    category: "Pizzas",
    isFeatured: true,
  },
  {
    id: 6,
    name: "Marinara",
    description: "Pomidory San Marzano, czosnek, oregano, oliwa z oliwek. Bez sera. Czysta tradycja neapolitańska.",
    price: 20.00,
    category: "Pizzas",
    isFeatured: false,
  },
  {
    id:7,
    name:"Dolce Vita",
    description: "Pomidory San Marzano, mozzarella fior di latte, szynka Prosciutto Crudo, rukola, pomidorki koktajlowe, platki Grana Padano, oliwa extra vergine, balsamico",
    price:37.00,
    category: "Pizzas",
    isFeatured: false,
  },

  // ─────────────────────────── STARTERS ─────────────────────────────
  {
    id: 8,
    name: "Burrata con Pomodori",
    description: "Kremowa burrata, pomidory heritage, sól morska z Sycylii, dojrzały balsamico, świeża bazylia.",
    price: 22.00,
    category: "Starters",
    isFeatured: false,
  },
  {
    id: 9,
    name: "Bruschetta al Pomodoro",
    description: "Chrupiąca grzanka, ręcznie rozgniecione pomidory, czosnek, świeża bazylia, oliwa extra vergine.",
    price: 15.00,
    category: "Starters",
    isFeatured: false,
  },
  {
    id: 10,
    name: "Focacia Prosciutto sandwich ,",
    description: "Focacia, mozzarella, pesto basilico, rukola, prosciutto crudo.",
    price: 30.00,
    category: "Starters",
    isFeatured: false,
  },
  

  // ─────────────────────────── DESSERTS ─────────────────────────────
  {
    id: 11,
    name: "Tiramisu della Casa",
    description: "Domowe tiramisu z biszkoptami Savoiardi, mocnym espresso, Marsalą i mascarpone. Przygotowywane codziennie rano.",
    price: 18.00,
    category: "Desserts",
    isFeatured: false,
  },
  {
    id: 12,
    name: "Panna Cotta al Limone",
    description: "Aksamitna panna cotta cytrynowa, kandyzowane cytrusy, okruszki pistacjowe. Lekka i orzeźwiająca.",
    price: 18.00,
    category: "Desserts",
    isFeatured: false,
  },
  {
    id: 13,
    name: "Gelato Artigianale",
    description: "Trzy gałki gelato przygotowywanego każdego dnia. Zapytaj kelnera o dostępne smaki.",
    price: 18.00,
    category: "Desserts",
    isFeatured: false,
  },

  // ──────────────────────────── DRINKS ──────────────────────────────
  {
    id: 14,
    name: "Acqua Naturale / Frizzante",
    description: "Woda mineralna niegazowana lub gazowana, 500 ml.",
    price: 10.00,
    category: "Drinks",
    isFeatured: false,
  },
  {
    id: 15,
    name: "Limonata Artigianale",
    description: "Świeżo wyciśnięte cytryny z Amalfi, woda gazowana, szczypta soli morskiej.",
    price: 10.00,
    category: "Drinks",
    isFeatured: false,
  },
  {
    id: 16,
    name: "Espresso",
    description: "Mieszanka single origin. Krótkie i intensywne.",
    price: 10.00,
    category: "Drinks",
    isFeatured: false,
  },
  {
     id:17,
     name:"Cappuccino",
     description: "Intensywny smak kawy, puszysta mleczna pianka. Szybkie wyraziste pobudzenie."
     price: 12.00,
     category: "Drinks",
     isFeatured: false,
  },
  {
    id: 18,
    name: "Birra Artigianale",
    description: "Zmieniający się wybór włoskich piw rzemieślniczych. Zapytaj o aktualne piwo z kranu.",
    price: 20.00,
    category: "Drinks",
    isFeatured: false,
  },

];
