import { eq } from "drizzle-orm";
import { db, menuItemsTable } from "@workspace/db";
import { logger } from "./logger";

const MENU_UPDATES = [
  {
    id: 1,
    imageUrl: "menu/margherita.jpg",
    description: "Pomidory San Marzano DOP, mozzarella fior di latte, świeża bazylia, oliwa extra vergine z Sycylii",
  },
  {
    id: 2,
    imageUrl: "menu/diavola.jpg",
    description: "Pomidory San Marzano DOP, mozzarella fior di latte, ostre salami, płatki chilli, oliwa extra vergine",
  },
  {
    id: 4,
    imageUrl: "menu/funghi.jpg",
    description: "Pomidory San Marzano DOP, mozzarella fior di latte, leśne grzyby / pieczarki, oliwa extra vergine",
  },
  {
    id: 6,
    imageUrl: "menu/pancetta.jpg",
    description: "Pomidory San Marzano DOP, mozzarella fior di latte, pancetta arrotolata, czerwona cebula, oliwa extra vergine",
  },
];

export async function seedMenuImages() {
  for (const { id, imageUrl, description } of MENU_UPDATES) {
    await db
      .update(menuItemsTable)
      .set({ imageUrl, description })
      .where(eq(menuItemsTable.id, id));
  }
  logger.info("Menu images and descriptions seeded");
}
