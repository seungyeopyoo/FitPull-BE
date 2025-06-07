import { chargeBalance, useBalance } from "../services/payment.service.js";
import { success } from "../utils/responseHandler.js";
import { PAYMENT_MESSAGES } from "../constants/messages.js";

export const chargeBalanceController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    const result = await chargeBalance(userId, amount);
    return success(res, PAYMENT_MESSAGES.CHARGE_SUCCESS, { balance: result.balance });
  } catch (err) {
    next(err);
  }
};

export const useBalanceController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    const result = await useBalance(userId, amount);
    return success(res, PAYMENT_MESSAGES.USE_SUCCESS, { balance: result.balance });
  } catch (err) {
    next(err);
  }
}; 