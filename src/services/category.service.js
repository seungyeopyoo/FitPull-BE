import * as categoryRepo from "../repositories/category.repository.js";
import CustomError from "../utils/customError.js";
import messages from "../constants/messages.js";

export const getCategories = async () => {
	const categories = await categoryRepo.findAll();
	return categories.map(category => ({
		id: category.id,
		name: category.name,
		description: category.description
	}));
};

export const createCategory = async (name, description) => {
	// 중복 체크
	const exists = await categoryRepo.findByName(name);
	if (exists) {
		throw new CustomError(409, "CATEGORY_ALREADY_EXISTS", messages.CATEGORY_ALREADY_EXISTS.replace("{name}", name));
	}
	const category = await categoryRepo.create(name, description);
	return {
		message: messages.CATEGORY_CREATED.replace("{name}", category.name),
		category: {
			id: category.id,
			name: category.name,
			description: category.description,
		}
	};
};

export const updateCategory = async (id, name, description) => {
	try {
		const category = await categoryRepo.update(id, name, description);
		const { id: categoryId, name: categoryName, description: desc } = category;
		return {
			message: messages.CATEGORY_UPDATED.replace("{name}", categoryName),
			category: { id: categoryId, name: categoryName, description: desc }
		};
	} catch (err) {
		if (err.code === "P2025") {
			throw new CustomError(404, "CATEGORY_NOT_FOUND", messages.CATEGORY_NOT_FOUND);
		}
		throw err;
	}
};

export const deleteCategory = async (id) => {
	try {
		//삭제할 카테고리 정보 조회
		const category = await categoryRepo.findById(id);
		if (!category) {
			throw new CustomError(404, "CATEGORY_NOT_FOUND", messages.CATEGORY_NOT_FOUND);
		}

		//'기타' 카테고리 id 조회
		const etcCategory = await categoryRepo.findByName("기타");
		if (!etcCategory) {
			throw new CustomError(404, "ETC_CATEGORY_NOT_FOUND", messages.ETC_CATEGORY_NOT_FOUND);
		}

		//해당 카테고리에 속한 상품들 모두 '기타'로 이동
		await categoryRepo.moveProductsToCategory(id, etcCategory.id);

		await categoryRepo.remove(id);

		return {
			message: messages.CATEGORY_DELETED.replace("{name}", category.name)
		};
	} catch (err) {
		if (err.code === "P2025") {
			throw new CustomError(404, "CATEGORY_NOT_FOUND", messages.CATEGORY_NOT_FOUND);
		}
		throw err;
	}
};

export const getCategoryDetail = async (id) => {
	const category = await categoryRepo.findByIdWithProducts(id);
	if (!category) {
		throw new CustomError(404, "CATEGORY_NOT_FOUND", messages.CATEGORY_NOT_FOUND);
	}
	// products 필드만 따로 분리
	const { products, ...categoryInfo } = category;
	return {
		message: messages.CATEGORY_DETAIL_LISTED.replace("{name}", category.name),
		category: {
			id: category.id,
			name: category.name,
			description: category.description,
		},	
		products: products.map(product => ({
			id: product.id,
			title: product.title,
			price: product.price,
			imageUrl: product.imageUrls?.[0] ?? null,
			status: product.status,
		})),
	};
};
