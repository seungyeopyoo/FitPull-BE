import express from "express";
import {
  createStatusLogController,
  getStatusLogsController,
  updateStatusLogController,
  deleteStatusLogController,
} from "../controllers/productStatusLog.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { adminOnly } from "../middlewares/adminOnly.js";
import { s3ImageUpload } from "../middlewares/s3ImageUpload.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ProductStatusLog
 *   description: 상품 상태 로그 관련 API
 */

/**
 * @swagger
 * /products/{productId}/logs:
 *   get:
 *     summary: 상품 상태 로그 조회 (유저/관리자)
 *     tags: [ProductStatusLog]
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
 *         description: 상품 상태 로그 목록 반환
 */

/**
 * @swagger
 * /products/{productId}/logs:
 *   post:
 *     summary: 상품 상태 로그 생성 (관리자 전용, 이미지 업로드)
 *     tags: [ProductStatusLog]
 *     consumes:
 *       - multipart/form-data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - images
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [PRE_RENTAL, ON_RENTAL, DAMAGE_REPORTED, WITHDRAWN, STORAGE_FEE_NOTICE, ETC]
 *               notes:
 *                 type: string
 *               completedRentalId:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: 상태 로그 생성 성공
 */

/**
 * @swagger
 * /products/logs/{id}:
 *   patch:
 *     summary: 상품 상태 로그 수정 (관리자 전용)
 *     tags: [ProductStatusLog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 로그 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [PRE_RENTAL, ON_RENTAL, DAMAGE_REPORTED, WITHDRAWN, STORAGE_FEE_NOTICE, ETC]
 *               photoUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: 상태 로그 수정 성공
 */

/**
 * @swagger
 * /products/logs/{id}:
 *   delete:
 *     summary: 상품 상태 로그 삭제 (관리자 전용)
 *     tags: [ProductStatusLog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 로그 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 상태 로그 삭제 성공
 */

router.get("/:productId/logs", authenticate, getStatusLogsController);
router.post(
  "/:productId/logs",
  authenticate,
  adminOnly,
  ...s3ImageUpload,
  createStatusLogController
);
router.patch("/logs/:id", authenticate, adminOnly, updateStatusLogController);
router.delete("/logs/:id", authenticate, adminOnly, deleteStatusLogController);

export default router;
