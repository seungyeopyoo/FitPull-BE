import { requestAiPriceEstimationService } from "../services/ai.service.js";
import { success } from "../utils/responseHandler.js";

export const requestAiPriceEstimation = async (req, res, next) => {
  const { productId } = req.params;
  const adminUser = req.user;

  const result = await requestAiPriceEstimationService({ productId, adminUser });

  return success(res, "AI 적정가 분석 완료", result);
};