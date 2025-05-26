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
import { success } from "../utils/responseHandler.js";

export const createProductController = async (req, res, next) => {
	try {
		const product = await createProduct(req.body, req.user);
		return success(res, SUCCESS_MESSAGES.PRODUCT_CREATED, product);
	} catch (error) {
		console.error("상품 등록 에러:", error);
		next(error);
	}
};

export const getAllProductsController = async (req, res, next) => {
	try {
		const { skip, take, categoryId } = req.query;
		const products = await getAllProducts({
			skip: skip ? Number(skip) : undefined,
			take: take ? Number(take) : undefined,
			categoryId,
		});
		return success(res, SUCCESS_MESSAGES.PRODUCT_LISTED, products);
	} catch (error) {
		console.error("상품 조회 에러:", error);
		next(error);
	}
};

export const getProductByIdController = async (req, res, next) => {
	try {
		const product = await getProductById(req.params.id);
		return success(res, SUCCESS_MESSAGES.PRODUCT_DETAIL, product);
	} catch (error) {
		if (error.code === "PRODUCT_NOT_FOUND") {
			return next(error);
		}
		console.error("상품 상세조회 에러:", error);
		next(error);
	}
};

export const getProductsMeController = async (req, res, next) => {
	try {
		if (!req.user || !req.user.id) {
			return next(new CustomError(401, "AUTH_REQUIRED", ERROR_MESSAGES.AUTH_REQUIRED));
		}
		const products = await getProductsByUser(req.user.id);
		if (!products || products.length === 0) {
			return next(new CustomError(404, "PRODUCT_NOT_FOUND", ERROR_MESSAGES.PRODUCT_NOT_FOUND));
		}
		return success(res, SUCCESS_MESSAGES.PRODUCT_LISTED, { products });
	} catch (error) {
		console.error("내 상품 목록 조회 에러:", error);
		next(error);
	}
};

export const updateProductController = async (req, res, next) => {
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
		return success(res, SUCCESS_MESSAGES.PRODUCT_UPDATED, { product: updatedProduct });
	} catch (error) {
		console.error("상품 수정 에러:", error);
		next(error);
	}
};

export const deleteProductController = async (req, res, next) => {
	try {
		const { id } = req.params;
		const user = req.user;

		await deleteProduct(id, user);
		return success(res, SUCCESS_MESSAGES.PRODUCT_DELETED);
	} catch (error) {
		next(error);
	}
};

export const getWaitingProductsController = async (_req, res, next) => {
	try {
		const products = await getWaitingProducts();
		return success(res, SUCCESS_MESSAGES.PRODUCT_WAITING_LISTED, { products });
	} catch (error) {
		console.error("대기 상품 조회 에러:", error);
		next(error);
	}
};

export const approveProductController = async (req, res, next) => {
	try {
		const result = await approveProduct(req.params.id);
		return success(res, SUCCESS_MESSAGES.PRODUCT_APPROVED, result);
	} catch (error) {
		console.error("상품 승인 에러:", error);
		next(error);
	}
};

export const rejectProductController = async (req, res, next) => {
	try {
		const result = await rejectProduct(req.params.id);
		return success(res, SUCCESS_MESSAGES.PRODUCT_REJECTED, result);
	} catch (error) {
		console.error("상품 거절 에러:", error);
		next(error);
	}
};
