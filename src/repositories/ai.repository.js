import prisma from "../data-source.js";

export const saveAiPriceEstimation = async (data) => {
  return await prisma.aiPriceEstimation.create({ data });
};