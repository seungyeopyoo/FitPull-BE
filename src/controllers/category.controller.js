import {
	getCategories,
	createCategory,
	updateCategory,
	deleteCategory,
	getCategoryDetail,
} from "../services/category.service.js";
import { success } from "../utils/responseHandler.js";
import messages from "../constants/messages.js";

export const getCategoriesController = async (req, res, next) => {
	try {
		const categories = await getCategories();
		return success(res, messages.CATEGORY_LISTED, { categories });
	} catch (error) {
		next(error);
	}
};

export const createCategoryController = async (req, res, next) => {
	try {
		const { name, description } = req.body;
		if (!name)
			return next(new CustomError(400, "CATEGORY_NAME_REQUIRED", messages.CATEGORY_NAME_REQUIRED));

		const result = await createCategory(name, description);
		return success(res, result.message, { category: result.category });
	} catch (error) {
		next(error);
	}
};

export const updateCategoryController = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { name, description } = req.body;
		if (!name)
			return next(new CustomError(400, "CATEGORY_NAME_REQUIRED", messages.CATEGORY_NAME_REQUIRED));

		const result = await updateCategory(id, name, description);
		return success(res, result.message, { category: result.category });
	} catch (error) {
		console.error("카테고리 수정 에러:", error);
		next(error);
	}
};

export const deleteCategoryController = async (req, res, next) => {
	try {
		const { id } = req.params;
		const result = await deleteCategory(id);
		return success(res, result.message);
	} catch (error) {
		console.error("카테고리 삭제 에러:", error);
		next(error);
	}
};

export const getCategoryDetailController = async (req, res, next) => {
	try {
		const { id } = req.params;
		const result = await getCategoryDetail(id);
		return success(res, result.message, { category: result.category, products: result.products });
	} catch (error) {
		next(error);
	}
};
