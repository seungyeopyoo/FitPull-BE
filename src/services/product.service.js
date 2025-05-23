import {
	createProduct as createProductRepo,
	getAllProducts as getAllProductsRepo,
	getProductById as getProductByIdRepo,
	getProductsByUser as getProductsByUserRepo,
	updateProduct as updateProductRepo,
	deleteProduct as deleteProductRepo,
	findWaitingProducts as findWaitingProductsRepo,
	updateProductStatus as updateProductStatusRepo,
	findEtcCategoryId,
	findCategoryById,
} from "../repositories/product.repository.js";
import { deleteFromS3 } from "../utils/s3.js";
import { DEFAULT_CATEGORY_NAME } from "../constants/category.js";
import { PRODUCT_STATUS } from "../constants/status.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import { findActiveRentalByProductId, findActiveRentalForDelete } from "../repositories/rentalRequest.repository.js";

export const createProduct = async (productData, user) => {
	if (!user || !user.id) {
		throw new Error(ERROR_MESSAGES.AUTH_REQUIRED);
	}

	if (productData.price < 0) {
		throw new Error(ERROR_MESSAGES.INVALID_PRICE);
	}

	let categoryId = productData.categoryId;

	// categoryId가 없거나 잘못된 경우 → '기타' 카테고리 id로 대체
	if (!categoryId) {
		categoryId = await findEtcCategoryId();
	} else {
		const categoryExists = await findCategoryById(categoryId);
		if (!categoryExists) {
			categoryId = await findEtcCategoryId();
		}
	}

	const product = await createProductRepo(
		{
			title: productData.title,
			description: productData.description,
			price: Number(productData.price),
			imageUrls: productData.imageUrls || [],
			allowPurchase: productData.allowPurchase || false,
			categoryId,
			status: PRODUCT_STATUS.PENDING,
		},
		user.id,
	);

	const category = await findCategoryById(product.categoryId);

	return {
		product: {
			id: product.id,
			title: product.title,
			description: product.description,
			price: product.price,
			status: product.status,
			imageUrls: product.imageUrls,
			allowPurchase: product.allowPurchase,
			category: { name: category?.name ?? DEFAULT_CATEGORY_NAME },
		},
	};
};

export const getAllProducts = async ({ skip, take, categoryId } = {}) => {
	const { products, total } = await getAllProductsRepo({
		skip,
		take,
		categoryId,
	});

	// PENDING 상태의 상품은 제외하고 반환
	const listedProducts = products
		.filter((product) => product.status === PRODUCT_STATUS.APPROVED)
		.map((product) => ({
			id: product.id,
			title: product.title,
			price: product.price,
			imageUrl: product.imageUrls?.[0] ?? null,
			category: { name: product.category?.name ?? DEFAULT_CATEGORY_NAME },
		}));

	return { products: listedProducts, total };
};

export const getProductById = async (id) => {
	const product = await getProductByIdRepo(id);

	if (!product || product.status !== PRODUCT_STATUS.APPROVED) {
		throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
	}

	return {
		title: product.title,
		description: product.description,
		price: product.price,
		allowPurchase: product.allowPurchase,
		imageUrls: product.imageUrls,
		category: { name: product.category?.name ?? DEFAULT_CATEGORY_NAME },
	};
};

export const getProductsByUser = async (ownerId) => {
	const products = await getProductsByUserRepo(ownerId);

	const listedProducts = products.map((product) => ({
		id: product.id,
		title: product.title,
		price: product.price,
		status: product.status,
		imageUrl: product.imageUrls?.[0] ?? null,
		category: { name: product.category?.name ?? DEFAULT_CATEGORY_NAME },
	}));

	return listedProducts;
};

