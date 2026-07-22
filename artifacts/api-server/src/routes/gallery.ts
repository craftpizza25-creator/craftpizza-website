import { Router, type IRouter } from "express";
import { db, galleryItemsTable } from "@workspace/db";
import { GetGalleryItemsResponse } from "@workspace/api-zod";
import { isNotNull } from "drizzle-orm";

const router: IRouter = Router();

router.get("/gallery", async (_req, res): Promise<void> => {
  const items = await db
    .select()
    .from(galleryItemsTable)
    .where(isNotNull(galleryItemsTable.imageUrl));
  res.json(GetGalleryItemsResponse.parse(items));
});

export default router;
