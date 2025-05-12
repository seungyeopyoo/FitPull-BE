import express from "express";
import {
	createProductController,
	getAllProductsController,
	getProductByIdController,
	getProductsByUserController,
} from "../controllers/product.controller.js";

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
