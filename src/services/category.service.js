import {
  findAll,
  create,
  update,
  remove,
  findById,
  findByName,
  moveProductsToCategory,
  findByIdWithProducts,
} from '../repositories/category.repository.js';
import CustomError from '../utils/customError.js';
import { CATEGORY_MESSAGES } from '../constants/messages.js';

export const getCategories = async () => {
  const categories = await findAll();
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
  }));
};

export const createCategory = async (name, description) => {
  // 중복 체크
  const exists = await findByName(name);
  if (exists) {
    throw new CustomError(
      409,
      'CATEGORY_ALREADY_EXISTS',
      CATEGORY_MESSAGES.CATEGORY_ALREADY_EXISTS.replace('{name}', name),
    );
  }
  const category = await create(name, description);
  return {
    message: CATEGORY_MESSAGES.CATEGORY_CREATED.replace(
      '{name}',
      category.name,
    ),
    category: {
      id: category.id,
      name: category.name,
      description: category.description,
    },
  };
};

export const updateCategory = async (id, name, description) => {
  try {
    const category = await update(id, name, description);
    const { id: categoryId, name: categoryName, description: desc } = category;
    return {
      message: CATEGORY_MESSAGES.CATEGORY_UPDATED.replace(
        '{name}',
        categoryName,
      ),
      category: { id: categoryId, name: categoryName, description: desc },
    };
  } catch (err) {
    if (err.code === 'P2025') {
      throw new CustomError(
        404,
        'CATEGORY_NOT_FOUND',
        CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
      );
    }
    throw err;
  }
};

export const deleteCategory = async (id) => {
  try {
    //삭제할 카테고리 정보 조회
    const category = await findById(id);
    if (!category) {
      throw new CustomError(
        404,
        'CATEGORY_NOT_FOUND',
        CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
      );
    }

    //'기타' 카테고리 id 조회
    const etcCategory = await findByName('기타');
    if (!etcCategory) {
      throw new CustomError(
        404,
        'ETC_CATEGORY_NOT_FOUND',
        CATEGORY_MESSAGES.ETC_CATEGORY_NOT_FOUND,
      );
    }

    //해당 카테고리에 속한 상품들 모두 '기타'로 이동
    await moveProductsToCategory(id, etcCategory.id);

    await remove(id);

    return {
      message: CATEGORY_MESSAGES.CATEGORY_DELETED.replace(
        '{name}',
        category.name,
      ),
    };
  } catch (err) {
    if (err.code === 'P2025') {
      throw new CustomError(
        404,
        'CATEGORY_NOT_FOUND',
        CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
      );
    }
    throw err;
  }
};

export const getCategoryDetail = async (id) => {
  const category = await findByIdWithProducts(id);
  if (!category) {
    throw new CustomError(
      404,
      'CATEGORY_NOT_FOUND',
      CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
    );
  }
  const { products } = category;
  return {
    message: CATEGORY_MESSAGES.CATEGORY_DETAIL_LISTED.replace(
      '{name}',
      category.name,
    ),
    category: {
      id: category.id,
      name: category.name,
      description: category.description,
    },
    products: products.map((product) => ({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrls?.[0] ?? null,
      status: product.status,
    })),
  };
};
