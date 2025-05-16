import {
	createProduct,
	getAllProducts,
	getProductById,
	getProductsByUser,
	updateProduct,
	deleteProduct,
} from "../services/product.service.js";

export const createProductController = async (req, res) => {
	try {
		const product = await createProduct(req.body, req.user);
		res.status(201).json({ message: "상품이 등록되었습니다.", product });
	} catch (error) {
		console.error("상품 등록 에러:", error);
		res.status(400).json({ message: error.message });
	}
};

export const getAllProductsController = async (_req, res) => {
	try {
		const products = await getAllProducts();
		res.status(200).json(products);
	} catch (error) {
		console.error("상품 조회 에러:", error);
		res.status(500).json({ message: "상품 조회 중 오류 발생" });
	}
};

export const getProductByIdController = async (req, res) => {
	try {
		const product = await getProductById(req.params.id);
		if (!product)
			return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
		res.json(product);
	} catch (error) {
		if (error.message === "상품을 찾을 수 없습니다.") {
			return res.status(404).json({ message: error.message });
		}
		console.error("상품 상세조회 에러:", error);
		res.status(500).json({ message: "상품 상세조회 중 오류 발생" });
	}
};

export const getProductsMeController = async (req, res) => {
	try {
		if (!req.user || !req.user.id) {
			return res.status(401).json({ message: "인증이 필요합니다." });
		}
		const products = await getProductsByUser(req.user.id);
		if (!products || products.length === 0) {
			return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
		}
		res.json(products);
	} catch (error) {
		console.error("내 상품 목록 조회 에러:", error);
		res.status(500).json({ message: "내 상품 목록 조회 중 오류 발생" });
	}
};

export const updateProductController = async (req, res) => {
	try {
		const { id } = req.params;
		const productData = req.body;
		const user = req.user;

		const updatedProduct = await updateProduct(id, productData, user);
		res.json(updatedProduct);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const deleteProductController = async (req, res) => {
	try {
		const { id } = req.params;
		const user = req.user;

		await deleteProduct(id, user);
		res.json({ message: "상품이 삭제되었습니다." });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};
