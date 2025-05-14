import {
	createProduct as createProductRepo,
	getAllProducts as getAllProductsRepo,
	getProductById as getProductByIdRepo,
	getProductsByUser as getProductsByUserRepo,
	findEtcCategoryId,
	findCategoryById,
} from "../repositories/product.repository.js";

export const createProduct = async (productData) => {
	if (productData.price < 0) {
		throw new Error("가격은 0보다 커야 합니다.");
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

	return await createProductRepo({
		...productData,
		categoryId,
		status: "PENDING",
	});
};

export const getAllProducts = async ({ skip, take, categoryId } = {}) => {
	const { products, total } = await getAllProductsRepo({
		skip,
		take,
		categoryId,
	});

	const listedProducts = products.map((product) => ({
		id: product.id,
		title: product.title,
		price: product.price,
		imageUrl: product.imageUrls?.[0] ?? null,
		category: { name: product.category?.name ?? "기타" },
	}));

	return { products: listedProducts, total };
};

export const getProductById = async (id) => {
	const product = await getProductByIdRepo(id);

	if (!product || product.status !== "APPROVED") {
		throw new Error("상품을 찾을 수 없습니다.");
	}
	// 상품 존재 여부 확인
	if (!product) {
		throw new Error("상품을 찾을 수 없습니다.");
	}

	return {
		title: product.title,
		description: product.description,
		price: product.price,
		allowPurchase: product.allowPurchase,
		imageUrls: product.imageUrls,
		category: { name: product.category?.name ?? "기타" },
	};
};

export const getProductsByUser = async (ownerId) => {
	const products = await getProductsByUserRepo(ownerId);

	const listedProducts = products.map((product) => ({
		title: product.title,
		price: product.price,
		status: product.status,
		imageUrl: product.imageUrls?.[0] ?? null,
		category: { name: product.category?.name ?? "기타" },
		createdAt: product.createdAt,
		updatedAt: product.updatedAt,
	}));

	return listedProducts;
};
