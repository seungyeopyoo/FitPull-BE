import express from "express";
import { chargeBalanceController, useBalanceController } from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/auth.js";
import requireVerifiedPhone from "../middlewares/requireVerifiedPhone.js";

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: 가상 잔고 충전/차감 API
 */

/**
 * @swagger
 * /payments/charge:
 *   post:
 *     summary: 가상 잔고 충전
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 10000
 *     responses:
 *       200:
 *         description: 충전 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 */

/**
 * @swagger
 * /payments/use:
 *   post:
 *     summary: 가상 잔고 차감
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       200:
 *         description: 차감 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 */

const router = express.Router();

// 잔고 충전
router.post("/charge", authenticate, requireVerifiedPhone, chargeBalanceController);
// 잔고 차감
router.post("/use", authenticate, requireVerifiedPhone, useBalanceController);

export default router; 