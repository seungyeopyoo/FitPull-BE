import { requestAiPriceEstimation } from "../services/ai.service.js";
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