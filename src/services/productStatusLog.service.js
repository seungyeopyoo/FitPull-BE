import {
    createStatusLogRepo,
    findLogsByProductRepo,
    updateStatusLogRepo,
    deleteStatusLogRepo,
  } from "../repositories/productStatusLog.repository.js";
import { getProductById } from "../repositories/product.repository.js";
import CustomError from "../utils/customError.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
  
const PRODUCT_LOG_TYPES = [
  "PRE_RENTAL",
  "ON_RENTAL",
  "DAMAGE_REPORTED",
  "WITHDRAWN",
  "STORAGE_FEE_NOTICE",
  "ETC"
];

export const createStatusLog = async ({ userId, productId, type, photoUrls, notes, completedRentalId }) => {
  // 상품 존재/삭제 여부 검증
  const product = await getProductById(productId);
  if (!product) throw new CustomError(404, "PRODUCT_NOT_FOUND", ERROR_MESSAGES.PRODUCT_NOT_FOUND);
  if (product.deletedAt) throw new CustomError(400, "PRODUCT_DELETED", ERROR_MESSAGES.DELETED_PRODUCT);

  // 로그 타입 검증
  if (!PRODUCT_LOG_TYPES.includes(type)) {
    throw new CustomError(400, "INVALID_LOG_TYPE", `올바른 로그타입을 입력하세요: ${PRODUCT_LOG_TYPES.join(", ")}`);
  }

  // 이미지 개수 검증
  if (!Array.isArray(photoUrls)) photoUrls = [];
  if (photoUrls.length > 5) throw new CustomError(400, "IMAGE_LIMIT_EXCEEDED", ERROR_MESSAGES.IMAGE_LIMIT_EXCEEDED);

  // 생성
  return await createStatusLogRepo({
    userId,
    productId,
    type,
    photoUrls,
    notes,
    completedRentalId,
  });
};
  
export const getLogsByProduct = async (productId) => {
  // 상품 존재 검증
  const product = await getProductById(productId);
  if (!product) throw new CustomError(404, "PRODUCT_NOT_FOUND", ERROR_MESSAGES.PRODUCT_NOT_FOUND);

  return await findLogsByProductRepo(productId);
};
  
export const updateStatusLog = async (id, { productId, type, notes, completedRentalId, photoUrls }) => {
  // 상품 존재/삭제 여부 검증
  const product = await getProductById(productId);
  if (!product) throw new CustomError(404, "PRODUCT_NOT_FOUND", ERROR_MESSAGES.PRODUCT_NOT_FOUND);
  if (product.deletedAt) throw new CustomError(400, "PRODUCT_DELETED", ERROR_MESSAGES.DELETED_PRODUCT);

  // 로그 타입 검증
  if (type && !PRODUCT_LOG_TYPES.includes(type)) {
    throw new CustomError(400, "INVALID_LOG_TYPE", `올바른 로그타입을 입력하세요: ${PRODUCT_LOG_TYPES.join(", ")}`);
  }

  // 이미지 개수 검증
  if (photoUrls && (!Array.isArray(photoUrls) || photoUrls.length > 5)) {
    throw new CustomError(400, "IMAGE_LIMIT_EXCEEDED", ERROR_MESSAGES.IMAGE_LIMIT_EXCEEDED);
  }

  // 수정할 데이터 구성
  const data = {};
  if (type !== undefined) data.type = type;
  if (notes !== undefined) data.notes = notes;
  if (completedRentalId !== undefined) data.completedRentalId = completedRentalId;
  if (photoUrls !== undefined) data.photoUrls = photoUrls;

  if (Object.keys(data).length === 0) {
    throw new CustomError(400, "NO_UPDATE_DATA", "수정할 데이터가 없습니다.");
  }

  try {
    return await updateStatusLogRepo(id, data);
  } catch (err) {
    if (err.code === "P2025") {
      throw new CustomError(404, "STATUS_LOG_NOT_FOUND", ERROR_MESSAGES.STATUS_LOG_NOT_FOUND);
    }
    throw err;
  }
};

export const deleteStatusLog = async (id) => {
  try {
    return await deleteStatusLogRepo(id);
  } catch (err) {
    if (err.code === "P2025") {
      throw new CustomError(404, "STATUS_LOG_NOT_FOUND", ERROR_MESSAGES.STATUS_LOG_NOT_FOUND);
    }
    throw err;
  }
};
  