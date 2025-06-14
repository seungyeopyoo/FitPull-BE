import prisma from "../data-source.js";
import { RENTAL_STATUS } from "../constants/status.js";
import CustomError from "../utils/customError.js";
import { RENTAL_REQUEST_MESSAGES, PLATFORM_MESSAGES } from "../constants/messages.js";

export const findProductTitleById = async (productId) => {
	const product = await prisma.product.findUnique({
		where: { id: productId },
		select: { title: true },
	});

	return product?.title ?? "제목 없음";
};

export const findMyRentalRequestsRepo = async (userId) => {
	return await prisma.rentalRequest.findMany({
		where: { userId, deletedAt: null },
		include: {
			product: true,
		},
		orderBy: { createdAt: "desc" },
	});
};

export const findPendingRequestsRepo = async () => {
	return await prisma.rentalRequest.findMany({
		where: { status: RENTAL_STATUS.PENDING, deletedAt: null },
		include: {
			product: true,
			user: {
				select: { id: true, name: true, phone: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});
};

export const updateRentalRequestStatusRepo = async (id, status) => {
	return await prisma.rentalRequest.update({
		where: { id },
		data: { status },
	});
};

export const checkRentalDateConflict = async (
	productId,
	startDate,
	endDate,
) => {
	const overlapping = await prisma.rentalRequest.findFirst({
		where: {
			productId,
			status: RENTAL_STATUS.APPROVED,
			OR: [
				{
					startDate: { lte: new Date(endDate) },
					endDate: { gte: new Date(startDate) },
				},
			],
		},
	});

	return overlapping !== null;
};

export const findRentalRequestSummaryById = async (id) => {
	const request = await prisma.rentalRequest.findUnique({
		where: { id },
		include: {
			product: { select: { title: true } },
			user: { select: { name: true } },
		},
	});

	if (!request) return null;

	return {
		rentalPeriod: `${request.startDate.toISOString().slice(0, 10)} ~ ${request.endDate.toISOString().slice(0, 10)}`,
		productTitle: request.product.title,
		userName: request.user.name,
		status: request.status,
		howToReceive: request.howToReceive,
		memo: request.memo,
	};
};

export const getRentalRequestById = async (id) => {
	return await prisma.rentalRequest.findUnique({
		where: { id },
		include: {
			product: true,
			user: true,
		},
	});
};

export const findActiveRentalByProductId = async (productId) => {
	return await prisma.rentalRequest.findFirst({
		where: {
			productId,
			status: "ON_RENTING",
		},
	});
};

export const findActiveRentalForDelete = async (productId, oneMonthLater) => {
	return await prisma.rentalRequest.findFirst({
		where: {
			productId,
			status: {
				in: ["APPROVED", "ON_RENTING"],
			},
			startDate: {
				lte: oneMonthLater,
			},
		},
	});
};

export const getRentalRequestByIdWithUserAndProduct = async (tx, id) => {
	return await tx.rentalRequest.findUnique({
		where: { id },
		include: { user: true, product: true },
	});
};

export const updateRentalRequestStatusRepoTx = async (tx, id, status) => {
	return await tx.rentalRequest.update({
		where: { id },
		data: { status },
	});
};

export const refundRentalRequestRepo = async ({
	rentalRequestId,
	refundMemo,
	rejectByAdmin = false,
}) => {
	return await prisma.$transaction(async (tx) => {
		// 동시성 방지: row-level lock
		await tx.$executeRaw`SELECT * FROM rental_requests WHERE id = ${rentalRequestId} FOR UPDATE`;

		// 1. rentalRequest, user, product 조회
		const rentalRequest = await tx.rentalRequest.findUnique({
			where: { id: rentalRequestId },
			include: { user: true, product: true },
		});
		if (!rentalRequest) throw new CustomError(404, "RENTAL_NOT_FOUND", RENTAL_REQUEST_MESSAGES.RENTAL_NOT_FOUND);

		// 2. 조건부 상태 변경 (PENDING/APPROVED만)
		const updated = await tx.rentalRequest.updateMany({
			where: {
				id: rentalRequestId,
				status: { in: ["PENDING", "APPROVED"] },
			},
			data: { status: rejectByAdmin ? "REJECTED" : "CANCELED" },
		});
		if (updated.count === 0) {
			throw new CustomError(400, "ALREADY_PROCESSED", "이미 처리된 대여요청입니다.");
		}

		// 3. 유저 잔고 환불
		const updatedUser = await tx.user.update({
			where: { id: rentalRequest.userId },
			data: { balance: { increment: rentalRequest.totalPrice } },
			select: { balance: true },
		});

		// 4. 유저 환불 로그
		await tx.paymentLog.create({
			data: {
				userId: rentalRequest.userId,
				rentalRequestId: rentalRequest.id,
				amount: rentalRequest.totalPrice,
				paymentType: "REFUND",
				memo: refundMemo || "[자동] 대여요청 취소/거절 환불",
				balanceBefore: rentalRequest.user.balance,
				balanceAfter: updatedUser.balance,
				paidAt: new Date(),
			},
		});

		// 5. 회사(플랫폼) 잔고 감소
		const platformAccount = await tx.platformAccount.findFirst();
		if (!platformAccount) throw new CustomError(500, "PLATFORM_ACCOUNT_NOT_FOUND", PLATFORM_MESSAGES.PLATFORM_ACCOUNT_NOT_FOUND);
		const platformBalanceBefore = platformAccount.balance;
		const platformBalanceAfter = platformBalanceBefore - rentalRequest.totalPrice;
		await tx.platformAccount.update({
			where: { id: platformAccount.id },
			data: { balance: { decrement: rentalRequest.totalPrice } },
		});

		// 6. 회사 환불 로그
		await tx.platformPaymentLog.create({
			data: {
				platformAccountId: platformAccount.id,
				type: "REFUND",
				amount: rentalRequest.totalPrice,
				memo: `[자동] 대여요청 환불: ${rentalRequest.product.title}`,
				balanceBefore: platformBalanceBefore,
				balanceAfter: platformBalanceAfter,
				rentalRequestId: rentalRequest.id,
				userId: rentalRequest.userId,
			},
		});

		const updatedRentalRequest = await tx.rentalRequest.findUnique({
			where: { id: rentalRequestId },
		});

		return {
			rentalRequest: updatedRentalRequest,
			product: rentalRequest.product,
			user: rentalRequest.user,
			refundedAmount: rentalRequest.totalPrice,
			rejectByAdmin,
		};
	});
};




