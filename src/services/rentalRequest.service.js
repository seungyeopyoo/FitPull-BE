import {
	findMyRentalRequestsRepo,
	findPendingRequestsRepo,
	updateRentalRequestStatusRepo,
	checkRentalDateConflict,
	findRentalRequestSummaryById,
	getRentalRequestById,
	refundRentalRequestRepo,
} from "../repositories/rentalRequest.repository.js";
import { RENTAL_STATUS } from "../constants/status.js";
import { RENTAL_REQUEST_MESSAGES, NOTIFICATION_MESSAGES } from "../constants/messages.js";
import { getProductById } from "../repositories/product.repository.js";
import CustomError from "../utils/customError.js";
import { createNotification } from "./notification.service.js";
import { RENTAL_DISCOUNT } from "../constants/rentalDiscount.js";
import { findUserById } from "../repositories/user.repository.js";
import prisma from "../data-source.js";


export const createRentalRequestWithPayment = async (
	productId,
	startDate,
	endDate,
	userId,
	howToReceive,
	memo
) => {
	try {
	// 예약일 30일 제한
	const now = new Date();
	const oneMonthLater = new Date();
	oneMonthLater.setDate(now.getDate() + 30);

	const start = new Date(startDate);
	const end = new Date(endDate);

	if (isNaN(start.getTime()) || isNaN(end.getTime())) {
		throw new CustomError(400, "INVALID_DATE_FORMAT", RENTAL_REQUEST_MESSAGES.INVALID_DATE_FORMAT);
	}

	if (end <= start) {
		throw new CustomError(400, "INVALID_RENTAL_DATE", RENTAL_REQUEST_MESSAGES.INVALID_RENTAL_DATE);
	}
	if (start > oneMonthLater) {
		throw new CustomError(400, "RENTAL_DATE_LIMIT", RENTAL_REQUEST_MESSAGES.START_DATE_LIMIT);
	}

	// 날짜 중복 체크
	const conflict = await checkRentalDateConflict(productId, startDate, endDate);
	if (conflict) throw new CustomError(400, "RENTAL_DATE_CONFLICT", RENTAL_REQUEST_MESSAGES.RENTAL_DATE_CONFLICT);

	if (!howToReceive) throw new CustomError(400, "RECEIVE_METHOD_REQUIRED", RENTAL_REQUEST_MESSAGES.RECEIVE_METHOD_REQUIRED);

	const product = await getProductById(productId);
	if (!product) throw new CustomError(404, "PRODUCT_NOT_FOUND", RENTAL_REQUEST_MESSAGES.PRODUCT_NOT_FOUND);

	const user = await findUserById(userId);
	if (!user) throw new CustomError(404, "USER_NOT_FOUND", RENTAL_REQUEST_MESSAGES.USER_NOT_FOUND);

	const dayCount = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
	let totalPrice = product.price * dayCount;

	// 할인 정책 적용
	const discountPolicy = RENTAL_DISCOUNT.find(policy => dayCount >= policy.minDays);
	if (discountPolicy) {
		totalPrice *= discountPolicy.rate;
	}
	totalPrice = Math.round(totalPrice);

	if (user.balance < totalPrice) {
		throw new CustomError(400, "INSUFFICIENT_BALANCE", RENTAL_REQUEST_MESSAGES.INSUFFICIENT_BALANCE);
	}

	// 트랜잭션: 잔고 차감, 대여요청 생성, 결제로그 생성
	const rentalRequest = await prisma.$transaction(async (tx) => {
		//동시성 체크
		const exists = await tx.rentalRequest.findFirst({
			where: {
				userId,
				productId,
				status: { in: ["PENDING", "APPROVED"] },
				startDate: { lte: new Date(endDate) },
				endDate: { gte: new Date(startDate) },
			},
		});
		if (exists) {
			throw new CustomError(400, "ALREADY_REQUESTED", RENTAL_REQUEST_MESSAGES.ALREADY_REQUESTED);
		}

		// 유저 잔액 차감
		const updatedUser = await tx.user.update({
			where: { id: userId },
			data: { balance: { decrement: totalPrice } },
			select: { balance: true },
		});

		// 대여 요청 생성
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

		// 유저 결제 로그 생성
		await tx.paymentLog.create({
			data: {
				userId,
				rentalRequestId: rentalRequest.id,
				amount: totalPrice,
				paymentType: "RENTAL_PAYMENT",
				memo: `[자동] ${product.title} 대여 신청`,
				balanceBefore: user.balance,
				balanceAfter: updatedUser.balance,
				paidAt: new Date(),
			},
		});

		// 플랫폼 계정 조회
		const platformAccount = await tx.platformAccount.findFirst();
		if (!platformAccount) {
			throw new CustomError(500, "PLATFORM_ACCOUNT_NOT_FOUND", PLATFORM_MESSAGES.PLATFORM_ACCOUNT_NOT_FOUND);
		}
		const platformBalanceBefore = platformAccount.balance;
		const platformBalanceAfter = platformBalanceBefore + totalPrice;

		// 플랫폼 수익 증가
		await tx.platformAccount.update({
			where: { id: platformAccount.id },
			data: { balance: { increment: totalPrice } },
		});

		// 플랫폼 결제 로그
		await tx.platformPaymentLog.create({
			data: {
				platformAccountId: platformAccount.id,
				type: "INCOME",
				amount: totalPrice,
				memo: `[자동] 대여 결제: ${product.title}`,
				balanceBefore: platformBalanceBefore,
				balanceAfter: platformBalanceAfter,
				rentalRequestId: rentalRequest.id,
				userId,
			},
		});

		return rentalRequest;
	});

	return rentalRequest;
	} catch (err) {
		if (err.code === "P2002" && err.meta?.target?.includes("rental_request_unique_active")) {
			throw new CustomError(409, "ALREADY_REQUESTED", RENTAL_REQUEST_MESSAGES.ALREADY_REQUESTED);
		}
		throw err;
	}
};

