import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import translateRouter from "./translate";
import telegramRouter from "./telegram";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(translateRouter);
router.use("/telegram", telegramRouter);

export default router;
