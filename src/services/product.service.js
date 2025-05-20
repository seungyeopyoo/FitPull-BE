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

	return await createProductRepo(
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
		title: product.title,
		price: product.price,
		status: product.status,
		imageUrl: product.imageUrls?.[0] ?? null,
		category: { name: product.category?.name ?? DEFAULT_CATEGORY_NAME },
		createdAt: product.createdAt,
		updatedAt: product.updatedAt,
	}));

	return listedProducts;
};

export const updateProduct = async (id, productData, user) => {
	const product = await getProductByIdRepo(id);

	if (!product) {
		throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
	}

	// 본인 상품이거나 admin인 경우에만 수정 가능
	if (product.ownerId !== user.id && user.role !== "ADMIN") {
		throw new Error(ERROR_MESSAGES.NO_PERMISSION);
	}

	// price가 존재하면 항상 Number로 변환
	if (productData.price !== undefined) {
		productData.price = Number(productData.price);
		if (productData.price < 0) {
			throw new Error(ERROR_MESSAGES.INVALID_PRICE);
		}
	}

	let categoryId = productData.categoryId;

	// categoryId가 변경되었고, 잘못된 경우 → '기타' 카테고리 id로 대체
	if (categoryId && categoryId !== product.categoryId) {
		const categoryExists = await findCategoryById(categoryId);
		if (!categoryExists) {
			categoryId = await findEtcCategoryId();
		}
	}

	// 이미지 URL이 변경된 경우, 기존 이미지 삭제
	if (productData.imageUrls && Array.isArray(productData.imageUrls)) {
		// 기존 이미지 중 새 이미지 목록에 없는 것들을 삭제
		const imagesToDelete = product.imageUrls.filter(
			(oldUrl) => !productData.imageUrls.includes(oldUrl)
		);
		
		// S3에서 사용하지 않는 이미지 삭제
		await Promise.all(
			imagesToDelete.map((imageUrl) => deleteFromS3(imageUrl))
		);
	}

	const updated = await updateProductRepo(id, {
		...productData,
		...(categoryId && { categoryId }),
	});

	return {
		id: updated.id,
		title: updated.title,
		description: updated.description,
		price: updated.price,
		imageUrls: updated.imageUrls,
		status: updated.status,
		allowPurchase: updated.allowPurchase,
		createdAt: updated.createdAt,
		updatedAt: updated.updatedAt,
		categoryId: updated.categoryId,
	};
};

export const deleteProduct = async (id, user) => {
	const product = await getProductByIdRepo(id);

	if (!product) {
		throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
	}

	// 본인 상품이거나 admin인 경우에만 삭제 가능
	if (product.ownerId !== user.id && user.role !== "ADMIN") {
		throw new Error(ERROR_MESSAGES.NO_PERMISSION);
	}

	// S3에서 모든 이미지 삭제
	if (product.imageUrls && Array.isArray(product.imageUrls)) {
		await Promise.all(
			product.imageUrls.map((imageUrl) => deleteFromS3(imageUrl))
		);
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
	return await updateProductStatusRepo(id, PRODUCT_STATUS.APPROVED);
};

export const rejectProduct = async (id) => {
	return await updateProductStatusRepo(id, PRODUCT_STATUS.REJECTED);
};
