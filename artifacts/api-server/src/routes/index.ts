import { Router, type IRouter } from "express";
import healthRouter from "./health";
import menuRouter from "./menu";
import ordersRouter from "./orders";
import contactRouter from "./contact";
import galleryRouter from "./gallery";

const router: IRouter = Router();

router.use(healthRouter);
router.use(menuRouter);
router.use(ordersRouter);
router.use(contactRouter);
router.use(galleryRouter);

export default router;
