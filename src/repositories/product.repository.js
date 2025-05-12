import prisma from "../data-source.js";

// 상품 생성
export const createProduct = async (data) => {
	return await prisma.product.create({ data });
};

// 승인된 상품 목록조회 // 페이징 + 카테고리 필터
export const getAllProducts = async ({ skip = 0, take = 10, categoryId }) => {
	const where = {
		status: "APPROVED",
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
	return await prisma.product.findUnique({
		where: { id },
		include: {
			owner: true,
			category: true,
		},
	});
};

// 특정 유저가 등록한 모든 상품
export const getProductsByUser = async (ownerId) => {
	return await prisma.product.findMany({
		where: { ownerId },
		include: {
			category: true,
		},
	});
};
