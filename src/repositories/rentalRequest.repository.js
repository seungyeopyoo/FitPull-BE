import prisma from "../data-source.js";
import { RENTAL_STATUS } from "../constants/status.js";
import CustomError from "../utils/customError.js";
import { RENTAL_REQUEST_MESSAGES } from "../constants/messages.js";

export const createRentalRequestRepo = async (
	productId,
	startDate,
	endDate,
	userId,
	totalPrice,
	howToReceive,
	memo
) => {
	return await prisma.rentalRequest.create({
		data: {
			productId,
			userId,
			startDate: new Date(startDate),
			endDate: new Date(endDate),
			totalPrice,
			howToReceive,
			memo,
		},
	});
};

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

export const createRentalRequestWithPaymentRepo = async ({
	userId,
	productId,
	startDate,
	endDate,
	howToReceive,
	memo,
	totalPrice,
	balanceBefore,
	balanceAfter,
	productTitle,
}) => {
	return await prisma.$transaction(async (tx) => {
		// 1. 유저 잔고 차감
		const updatedUser = await tx.user.update({
			where: { id: userId },
			data: { balance: { decrement: totalPrice } },
			select: { balance: true },
		});

		// 2. 대여요청 생성
		const rentalRequest = await tx.rentalRequest.create({
			data: {
				productId,
				userId,
				startDate: new Date(startDate),
				endDate: new Date(endDate),
				howToReceive,
				memo,
				totalPrice,
				status: "PENDING",
			},
		});

		// 3. 결제로그 생성
		await tx.paymentLog.create({
			data: {
				userId,
				rentalRequestId: rentalRequest.id,
				amount: totalPrice,
				paymentType: "RENTAL_PAYMENT",
				memo: `[자동] ${productTitle} 대여 신청`,
				balanceBefore,
				balanceAfter: updatedUser.balance,
				paidAt: new Date(),
			},
		});

		return rentalRequest;
	});
};

export const refundRentalRequestRepo = async ({
	rentalRequestId,
	refundMemo,
	rejectByAdmin = false,
}) => {
	return await prisma.$transaction(async (tx) => {
		const rentalRequest = await tx.rentalRequest.findUnique({
			where: { id: rentalRequestId },
			include: { user: true, product: true },
		});
		if (!rentalRequest) throw new CustomError(404, "RENTAL_NOT_FOUND", RENTAL_REQUEST_MESSAGES.RENTAL_NOT_FOUND);

		const updatedUser = await tx.user.update({
			where: { id: rentalRequest.userId },
			data: { balance: { increment: rentalRequest.totalPrice } },
			select: { balance: true },
		});

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

		await tx.rentalRequest.update({
			where: { id: rentalRequestId },
			data: { status: rejectByAdmin ? "REJECTED" : "CANCELED" },
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




