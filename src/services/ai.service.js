import { findProductByIdRepo } from "../repositories/product.repository.js";
import { saveAiPriceEstimation } from "../repositories/ai.repository.js";
import CustomError from "../utils/customError.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 실제 GPT 호출 및 응답 파싱
export const estimatePriceFromAI = async (product) => {
    const { title, description } = product;
  
    const sources = {
      "쿠팡": 92000,
      "당근마켓": 87000,
      "중고나라": 88000,
    };
  
    const prompt = `
아래 상품의 중고 적정가를 분석해서 반드시 JSON 형식으로만 답변해 주세요.
예시: { "price": 12345 }
상품명: ${title}
설명: ${description}
`;
  
    console.log("🔥 OpenAI 요청 시작");
  
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
  
    console.log("✅ GPT 응답 도착");
  
    const contentRaw = completion.choices[0].message.content;
    console.log("📦 GPT 응답 내용:", contentRaw);

    let content = contentRaw;
    if (content.startsWith("```")) {
      content = content.replace(/```[a-zA-Z]*\n?/, "").replace(/```/, "").trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error("❌ JSON 파싱 에러:", err, "실제 응답:", contentRaw);
      throw new CustomError(
        500,
        "AI_PARSE_ERROR",
        `AI 응답을 파싱하는 데 실패했습니다. 실제 응답: ${contentRaw}`
      );
    }
  
    return {
      ...parsed,
      sources,
    };
  };

// 수동 요청 시 AI 적정가 분석 전체 흐름
export const requestAiPriceEstimation = async ({ productId, adminUser }) => {
  const product = await findProductByIdRepo(productId);
  if (!product) {
    throw new CustomError(404, "PRODUCT_NOT_FOUND", ERROR_MESSAGES.PRODUCT_NOT_FOUND);
  }

  if (product.status !== "PENDING") {
    throw new CustomError(400, "INVALID_PRODUCT_STATUS", ERROR_MESSAGES.INVALID_PRODUCT_STATUS);
  }

  const result = await estimatePriceFromAI(product);

  // price, sources 분리
  const { price, sources, ...rest } = result;

  await saveAiPriceEstimation({
    ...rest,                // 혹시 모를 추가 필드
    estimatedPrice: price,  // 필수 필드
    sources,                // 필요하다면 포함
    productId,
    userId: adminUser.id,
  });

  return result;
};
