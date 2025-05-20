import {
	createRentalRequestRepo,
	findMyRentalRequestsRepo,
	findPendingRequestsRepo,
	updateRentalRequestStatusRepo,
	checkRentalDateConflict,
	findProductTitleById,
	findRentalRequestSummaryById,
} from "../repositories/rentalRequest.repository.js";
import { RENTAL_STATUS } from "../constants/status.js";
import { ERROR_MESSAGES } from "../constants/messages.js";

export const createRentalRequest = async (
	productId,
	startDate,
	endDate,
	userId,
) => {
	const conflict = await checkRentalDateConflict(productId, startDate, endDate);
	if (conflict) throw new Error(ERROR_MESSAGES.RENTAL_DATE_CONFLICT);

	await createRentalRequestRepo(productId, startDate, endDate, userId);

	const title = await findProductTitleById(productId);

	return {
		rentalPeriod: `${startDate} ~ ${endDate}`,
		productTitle: title,
	};
};

export const getMyRentalRequests = async (userId) => {
	const requests = await findMyRentalRequestsRepo(userId);

	return requests.map((request) => ({
		rentalPeriod: `${request.startDate.toISOString().slice(0, 10)} ~ ${request.endDate.toISOString().slice(0, 10)}`,
		productTitle: request.product.title,
		status: request.status,
	}));
};

export const getPendingRequests = async () => {
	const requests = await findPendingRequestsRepo();

	return requests.map((request) => ({
		id: request.id,
		rentalPeriod: `${request.startDate.toISOString().slice(0, 10)} ~ ${request.endDate.toISOString().slice(0, 10)}`,
		productTitle: request.product.title,
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
