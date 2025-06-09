import express from "express";
import {
	getCategoriesController,
	createCategoryController,
	updateCategoryController,
	deleteCategoryController,
	getCategoryDetailController,
} from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { adminOnly } from "../middlewares/adminOnly.js";

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: 카테고리 관련 API
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: 모든 카테고리 조회
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: 카테고리 목록 반환
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: 카테고리 생성 (admin 전용)
 *     tags: [Category]
 *     responses:
 *       201:
 *         description: 카테고리 생성 완료
 */

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: 카테고리 수정 (admin 전용)
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 카테고리 ID
 *     responses:
 *       200:
 *         description: 카테고리 수정 완료
 */

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: 카테고리 삭제 (admin 전용)
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 카테고리 ID
 *     responses:
 *       200:
 *         description: 카테고리 삭제 완료
 */

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: 카테고리 상세 조회 (상품 포함)
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 카테고리 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 카테고리 상세 정보 및 상품 목록 반환
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
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       404:
 *         description: 카테고리 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const router = express.Router();
//카테고리 조회
router.get("/", getCategoriesController);
//카테고리 생성
router.post("/", authenticate, adminOnly, createCategoryController);
//카테고리 수정
router.patch("/:id", authenticate, adminOnly, updateCategoryController);
//카테고리 삭제
router.delete("/:id", authenticate, adminOnly, deleteCategoryController);
//카테고리 상세 조회
router.get("/:id", getCategoryDetailController);

export default router;
