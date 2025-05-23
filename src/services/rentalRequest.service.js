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
import { ERROR_MESSAGES } from "../constants/messages.js";
import { getProductById } from "../repositories/product.repository.js";

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
	if (new Date(startDate) > oneMonthLater) {
		throw new Error("예약 시작일은 30일 이내여야 합니다.");
	}

	// 날짜 중복 체크
	const conflict = await checkRentalDateConflict(productId, startDate, endDate);
	if (conflict) throw new Error(ERROR_MESSAGES.RENTAL_DATE_CONFLICT);

	if (!howToReceive) throw new Error("수령 방법을 선택해주세요.");

	const product = await getProductById(productId);
	if (!product) throw new Error("상품을 찾을 수 없습니다.");

	const dayCount = Math.ceil(
		(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
	);
	const totalPrice = product.price * dayCount;

	await createRentalRequestRepo(
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
	}));
};

export const approveRentalRequest = async (id) => {
	await updateRentalRequestStatusRepo(id, RENTAL_STATUS.APPROVED);
	return await findRentalRequestSummaryById(id);
};

export const rejectRentalRequest = async (id) => {
	await updateRentalRequestStatusRepo(id, RENTAL_STATUS.REJECTED);
	return await findRentalRequestSummaryById(id);
};

export const cancelRentalRequest = async (id, userId) => {
	const request = await getRentalRequestById(id);
	if (!request) throw new Error("요청 정보를 찾을 수 없습니다.");
	if (request.userId !== userId) throw new Error("본인 요청만 취소할 수 있습니다.");
	if (![RENTAL_STATUS.PENDING, RENTAL_STATUS.APPROVED].includes(request.status)) {
		throw new Error("해당 상태에서는 취소할 수 없습니다.");
	}
	// 3일전 취소 불가
	const now = new Date();
	const startDate = new Date(request.startDate);
	const diffDays = (startDate - now) / (1000 * 60 * 60 * 24);
	if (diffDays < 3) {
		throw new Error("대여 시작 3일 전부터는 취소가 불가합니다.");
	}
	await updateRentalRequestStatusRepo(id, RENTAL_STATUS.REJECTED);
	return {
		rentalPeriod: `${request.startDate.toISOString().slice(0, 10)} ~ ${request.endDate.toISOString().slice(0, 10)}`,
		productTitle: request.product.title,
		status: RENTAL_STATUS.REJECTED,
	};
};
