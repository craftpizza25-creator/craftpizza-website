import { Router, type IRouter } from "express";
import healthRouter from "./health";
import menuRouter from "./menu";
import ordersRouter from "./orders";
import contactRouter from "./contact";
import galleryRouter from "./gallery";
import calendarRouter from "./calendar";
import adminCalendarRouter from "./admin-calendar";
import openingHoursRouter from "./opening-hours";
import adminOpeningHoursRouter from "./admin-opening-hours";

const router: IRouter = Router();

router.use(healthRouter);
router.use(menuRouter);
router.use(ordersRouter);
router.use(contactRouter);
router.use(galleryRouter);
router.use(calendarRouter);
router.use(adminCalendarRouter);
router.use(openingHoursRouter);
router.use(adminOpeningHoursRouter);

export default router;
