import {
	createProduct as createProductRepo,
	getAllProducts as getAllProductsRepo,
	getProductById as getProductByIdRepo,
	getProductsByUser as getProductsByUserRepo,
} from "../repositories/product.repository.js";

export const createProduct = async (productData) => {
	// 가격 음수 방지
	if (productData.price < 0) {
		throw new Error("가격은 0보다 커야 합니다.");
	}

	return await createProductRepo({
		...productData,
		status: "PENDING", // 초기 등록 상태는 '대기중'
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
