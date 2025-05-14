import express from "express";
import {
	getCategoriesController,
	createCategoryController,
	updateCategoryController,
	deleteCategoryController,
} from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { adminOnly } from "../middlewares/adminOnly.js";

const router = express.Router();
//카테고리 조회
router.get("/", getCategoriesController);
//카테고리 생성
router.post("/", authenticate, adminOnly, createCategoryController);
//카테고리 수정
router.patch("/:id", authenticate, adminOnly, updateCategoryController);
//카테고리 삭제
router.delete("/:id", authenticate, adminOnly, deleteCategoryController);

export default router;
