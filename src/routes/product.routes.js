import express from "express";
import {
	createProductController,
	getAllProductsController,
	getProductByIdController,
	getProductsMeController,
	updateProductController,
	deleteProductController,
	getWaitingProductsController,
	approveProductController,
	rejectProductController,
} from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { adminOnly } from "../middlewares/adminOnly.js";
import { s3ImageUpload } from "../middlewares/s3ImageUpload.js";

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: 상품 등록 / 조회 API
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: 상품 등록 (이미지 업로드 지원)
 *     tags: [Product]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 상품명
 *               description:
 *                 type: string
 *                 description: 상품 설명
 *               price:
 *                 type: number
 *                 description: 가격
 *               categoryId:
 *                 type: string
 *                 description: 카테고리 ID
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 상품 이미지 파일들 (최대 5장)
 *     responses:
 *       201:
 *         description: 상품 등록 성공
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: 전체 상품 조회
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: 상품 목록 반환
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: 상품 상세 조회
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 상품 상세 정보 반환
 */

/**
 * @swagger
 * /products/me:
 *   get:
 *     summary: 내 상품 조회 (로그인한 사용자)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그인한 사용자가 등록한 상품 목록 반환
 *       401:
 *         description: 인증 실패
 */

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: 상품 수정 (이미지 업로드 지원)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 상품 ID
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 상품명
 *               description:
 *                 type: string
 *                 description: 상품 설명
 *               price:
 *                 type: number
 *                 description: 가격
 *               categoryId:
 *                 type: string
 *                 description: 카테고리 ID
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 상품 이미지 파일들 (최대 5장)
 *     responses:
 *       200:
 *         description: 상품 수정 성공
 *       400:
 *         description: 권한 없음 또는 잘못된 요청
 *       404:
 *         description: 상품을 찾을 수 없음
 */

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: 상품 삭제
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 상품 삭제 성공
 *       400:
 *         description: 권한 없음 또는 잘못된 요청
 *       404:
 *         description: 상품을 찾을 수 없음
 */

/**
 * @swagger
 * /products/admin/waiting:
 *   get:
 *     summary: 관리자 전용 대기 상품 조회
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 대기 상품 목록 반환
 *
 * /products/admin/{id}/approve:
 *   patch:
 *     summary: 상품 승인
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 승인 완료
 *
 * /products/admin/{id}/reject:
 *   patch:
 *     summary: 상품 거절
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 거절 완료
 */

const router = express.Router();
//상품등록 (이미지 업로드 및 S3 연동)
router.post(
	"/",
	authenticate,
	...s3ImageUpload,
	createProductController
);
//상품조회전체
router.get("/", getAllProductsController);
//내상품조회
router.get("/me", authenticate, getProductsMeController);
//상품상세조회
router.get("/:id", getProductByIdController);
// 상품 수정
router.patch("/:id", authenticate, s3ImageUpload, updateProductController);
// 상품 삭제
router.delete("/:id", authenticate, deleteProductController);
// 어드민 대기중상품 조회
router.get(
	"/admin/waiting",
	authenticate,
	adminOnly,
	getWaitingProductsController,
);
// 어드민 상품 승인
router.patch(
	"/admin/:id/approve",
	authenticate,
	adminOnly,
	approveProductController,
);
// 어드민 상품 거절
router.patch(
	"/admin/:id/reject",
	authenticate,
	adminOnly,
	rejectProductController,
);
export default router;
