import express from "express";
import {
  createReviewController,
  getReviewsByProductController,
  getReviewByIdController,
  updateReviewController,
  deleteReviewController,
} from "../controllers/reviewController.js";
import { authenticate } from "../middlewares/auth.js";
import { s3ImageUpload } from "../middlewares/s3ImageUpload.js";

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: 리뷰 관련 API
 */

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: 상품별 리뷰 목록 조회
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 리뷰 목록 반환
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: 리뷰 작성 (이미지 업로드 지원, 대여 완료 유저만 가능)
 *     tags: [Review]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 description: 별점(1~5)
 *               comment:
 *                 type: string
 *                 description: 리뷰 텍스트
 *               completedRentalId:
 *                 type: string
 *                 description: 대여완료 ID
 *               productId:
 *                 type: string
 *                 description: 상품 ID
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 리뷰 이미지 파일들 (최대 3장)
 *     responses:
 *       201:
 *         description: 리뷰 작성 완료
 */

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: 리뷰 상세 조회
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 리뷰 ID
 *     responses:
 *       200:
 *         description: 리뷰 상세 반환
 */

/**
 * @swagger
 * /reviews/{id}:
 *   patch:
 *     summary: 리뷰 수정 (이미지 업로드 지원, 본인만 가능, 관리자 예외)
 *     tags: [Review]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 리뷰 ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 description: 별점(1~5)
 *               comment:
 *                 type: string
 *                 description: 리뷰 텍스트
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 리뷰 이미지 파일들 (최대 3장)
 *     responses:
 *       200:
 *         description: 리뷰 수정 완료
 */

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: 리뷰 삭제 (본인 또는 관리자)
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 리뷰 ID
 *     responses:
 *       204:
 *         description: 리뷰 삭제 완료
 */

const router = express.Router();

// 상품별 리뷰 목록 조회
router.get("/product/:productId", getReviewsByProductController);
// 리뷰 작성 
router.post("/", authenticate, s3ImageUpload, createReviewController);
// 리뷰 상세 조회
router.get("/:id", getReviewByIdController);
// 리뷰 수정 
router.patch("/:id", authenticate, s3ImageUpload, updateReviewController);
// 리뷰 삭제 (관리자도 가능)
router.delete("/:id", authenticate, deleteReviewController);

export default router; 