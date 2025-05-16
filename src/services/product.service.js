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

export const createProduct = async (productData, user) => {
	if (!user || !user.id) {
		throw new Error("인증된 사용자만 상품을 등록할 수 있습니다.");
	}

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

	return await createProductRepo(
		{
			title: productData.title,
			description: productData.description,
			price: productData.price,
			imageUrls: productData.imageUrls || [],
			allowPurchase: productData.allowPurchase || false,
			categoryId,
			status: "PENDING", // admin 승인 전까지는 PENDING 상태
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
		.filter((product) => product.status === "APPROVED")
		.map((product) => ({
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

export const updateProduct = async (id, productData, user) => {
	const product = await getProductByIdRepo(id);

	if (!product) {
		throw new Error("상품을 찾을 수 없습니다.");
	}

	// 본인 상품이거나 admin인 경우에만 수정 가능
	if (product.ownerId !== user.id && user.role !== "ADMIN") {
		throw new Error("상품을 수정할 권한이 없습니다.");
	}

	if (productData.price && productData.price < 0) {
		throw new Error("가격은 0보다 커야 합니다.");
	}

	let categoryId = productData.categoryId;

	// categoryId가 변경되었고, 잘못된 경우 → '기타' 카테고리 id로 대체
	if (categoryId && categoryId !== product.categoryId) {
		const categoryExists = await findCategoryById(categoryId);
		if (!categoryExists) {
			categoryId = await findEtcCategoryId();
		}
	}

	return await updateProductRepo(id, {
		...productData,
		...(categoryId && { categoryId }),
	});
};

export const deleteProduct = async (id, user) => {
	const product = await getProductByIdRepo(id);

	if (!product) {
		throw new Error("상품을 찾을 수 없습니다.");
	}

	// 본인 상품이거나 admin인 경우에만 삭제 가능
	if (product.ownerId !== user.id && user.role !== "ADMIN") {
		throw new Error("상품을 삭제할 권한이 없습니다.");
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
		category: { name: product.category?.name ?? "기타" },
		owner: {
			id: product.owner?.id,
			name: product.owner?.name,
			phone: product.owner?.phone,
		},
		createdAt: product.createdAt,
	}));
};

export const approveProduct = async (id) => {
	return await updateProductStatusRepo(id, "APPROVED");
};

export const rejectProduct = async (id) => {
	return await updateProductStatusRepo(id, "REJECTED");
};
