import express from "express";
import {
	createProductController,
	getAllProductsController,
	getProductByIdController,
	getProductsMeController,
	updateProductController,
	deleteProductController,
} from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/auth.js";

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
 *     summary: 상품 등록
 *     tags: [Product]
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
 *     summary: 상품 수정
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 상품 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: string
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

const router = express.Router();
//상품등록
router.post("/", authenticate, createProductController);
//상품조회전체
router.get("/", getAllProductsController);
//내상품조회
router.get("/me", authenticate, getProductsMeController);
//상품상세조회
router.get("/:id", getProductByIdController);
// 상품 수정
router.patch("/:id", authenticate, updateProductController);
// 상품 삭제
router.delete("/:id", authenticate, deleteProductController);

export default router;
