import prisma from "../data-source.js";

// 상품 생성
export const createProduct = async (data, ownerId) => {
	if (!ownerId) {
		throw new Error("상품 소유자 ID가 필요합니다.");
	}

	const { categoryId, ...restData } = data;
	
	return await prisma.product.create({
		data: {
			...restData,
			ownerId,
			categoryId
		}
	});
};

// 승인된 상품 목록조회 // 페이징 + 카테고리 필터
export const getAllProducts = async ({ skip = 0, take = 10, categoryId }) => {
	const where = {
		status: "APPROVED",
		deletedAt: null,
		...(categoryId && { categoryId }),
	};

	const [products, total] = await Promise.all([
		prisma.product.findMany({
			where,
			skip,
			take,
			include: {
				owner: true,
				category: true,
			},
		}),
		prisma.product.count({ where }), // 총 개수 집계
	]);

	return { products, total };
};

// 단일 상품 상세
export const getProductById = async (id) => {
	return await prisma.product.findFirst({
		where: { id, deletedAt: null },
		include: {
			owner: true,
			category: true,
		},
	});
};

// 특정 유저가 등록한 모든 상품
export const getProductsByUser = async (ownerId) => {
	return await prisma.product.findMany({
		where: { ownerId, deletedAt: null },
		include: {
			category: true,
		},
	});
};

export const findCategoryById = (id) => {
	return prisma.category.findUnique({ where: { id } });
};

export const findEtcCategoryId = async () => {
	const category = await prisma.category.findFirst({
		where: { name: "기타" },
	});
	if (!category) throw new Error("'기타' 카테고리가 존재하지 않습니다."); // 이거터지면 아무카테고리도 없다는말 기타는 나중에 seeding으로 심고 DB리셋시 손으로 기타 심자
	return category.id;
};

export const updateProduct = async (id, productData, user) => {
	const product = await getProductById(id);
	if (!product) throw new Error("상품을 찾을 수 없습니다.");

	return await prisma.product.update({
		where: { id },
		data: productData,
		include: {
			owner: true,
			category: true,
		},
	});
};

export const deleteProduct = async (id, user) => {
	const product = await getProductById(id);
	if (!product) throw new Error("상품을 찾을 수 없습니다.");

	return await prisma.product.update({
		where: { id },
		data: {
			deletedAt: new Date(),
		},
	});
};
