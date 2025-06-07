import { findUserById } from "../repositories/user.repository.js";
import { chargeBalanceRepo, useBalanceRepo } from "../repositories/paymentRepository.js";
import CustomError from "../utils/customError.js";
import { PAYMENT_MESSAGES } from "../constants/messages.js";

export const chargeBalance = async (userId, amount) => {
  if (!userId) {
    throw new CustomError(401, "AUTH_REQUIRED", PAYMENT_MESSAGES.AUTH_REQUIRED);
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new CustomError(400, "INVALID_INPUT", PAYMENT_MESSAGES.INVALID_INPUT);
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new CustomError(404, "USER_NOT_FOUND", PAYMENT_MESSAGES.USER_NOT_FOUND);
  }
  if (!user.verifiedPhone) {
    throw new CustomError(403, "PHONE_NOT_VERIFIED", PAYMENT_MESSAGES.PHONE_NOT_VERIFIED);
  }

  const updated = await chargeBalanceRepo(userId, amount);
  return updated;
};

export const useBalance = async (userId, amount) => {
  if (!userId) {
    throw new CustomError(401, "AUTH_REQUIRED", PAYMENT_MESSAGES.AUTH_REQUIRED);
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new CustomError(400, "INVALID_INPUT", "차감 금액이 올바르지 않습니다.");
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new CustomError(404, "USER_NOT_FOUND", PAYMENT_MESSAGES.USER_NOT_FOUND);
  }
  if (!user.verifiedPhone) {
    throw new CustomError(403, "PHONE_NOT_VERIFIED", PAYMENT_MESSAGES.PHONE_NOT_VERIFIED);
  }
  if (user.balance < amount) {
    throw new CustomError(400, "INSUFFICIENT_BALANCE", PAYMENT_MESSAGES.INSUFFICIENT_BALANCE);
  }

  const updated = await useBalanceRepo(userId, amount);
  return updated;
}; 