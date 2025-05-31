import {
	createRentalRequestRepo,
	findMyRentalRequestsRepo,
	findPendingRequestsRepo,
	updateRentalRequestStatusRepo,
	checkRentalDateConflict,
	findProductTitleById,
	findRentalRequestSummaryById,
	getRentalRequestById,
} from "../repositories/rentalRequest.repository.js";
import { RENTAL_STATUS } from "../constants/status.js";
import { ERROR_MESSAGES, NOTIFICATION_MESSAGES } from "../constants/messages.js";
import { getProductById } from "../repositories/product.repository.js";
import CustomError from "../utils/customError.js";
import { createNotification } from "./notification.service.js";

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
		throw new CustomError(400, "INVALID_RENTAL_DATE", ERROR_MESSAGES.INVALID_RENTAL_DATE);
	  }
	  
	if (new Date(startDate) > oneMonthLater) {
		throw new CustomError(400, "RENTAL_DATE_LIMIT", "예약 시작일은 30일 이내여야 합니다.");
	}

	// 날짜 중복 체크
	const conflict = await checkRentalDateConflict(productId, startDate, endDate);
	if (conflict) throw new CustomError(400, "RENTAL_DATE_CONFLICT", ERROR_MESSAGES.RENTAL_DATE_CONFLICT);

	if (!howToReceive) throw new CustomError(400, "RECEIVE_METHOD_REQUIRED", "수령 방법을 선택해주세요.");

	const product = await getProductById(productId);
	if (!product) throw new CustomError(404, "PRODUCT_NOT_FOUND", ERROR_MESSAGES.PRODUCT_NOT_FOUND);

	const dayCount = Math.ceil(
		(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
	);
	const totalPrice = product.price * dayCount;

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
		if (!updated) throw new CustomError(404, "RENTAL_NOT_FOUND", ERROR_MESSAGES.RENTAL_NOT_FOUND);
		const summary = await findRentalRequestSummaryById(id);
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
			throw new CustomError(404, "RENTAL_NOT_FOUND", ERROR_MESSAGES.RENTAL_NOT_FOUND);
		}
		throw err;
	}
};

export const rejectRentalRequest = async (id) => {
	try {
		const updated = await updateRentalRequestStatusRepo(id, RENTAL_STATUS.REJECTED);
		if (!updated) throw new CustomError(404, "RENTAL_NOT_FOUND", ERROR_MESSAGES.RENTAL_NOT_FOUND);
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
			throw new CustomError(404, "RENTAL_NOT_FOUND", ERROR_MESSAGES.RENTAL_NOT_FOUND);
		}
		throw err;
	}
};

export const cancelRentalRequest = async (id, userId) => {
	const request = await getRentalRequestById(id);
	if (!request) throw new CustomError(404, "RENTAL_NOT_FOUND", ERROR_MESSAGES.RENTAL_NOT_FOUND);
	if (request.userId !== userId) throw new CustomError(403, "NO_PERMISSION", ERROR_MESSAGES.NO_PERMISSION);
	if (![RENTAL_STATUS.PENDING, RENTAL_STATUS.APPROVED].includes(request.status)) {
		throw new CustomError(400, "RENTAL_CANCEL_NOT_ALLOWED", "해당 상태에서는 취소할 수 없습니다.");
	}
	// 3일전 취소 불가
	const now = new Date();
	const startDate = new Date(request.startDate);
	const diffDays = (startDate - now) / (1000 * 60 * 60 * 24);
	if (diffDays < 3) {
		throw new CustomError(400, "RENTAL_CANCEL_TOO_LATE", "대여 시작 3일 전부터는 취소가 불가합니다.");
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
