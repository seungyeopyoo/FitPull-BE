import {
	getCategories,
	createCategory,
	updateCategory,
	deleteCategory,
} from "../services/category.service.js";

export const getCategoriesController = async (req, res) => {
	const categories = await getCategories();
	res.json(categories);
};

export const createCategoryController = async (req, res) => {
	const { name } = req.body;
	if (!name)
		return res.status(400).json({ message: "카테고리 이름이 필요합니다." });

	const newCategory = await createCategory(name);
	res.status(201).json(newCategory);
};

export const updateCategoryController = async (req, res) => {
	const { id } = req.params;
	const { name } = req.body;
	if (!name)
		return res.status(400).json({ message: "수정할 이름이 필요합니다." });

	try {
		const updated = await updateCategory(id, name);
		res.json(updated);
	} catch (error) {
		console.error("카테고리 수정 에러:", error);
		const status = error.status || 500;
		res.status(status).json({ message: error.message });
	}
};

export const deleteCategoryController = async (req, res) => {
	const { id } = req.params;
	try {
		await deleteCategory(id);
		res.status(204).end();
	} catch (error) {
		console.error("카테고리 삭제 에러:", error);
		const status = error.status || 500;
		res.status(status).json({ message: error.message });
	}
};
