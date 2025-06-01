import { findProductByIdRepo } from "../repositories/product.repository.js";
import { saveAiPriceEstimation } from "../repositories/ai.repository.js";
import CustomError from "../utils/customError.js";
import { ERROR_MESSAGES } from "../constants/messages.js";

// 수동 요청 시 AI 적정가 분석 흐름
export const requestAiPriceEstimationService = async ({ productId, adminUser }) => {
  const product = await findProductByIdRepo(productId);
  if (!product) {
    throw new CustomError(404, "PRODUCT_NOT_FOUND", ERROR_MESSAGES.PRODUCT_NOT_FOUND);
  }

  if (product.status !== "PENDING") {
    throw new CustomError(400, "INVALID_PRODUCT_STATUS", ERROR_MESSAGES.INVALID_PRODUCT_STATUS);
  }

  const result = await mockEstimatePrice(product); // 현재는 mock

  await saveAiPriceEstimation({
    ...result,
    productId,
    userId: adminUser.id,
  });

  return result;
};

// mock AI 응답 생성기
export const mockEstimatePrice = async (product) => {
  const { title } = product;

  return {
    estimatedPrice: 89000,
    isValid: true,
    reason: `"${title}"의 평균 중고 시세는 약 89,000원입니다.`,
    sources: {
      "쿠팡": 92000,
      "당근마켓": 87000,
      "중고나라": 88000,
    },
  };
};
