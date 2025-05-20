import {
	createProduct,
	getAllProducts,
	getProductById,
	getProductsByUser,
	updateProduct,
	deleteProduct,
	getWaitingProducts,
	approveProduct,
	rejectProduct,
} from "../services/product.service.js";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants/messages.js";

export const createProductController = async (req, res) => {
	try {
		const product = await createProduct(req.body, req.user);
		res.status(201).json({ message: SUCCESS_MESSAGES.PRODUCT_CREATED, product });
	} catch (error) {
		console.error("상품 등록 에러:", error);
		res.status(400).json({ message: error.message });
	}
};

export const getAllProductsController = async (_req, res) => {
	try {
		const products = await getAllProducts();
		res.status(200).json(products);
	} catch (error) {
		console.error("상품 조회 에러:", error);
		res.status(500).json({ message: "상품 조회 중 오류 발생" });
	}
};

export const getProductByIdController = async (req, res) => {
	try {
		const product = await getProductById(req.params.id);
		if (!product)
			return res.status(404).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
		res.json(product);
	} catch (error) {
		if (error.message === ERROR_MESSAGES.PRODUCT_NOT_FOUND) {
			return res.status(404).json({ message: error.message });
		}
		console.error("상품 상세조회 에러:", error);
		res.status(500).json({ message: "상품 상세조회 중 오류 발생" });
	}
};

export const getProductsMeController = async (req, res) => {
	try {
		if (!req.user || !req.user.id) {
			return res.status(401).json({ message: ERROR_MESSAGES.AUTH_REQUIRED });
		}
		const products = await getProductsByUser(req.user.id);
		if (!products || products.length === 0) {
			return res.status(404).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
		}
		res.json(products);
	} catch (error) {
		console.error("내 상품 목록 조회 에러:", error);
		res.status(500).json({ message: "내 상품 목록 조회 중 오류 발생" });
	}
};

export const updateProductController = async (req, res) => {
	try {
		const { id } = req.params;
		const productData = req.body;
		const user = req.user;

		// 이미지가 업로드된 경우, imageUrls 추가
		if (req.files && Array.isArray(req.files)) {
			productData.imageUrls = [...(productData.imageUrls || []), ...req.files.map(file => file.location)];
		}
		// undefined/null 제거
		if (productData.imageUrls) {
			productData.imageUrls = productData.imageUrls.filter(Boolean);
		}

		// categoryId 빈 문자열 처리
		if (productData.categoryId === "") {
			productData.categoryId = undefined;
		}

		const updatedProduct = await updateProduct(id, productData, user);
		res.json({ message: SUCCESS_MESSAGES.PRODUCT_UPDATED, product: updatedProduct });
	} catch (error) {
		console.error("상품 수정 에러:", error);
		res.status(400).json({ message: error.message });
	}
};

export const deleteProductController = async (req, res) => {
	try {
		const { id } = req.params;
		const user = req.user;

		await deleteProduct(id, user);
		res.json({ message: SUCCESS_MESSAGES.PRODUCT_DELETED });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const getWaitingProductsController = async (_req, res) => {
	try {
		const products = await getWaitingProducts();
		res.json(products);
	} catch (error) {
		console.error("대기 상품 조회 에러:", error);
		res.status(500).json({ message: "대기 상품 조회 중 오류 발생" });
	}
};

export const approveProductController = async (req, res) => {
	try {
		const result = await approveProduct(req.params.id);
		res.json({ message: SUCCESS_MESSAGES.PRODUCT_APPROVED, result });
	} catch (error) {
		console.error("상품 승인 에러:", error);
		res.status(400).json({ message: error.message });
	}
};

export const rejectProductController = async (req, res) => {
	try {
		const result = await rejectProduct(req.params.id);
		res.json({ message: SUCCESS_MESSAGES.PRODUCT_REJECTED, result });
	} catch (error) {
		console.error("상품 거절 에러:", error);
		res.status(400).json({ message: error.message });
	}
};