export const updateProduct = async (id, productData, user) => {
	const product = await getProductByIdRepo(id);

	if (!product) {
		throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
	}

	// 본인 상품이거나 관리자만 수정 가능
	if (product.ownerId !== user.id && user.role !== "ADMIN") {
		throw new Error(ERROR_MESSAGES.NO_PERMISSION);
	}

	// 대여중이면 수정 불가
	const rentalActive = await findActiveRentalByProductId(id);

	if (rentalActive) {
		throw new Error("현재 대여중인 상품은 수정할 수 없습니다.");
	}

	// 상품 상태에 따라 수정 제한
	if (user.role !== "ADMIN") {
		// 일반 유저는 상태값 못 바꿈
		delete productData.status;

		// 거절되거나 취소된 상품은 수정 불가
		if (["REJECTED", "CANCELED"].includes(product.status)) {
			throw new Error("거절되었거나 취소된 상품은 수정할 수 없습니다.");
		}

		// 승인된 상품은 다시 승인 대기로 전환
		if (product.status === "APPROVED") {
			productData.status = "PENDING";
		}
	}

	// price 검증
	if (productData.price !== undefined) {
		productData.price = Number(productData.price);
		if (productData.price < 0) {
			throw new Error(ERROR_MESSAGES.INVALID_PRICE);
		}
	}

	let categoryId = productData.categoryId;

	if (categoryId && categoryId !== product.categoryId) {
		const categoryExists = await findCategoryById(categoryId);
		if (!categoryExists) {
			categoryId = await findEtcCategoryId();
		}
	}

	// 이미지 변경 처리 (기존 이미지 정리)
	if (productData.imageUrls && Array.isArray(productData.imageUrls)) {
		const imagesToDelete = product.imageUrls.filter(
			(oldUrl) => !productData.imageUrls.includes(oldUrl)
		);
		await Promise.all(imagesToDelete.map(deleteFromS3));
	}

	const updated = await updateProductRepo(id, {
		...productData,
		...(categoryId && { categoryId }),
	});

	const category = await findCategoryById(updated.categoryId);

	return {
		id: updated.id,
		title: updated.title,
		description: updated.description,
		price: updated.price,
		imageUrls: updated.imageUrls,
		status: updated.status,
		allowPurchase: updated.allowPurchase,
		category: { name: category?.name ?? DEFAULT_CATEGORY_NAME },
	};
};

export const deleteProduct = async (id, user) => {
	const product = await getProductByIdRepo(id);

	if (!product) {
		throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
	}

	if (product.ownerId !== user.id && user.role !== "ADMIN") {
		throw new Error(ERROR_MESSAGES.NO_PERMISSION);
	}
	const now = new Date();
	const oneMonthLater = new Date();
	oneMonthLater.setDate(now.getDate() + 30);
	
	// 예약되었거나 대여중이면 삭제 금지
	const activeRental = await findActiveRentalForDelete(id, oneMonthLater);

	if (activeRental) {
		throw new Error("예약 중이거나 대여 중인 상품은 삭제할 수 없습니다.");
	}

	// 이미지 삭제
	if (product.imageUrls && Array.isArray(product.imageUrls)) {
		await Promise.all(product.imageUrls.map(deleteFromS3));
	}

	return await deleteProductRepo(id);
};


export const getWaitingProducts = async () => {
	const products = await findWaitingProductsRepo();

	return products.map((product) => ({
		id: product.id,
		title: product.title,
		price: product.price,
		status: product.status,
		imageUrl: product.imageUrls?.[0] ?? null,
		category: { name: product.category?.name ?? DEFAULT_CATEGORY_NAME },
		owner: {
			id: product.owner?.id,
			name: product.owner?.name,
			phone: product.owner?.phone,
		},
		createdAt: product.createdAt,
	}));
};

export const approveProduct = async (id) => {
	const product = await updateProductStatusRepo(id);

	return {
		message: PRODUCT_STATUS.APPROVED,
		id: product.id,
		title: product.title,
		price: product.price,
		status: product.status,
		imageUrl: product.imageUrls?.[0] ?? null,
		category: { name: product.category?.name ?? DEFAULT_CATEGORY_NAME },
		owner: {
			id: product.owner?.id,
			name: product.owner?.name,
			phone: product.owner?.phone,
		},
		createdAt: product.createdAt,
	};
};

export const rejectProduct = async (id) => {
	const product = await updateProductStatusRepo(id);

	return {
		message: PRODUCT_STATUS.REJECTED,
		id: product.id,
		title: product.title,
		price: product.price,
		status: product.status,
		imageUrl: product.imageUrls?.[0] ?? null,
		category: { name: product.category?.name ?? DEFAULT_CATEGORY_NAME },
		owner: {
			id: product.owner?.id,
			name: product.owner?.name,
			phone: product.owner?.phone,
		},
		createdAt: product.createdAt,
	};
};