export const getMyRentalRequests = async (userId) => {
	const requests = await findMyRentalRequestsRepo(userId);

	return requests.map((request) => ({
		id: request.id,
		rentalPeriod: `${request.startDate.toISOString().slice(0, 10)} ~ ${request.endDate.toISOString().slice(0, 10)}`,
		productTitle: request.product.title,
		status: request.status,
		howToReceive: request.howToReceive,
		memo: request.memo,
		totalPrice: request.totalPrice,
	}));
};

export const getPendingRequests = async () => {
	const requests = await findPendingRequestsRepo();

	return requests.map((request) => ({
		id: request.id,
		rentalPeriod: `${request.startDate.toISOString().slice(0, 10)} ~ ${request.endDate.toISOString().slice(0, 10)}`,
		productTitle: request.product.title,
		howToReceive: request.howToReceive,
		memo: request.memo,
		userName: request.user.name,
		userPhone: request.user.phone,
		status: request.status,
		totalPrice: request.totalPrice,
	}));
};

export const approveRentalRequest = async (id) => {
	try {
		const updated = await updateRentalRequestStatusRepo(id, RENTAL_STATUS.APPROVED);
		if (!updated) throw new CustomError(404, "RENTAL_NOT_FOUND", RENTAL_REQUEST_MESSAGES.RENTAL_NOT_FOUND);
		const summary = await findRentalRequestSummaryById(id);
		if (!summary) throw new CustomError(404, "RENTAL_NOT_FOUND", RENTAL_REQUEST_MESSAGES.RENTAL_NOT_FOUND);
		const request = await getRentalRequestById(id);

		await createNotification({
			userId: request.userId,
			type: "RENTAL_STATUS",
			message: `${NOTIFICATION_MESSAGES.RENTAL_APPROVED} [${request.product.title}]`,
			url: `/rental-requests/${id}`,
			rentalRequestId: id,
		});

		await createNotification({
			userId: request.product.ownerId,
			type: "RENTAL_STATUS",
			message: `${NOTIFICATION_MESSAGES.PRODUCT_RENTED} [${request.product.title}]`,
			url: `/rental-requests/${id}`,
			rentalRequestId: id,
		});

		return { id, ...summary, totalPrice: request.totalPrice };
	} catch (err) {
		if (err.code === "P2025") {
			throw new CustomError(404, "RENTAL_NOT_FOUND", RENTAL_REQUEST_MESSAGES.RENTAL_NOT_FOUND);
		}
		throw err;
	}
};

