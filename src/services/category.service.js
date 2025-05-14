import * as categoryRepo from "../repositories/category.repository.js";

export const getCategories = () => {
	return categoryRepo.findAll();
};

export const createCategory = (name) => {
	return categoryRepo.create(name);
};

export const updateCategory = async (id, name) => {
	try {
		return await categoryRepo.update(id, name);
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
		return await categoryRepo.remove(id);
	} catch (err) {
		if (err.code === "P2025") {
			const error = new Error("존재하지 않는 카테고리입니다.");
			error.status = 404;
			throw error;
		}
		throw err;
	}
};
