import { findProductByIdRepo } from "../repositories/product.repository.js";
import { saveAiPriceEstimation } from "../repositories/ai.repository.js";
import { getReviewsByProductIdRepo } from "../repositories/review.repository.js";
import CustomError from "../utils/customError.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 현재는 실제 데이터를 크롤링하지 않고, 상품명/설명 기반으로 학습된 지식에 따라 예측만 합니다.
// 추후 정확도 개선 시 실제 플랫폼 크롤링 결과로 대체 가능
export const estimatePriceFromAI = async (product) => {
  const { title, description } = product;

  const prompt = `
너는 중고 거래 가격 전문가야.

다음 상품의 이름과 설명을 기반으로, 중고 적정가를 추정하고,
쿠팡, 당근마켓, 중고나라에서의 예상 가격도 대략적으로 추정해줘.

다음 형식의 JSON으로만 응답해줘:

{
  "price": 정수,
  "sources": {
    "쿠팡": 정수,
    "당근마켓": 정수,
    "중고나라": 정수
  }
}

상품명: ${title}
설명: ${description ?? "설명 없음"}
  `;

  console.log("🔥 OpenAI 요청 시작");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

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

  return parsed;
};

// 전체 흐름
export const requestAiPriceEstimation = async ({ productId, adminUser }) => {
  const product = await findProductByIdRepo(productId);
  if (!product) {
    throw new CustomError(404, "PRODUCT_NOT_FOUND", ERROR_MESSAGES.PRODUCT_NOT_FOUND);
  }

  if (product.status !== "PENDING") {
    throw new CustomError(400, "INVALID_PRODUCT_STATUS", ERROR_MESSAGES.INVALID_PRODUCT_STATUS);
  }

  const result = await estimatePriceFromAI(product);
  const { price, sources, ...rest } = result;

  await saveAiPriceEstimation({
    ...rest,
    estimatedPrice: price,
    sources,
    productId,
    userId: adminUser.id,
  });

  return result;
};

export const summarizeReviews = async (productId) => {
    const product = await findProductByIdRepo(productId);
    if (!product) {
      throw new CustomError(404, "PRODUCT_NOT_FOUND", ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }
    const reviews = await getReviewsByProductIdRepo(productId);
    const contents = reviews.map((review) => review.comment).join("\n");
  
    if (!contents) {
      throw new CustomError(404, "REVIEW_NOT_FOUND", ERROR_MESSAGES.REVIEW_NOT_FOUND);
    }
  
    const prompt = `
  다음은 어떤 상품에 대한 리뷰들입니다. 전체적인 내용을 한국어로 간결히 요약해주세요.
  ---
  
  ${contents}
  
  요약결과:
  `;
  
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
  
    return { summary: completion.choices[0].message.content };
  };