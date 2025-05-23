import * as categoryRepo from "../repositories/category.repository.js";

export const getCategories = async () => {
	const categories = await categoryRepo.findAll();
	return categories.map(category => ({
		id: category.id,
		name: category.name,
		description: category.description,
		products: (category.products || []).map(product => ({
			id: product.id,
			title: product.title,
			price: product.price,
			imageUrl: product.imageUrls?.[0] ?? null,
			status: product.status,
		})),
	}));
};

export const createCategory = async (name) => {
	const category = await categoryRepo.create(name);
	const { id, name: categoryName, description } = category;
	return {
		message: `카테고리 "${categoryName}" 가 등록되었습니다.`,
		category: { id, name: categoryName, description }
	};
};

export const updateCategory = async (id, name, description) => {
	try {
		const category = await categoryRepo.update(id, name, description);
		const { id: categoryId, name: categoryName, description: desc } = category;
		return {
			message: `카테고리 "${categoryName}" 가 수정되었습니다.`,
			category: { id: categoryId, name: categoryName, description: desc }
		};
	} catch (err) {
		if (err.code === "P2025") {
			const error = new Error("존재하지 않는 카테고리입니다.");
			error.status = 404;
			throw error;
		}
		throw err;
	}
};

export const deleteCategory = async (id) => {
	try {
		//삭제할 카테고리 정보 조회
		const category = await categoryRepo.findById(id);
		if (!category) {
			const error = new Error("존재하지 않는 카테고리입니다.");
			error.status = 404;
			throw error;
		}

		//'기타' 카테고리 id 조회
		const etcCategory = await categoryRepo.findByName("기타");
		if (!etcCategory) {
			throw new Error("'기타' 카테고리가 존재하지 않습니다.");
		}

		//해당 카테고리에 속한 상품들 모두 '기타'로 이동
		await categoryRepo.moveProductsToCategory(id, etcCategory.id);

		await categoryRepo.remove(id);

		return {
			message: `카테고리 "${category.name}" 가 삭제되었습니다.`
		};
	} catch (err) {
		if (err.code === "P2025") {
			const error = new Error("존재하지 않는 카테고리입니다.");
			error.status = 404;
			throw error;
		}
		throw err;
	}
};
