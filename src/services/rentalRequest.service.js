import {
	createRentalRequestRepo,
	findMyRentalRequestsRepo,
	findPendingRequestsRepo,
	updateRentalRequestStatusRepo,
	checkRentalDateConflict,
	findProductTitleById,
	findRentalRequestSummaryById,
	getRentalRequestById,
	createRentalRequestWithPaymentRepo,
} from "../repositories/rentalRequest.repository.js";
import { RENTAL_STATUS } from "../constants/status.js";
import { RENTAL_REQUEST_MESSAGES, NOTIFICATION_MESSAGES } from "../constants/messages.js";
import { getProductById } from "../repositories/product.repository.js";
import CustomError from "../utils/customError.js";
import { createNotification } from "./notification.service.js";
import { RENTAL_DISCOUNT } from "../constants/rentalDiscount.js";
import { findUserById } from "../repositories/user.repository.js";


export const createRentalRequest = async (
	productId,
	startDate,
	endDate,
	userId,
	howToReceive,
	memo
) => {
	// 예약일 30일 제한
	const now = new Date();
	const oneMonthLater = new Date();
	oneMonthLater.setDate(now.getDate() + 30);

	  // 날짜 유효성 체크
	  if (new Date(endDate) <= new Date(startDate)) {
		throw new CustomError(400, "INVALID_RENTAL_DATE", RENTAL_REQUEST_MESSAGES.INVALID_RENTAL_DATE);
	  }
	  
	if (new Date(startDate) > oneMonthLater) {
		throw new CustomError(400, "RENTAL_DATE_LIMIT", RENTAL_REQUEST_MESSAGES.START_DATE_LIMIT);
	}

	// 날짜 중복 체크
	const conflict = await checkRentalDateConflict(productId, startDate, endDate);
	if (conflict) throw new CustomError(400, "RENTAL_DATE_CONFLICT", RENTAL_REQUEST_MESSAGES.RENTAL_DATE_CONFLICT);

	if (!howToReceive) throw new CustomError(400, "RECEIVE_METHOD_REQUIRED", RENTAL_REQUEST_MESSAGES.RECEIVE_METHOD_REQUIRED);

	const product = await getProductById(productId);
	if (!product) throw new CustomError(404, "PRODUCT_NOT_FOUND", RENTAL_REQUEST_MESSAGES.PRODUCT_NOT_FOUND);

	const dayCount = Math.ceil(
		(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
	);
	let totalPrice = product.price * dayCount;
	
	// 할인 정책 적용
	const discountPolicy = RENTAL_DISCOUNT.find(policy => dayCount >= policy.minDays);
	if (discountPolicy) {
		totalPrice *= discountPolicy.rate;
	}
	totalPrice = Math.round(totalPrice); 

	const rentalRequest = await createRentalRequestRepo(
		productId,
		startDate,
		endDate,
		userId,
		totalPrice,
		howToReceive,
		memo
	  );

	const title = await findProductTitleById(productId);

	return {
		id: rentalRequest.id,
		rentalPeriod: `${startDate} ~ ${endDate}`,
		productTitle: title,
		howToReceive: howToReceive,
		totalPrice: totalPrice,
		memo: memo,
	};
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
	await updateRentalRequestStatusRepo(id, RENTAL_STATUS.REJECTED);
	return {
		id,
		rentalPeriod: `${request.startDate.toISOString().slice(0, 10)} ~ ${request.endDate.toISOString().slice(0, 10)}`,
		productTitle: request.product.title,
		status: RENTAL_STATUS.REJECTED,
		totalPrice: request.totalPrice,
	};
};

export const createRentalRequestWithPayment = async (
	productId,
	startDate,
	endDate,
	userId,
	howToReceive,
	memo
) => {
	const user = await findUserById(userId);
	if (!user) throw new CustomError(404, "USER_NOT_FOUND", RENTAL_REQUEST_MESSAGES.USER_NOT_FOUND);

	const product = await getProductById(productId);
	if (!product) throw new CustomError(404, "PRODUCT_NOT_FOUND", RENTAL_REQUEST_MESSAGES.PRODUCT_NOT_FOUND);

	const dayCount = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
	let totalPrice = product.price * dayCount;

	if (user.balance < totalPrice) {
		throw new CustomError(400, "INSUFFICIENT_BALANCE", RENTAL_REQUEST_MESSAGES.INSUFFICIENT_BALANCE);
	}

	const rentalRequest = await createRentalRequestWithPaymentRepo({
		userId,
		productId,
		startDate,
		endDate,
		howToReceive,
		memo,
		totalPrice,
		balanceBefore: user.balance,
		balanceAfter: user.balance - totalPrice,
		productTitle: product.title,
	});

	return rentalRequest;
};
