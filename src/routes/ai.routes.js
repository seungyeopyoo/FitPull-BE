import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { adminOnly } from "../middlewares/adminOnly.js";
import { requestAiPriceEstimationController, summarizeReviewsController } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/price-estimation/:productId", authenticate, adminOnly, requestAiPriceEstimationController);

router.post("/summary/:productId", summarizeReviewsController);

export default router;