import {
	createProduct,
	getAllProducts,
	getProductById,
	getProductsByUser,
} from "../services/product.service.js";

export const createProductController = async (req, res) => {
	try {
		const product = await createProduct(req.body);
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

export const getProductsByUserController = async (req, res) => {
	try {
		const products = await getProductsByUser(req.params.userId);
		res.json(products);
	} catch (error) {
		console.error("내 상품 목록 조회 에러:", error);
		res.status(500).json({ message: "내 상품 목록 조회 중 오류 발생" });
	}
};
