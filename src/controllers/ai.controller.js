import { requestAiPriceEstimation, summarizeReviews, recommendProducts } from "../services/ai.service.js";
import { success } from "../utils/responseHandler.js";


export const requestAiPriceEstimationController = async (req, res, next) => {
    try {
      const { productId } = req.params;
      const adminUser = req.user;
  
      const result = await requestAiPriceEstimation({ productId, adminUser });
  
      return success(res, "AI 적정가 분석 완료", result);
    } catch (err) {
      console.error("❗ Controller 에러:", err);
      next(err); 
    }
  };

  export const summarizeReviewsController = async (req, res, next) => {
    try {
      const { productId } = req.params;
      const result = await summarizeReviews(productId);
      return success(res, "리뷰 요약 완료", result);
    } catch (err) {
      console.error("❗ 리뷰 요약 실패:", err);
      next(err);
    }
  };

export const recommendProductsController = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const userId = req.user?.id ?? null;
    const result = await recommendProducts({ prompt, userId });
    return success(res, "상품 추천 완료", result);
  } catch (err) {
    console.error("❗ 상품 추천 실패:", err);
    next(err);
  }
};
