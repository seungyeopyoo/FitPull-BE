import express from "express";
import {
	createProductController,
	getAllProductsController,
	getProductByIdController,
	getProductsByUserController,
} from "../controllers/product.controller.js";

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
 * /products/my/{userId}:
 *   get:
 *     summary: 내가 등록한 상품 조회
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: 유저 ID
 *     responses:
 *       200:
 *         description: 내 상품 리스트 반환
 */

const router = express.Router();
//상품등록
router.post("/", createProductController);
//상품조회전체
router.get("/", getAllProductsController);
//상품상세조회
router.get("/:id", getProductByIdController);
//내상품조회
router.get("/my/:userId", getProductsByUserController);

export default router;
