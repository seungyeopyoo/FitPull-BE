import prisma from "../data-source.js";

// 잔고 충전
export const chargeBalanceRepo = async (userId, amount) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { balance: { increment: amount } },
    select: { id: true, balance: true },
  });
};

// 잔고 차감
export const useBalanceRepo = async (userId, amount) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { balance: { decrement: amount } },
    select: { id: true, balance: true },
  });
};

export const createPaymentLogRepo = async ({
  userId,
  rentalRequestId,
  amount,
  paymentType,
  memo,
  balanceBefore,
  balanceAfter,
  paidAt
}) => {
  return await prisma.paymentLog.create({
    data: {
      userId,
      rentalRequestId,
      amount,
      paymentType,
      memo,
      balanceBefore,
      balanceAfter,
      paidAt,
    },
  });
};