export const rejectRentalRequest = async (id) => {
	try {
		const updated = await updateRentalRequestStatusRepo(id, RENTAL_STATUS.REJECTED);
		if (!updated) throw new CustomError(404, "RENTAL_NOT_FOUND", RENTAL_REQUEST_MESSAGES.RENTAL_NOT_FOUND);
		const summary = await findRentalRequestSummaryById(id);
		const request = await getRentalRequestById(id);

		await createNotification({
			userId: request.userId,
			type: "RENTAL_STATUS",
			message: `${NOTIFICATION_MESSAGES.RENTAL_REJECTED} [${request.product.title}]`,
			url: `/rental-requests/${id}`,
			rentalRequestId: id,
		});

		return { id, ...summary, totalPrice: request.totalPrice };
	} catch (err) {
		if (err.code === "P2025") {
			throw new CustomError(404, "RENTAL_NOT_FOUND", RENTAL_REQUEST_MESSAGES.RENTAL_NOT_FOUND);
		}
		throw err;
	}
};

export const cancelRentalRequest = async (id, userId) => {
	const request = await getRentalRequestById(id);
	if (!request) throw new CustomError(404, "RENTAL_NOT_FOUND", RENTAL_REQUEST_MESSAGES.RENTAL_NOT_FOUND);
	if (request.userId !== userId) throw new CustomError(403, "NO_PERMISSION", RENTAL_REQUEST_MESSAGES.NO_PERMISSION);
	if (![RENTAL_STATUS.PENDING, RENTAL_STATUS.APPROVED].includes(request.status)) {
		throw new CustomError(400, "RENTAL_CANCEL_NOT_ALLOWED", RENTAL_REQUEST_MESSAGES.CANCEL_NOT_ALLOWED);
	}
	// 3일전 취소 불가
	const now = new Date();
	const startDate = new Date(request.startDate);
	const diffDays = (startDate - now) / (1000 * 60 * 60 * 24);
	if (diffDays < 3) {
		throw new CustomError(400, "RENTAL_CANCEL_TOO_LATE", RENTAL_REQUEST_MESSAGES.CANCEL_TOO_LATE);
	}
	await updateRentalRequestStatusRepo(id, RENTAL_STATUS.CANCELED);
	return {
		id,
		rentalPeriod: `${request.startDate.toISOString().slice(0, 10)} ~ ${request.endDate.toISOString().slice(0, 10)}`,
		productTitle: request.product.title,
		status: RENTAL_STATUS.CANCELED,
		totalPrice: request.totalPrice,
	};
};

export const refundRentalRequest = async (rentalRequestId, refundMemo, rejectByAdmin = false) => {
	try {
		const rentalRequest = await getRentalRequestById(rentalRequestId);
		if (!rentalRequest) {
			throw new CustomError(404, "RENTAL_NOT_FOUND", RENTAL_REQUEST_MESSAGES.RENTAL_NOT_FOUND);
		}
		if (rentalRequest.status === "REJECTED" || rentalRequest.status === "CANCELED") {
			throw new CustomError(400, "ALREADY_REJECTED_OR_CANCELED", "이미 거절/취소된 대여요청입니다.");
		}
		
		const result = await refundRentalRequestRepo({ rentalRequestId, refundMemo, rejectByAdmin });

		if (rejectByAdmin) {
			await createNotification({
				userId: result.user.id,
				type: "RENTAL_STATUS",
				message: `${NOTIFICATION_MESSAGES.RENTAL_REJECTED} [${result.product.title}]`,
				url: `/rental-requests/${rentalRequestId}`,
				rentalRequestId,
			});
		}

		return {
			rentalRequestId,
			refundedAmount: result.refundedAmount,
			status: result.rentalRequest.status,
		};
	} catch (err) {
		if (err.code === "P2025" || err.message === "RENTAL_NOT_FOUND") {
			throw new CustomError(404, "RENTAL_NOT_FOUND", RENTAL_REQUEST_MESSAGES.RENTAL_NOT_FOUND);
		}
		throw err;
	}
};
