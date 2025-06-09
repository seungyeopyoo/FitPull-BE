import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { adminOnly } from "../middlewares/adminOnly.js";
import { requestAiPriceEstimationController, summarizeReviewsController, recommendProductsController } from "../controllers/ai.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI 기능 관련 API
 */
/**
 * @swagger
 * /ai/price-estimation/{productId}:
 *   post:
 *     summary: 상품 AI 적정가 분석 (관리자 전용)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: AI 적정가 분석 결과 반환
 */
/**
 * @swagger
 * /ai/summary/{productId}:
 *   post:
 *     summary: 상품 리뷰 요약
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 리뷰 요약 결과 반환
 */


/**
 * @swagger
 * /ai/recommend:
 *   post:
 *     summary: 상품 추천
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: 추천 키워드 또는 요청
 *     responses:
 *       200:
 *         description: 추천 상품 목록 및 추천 사유 반환
 */
// 적정가 분석
router.post("/price-estimation/:productId", authenticate, adminOnly, requestAiPriceEstimationController);

// 리뷰 요약
router.post("/summary/:productId", summarizeReviewsController);

// 상품 추천
router.post("/recommend", recommendProductsController);

export default router;