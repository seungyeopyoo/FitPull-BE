import { findProductByIdRepo, getAllProducts } from "../repositories/product.repository.js";
import { saveAiPriceEstimation, saveAiProductRecommendation } from "../repositories/ai.repository.js";
import { getReviewsByProductIdRepo } from "../repositories/review.repository.js";
import CustomError from "../utils/customError.js";
import { AI_MESSAGES } from "../constants/messages.js"; 
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 현재는 실제 데이터를 크롤링하지 않고, 상품명/설명 기반으로 학습된 지식에 따라 예측만 합니다.
// 추후 정확도 개선 시 실제 플랫폼 크롤링 결과로 대체 가능
export const estimatePriceFromAI = async (product) => {
  const { title, description } = product;
  const prompt = `
너는 대여 가격 전문가야.

다음 상품의 이름과 설명을 기반으로, 1일 대여 적정가를 추정해줘.
중고 판매가격을 쿠팡, 당근마켓, 중고나라에서 추정한 후에 그 가격들을 바탕으로, 
실제 대여 서비스에서 하루에 받을 수 있는 적정 가격을 예측해서 반환해줘.

다음 형식의 JSON으로만 응답해줘:

{
  "dailyRentalPrice": 정수,
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
  let content = contentRaw;
  if (content.startsWith("```") ) {
    content = content.replace(/```[a-zA-Z]*\n?/, "").replace(/```/, "").trim();
  }
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new CustomError(
      500,
      "AI_PARSE_ERROR",
      `AI 응답을 파싱하는 데 실패했습니다. 실제 응답: ${contentRaw}`
    );
  }
  return parsed;
};

export const requestAiPriceEstimation = async ({ productId, adminUser }) => {
  const product = await findProductByIdRepo(productId);
  if (!product) {
    throw new CustomError(404, "PRODUCT_NOT_FOUND", AI_MESSAGES.PRODUCT_NOT_FOUND);
  }
  if (product.status !== "PENDING") {
    throw new CustomError(400, "INVALID_PRODUCT_STATUS", AI_MESSAGES.INVALID_PRODUCT_STATUS);
  }
  const result = await estimatePriceFromAI(product);
  const { dailyRentalPrice, sources, ...rest } = result;
  await saveAiPriceEstimation({
    ...rest,
    estimatedDailyRentalPrice: dailyRentalPrice,
    estimatedPrice: dailyRentalPrice,
    sources,
    productId,
    userId: adminUser.id,
  });
  return result;
};

export const summarizeReviews = async (productId) => {
  const product = await findProductByIdRepo(productId);
  if (!product) {
    throw new CustomError(404, "PRODUCT_NOT_FOUND", AI_MESSAGES.PRODUCT_NOT_FOUND);
  }
  const reviews = await getReviewsByProductIdRepo(productId);
  const contents = reviews.map((review) => review.comment).join("\n");
  if (!contents) {
    throw new CustomError(404, "REVIEW_NOT_FOUND", AI_MESSAGES.REVIEW_NOT_FOUND);
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

export const recommendProducts = async ({ prompt, userId }) => {
  if (!prompt) {
    throw new CustomError(400, "PROMPT_REQUIRED", AI_MESSAGES.PROMPT_REQUIRED);
  }
  const { products } = await getAllProducts({ take: 20 });
  if (products.length === 0) {
    throw new CustomError(404, "NO_PRODUCTS", AI_MESSAGES.NO_PRODUCTS);
  }
  const itemsText = products.map((p, idx) => {
    return `${idx + 1}. [ID: ${p.id}] ${p.title} - ${p.description ?? "설명 없음"}`;
  }).join("\n");
  const gptPrompt = `
당신은 상품 추천 도우미입니다.

아래는 대여 가능한 상품 목록입니다.
각 상품은 ID, 제목, 설명으로 구성되어 있습니다.

--- 상품 목록 ---
${itemsText}

--- 사용자 요청 ---
"${prompt}"

위 요청에 맞게 적절한 상품 3개를 추천해 주세요.
단, 정말로 적합한 상품이 없다면 빈 배열([])로만 응답하세요.

추천할 때는 상품의 ID를 기준으로 출력하고, 간단한 추천 이유도 함께 작성하세요.

출력 형식 (JSON만 반환):
[
  { "id": "상품ID", "reason": "추천 이유" },
  ...
]
적합한 상품이 없으면 [] 만 반환
`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: gptPrompt }],
    temperature: 0.5,
  });
  const content = completion.choices[0].message.content;
  let parsed;
  try {
    parsed = JSON.parse(content.replace(/```json|```/g, "").trim());
  } catch (err) {
    throw new CustomError(500, "AI_PARSE_ERROR", ERROR_MESSAGES.AI_PARSE_ERROR);
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { recommendedProductIds: [], reason: "추천할 만한 상품이 없습니다." };
  }
  const recommendedProductIds = parsed.map((item) => item.id);
  const reason = parsed.map((item) => `- ${item.reason}`).join("\n");
  await saveAiProductRecommendation({
    prompt,
    recommendedProducts: recommendedProductIds,
    recommendReason: reason,
    userId: userId ?? null,
  });
  return { recommendedProductIds, reason };
};
