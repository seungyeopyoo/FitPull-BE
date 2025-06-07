import {
	createRentalRequest,
	getMyRentalRequests,
	getPendingRequests,
	approveRentalRequest,
	rejectRentalRequest,
	cancelRentalRequest,
	createRentalRequestWithPayment,
	refundRentalRequest,
} from "../services/rentalRequest.service.js";
import { success } from "../utils/responseHandler.js";
import {RENTAL_REQUEST_MESSAGES} from "../constants/messages.js";

export const createRentalRequestController = async (req, res, next) => {
	try {
		const { productId, startDate, endDate, howToReceive, memo } = req.body;
		const user = req.user;
		const rentalRequest = await createRentalRequest(
			productId,
			startDate,
			endDate,
			user.id,
			howToReceive,
			memo
		);
		return success(res, RENTAL_REQUEST_MESSAGES.RENTAL_REQUEST_CREATED, { rentalRequest });
	} catch (error) {
		next(error);
	}
};

export const getMyRentalRequestsController = async (req, res, next) => {
	try {
		const myRequests = await getMyRentalRequests(req.user.id);
		return success(res, RENTAL_REQUEST_MESSAGES.RENTAL_MY_LISTED, { requests: myRequests });
	} catch (error) {
		next(error);
	}
};

export const getPendingRequestsController = async (_req, res, next) => {
	try {
		const requests = await getPendingRequests();
		return success(res, RENTAL_REQUEST_MESSAGES.RENTAL_PENDING_LISTED, { requests });
	} catch (error) {
		next(error);
	}
};

export const approveRentalRequestController = async (req, res, next) => {
	try {
		const request = await approveRentalRequest(req.params.id);
		return success(res, RENTAL_REQUEST_MESSAGES.RENTAL_APPROVED, { request });
	} catch (error) {
		next(error);
	}
};

export const rejectRentalRequestController = async (req, res, next) => {
	try {
		const request = await refundRentalRequest(req.params.id, "[관리자거절]", true);
		return success(res, RENTAL_REQUEST_MESSAGES.RENTAL_REJECTED, { request });
	} catch (error) {
		next(error);
	}
};

export const cancelRentalRequestController = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;
		const request = await refundRentalRequest(id, "[유저취소]", false);
		return success(res, RENTAL_REQUEST_MESSAGES.RENTAL_CANCELED, { request });
	} catch (error) {
		next(error);
	}
};

export const createRentalRequestWithPaymentController = async (req, res, next) => {
	try {
		const { productId, startDate, endDate, howToReceive, memo } = req.body;
		const userId = req.user.id;
		const rentalRequest = await createRentalRequestWithPayment(
			productId,
			startDate,
			endDate,
			userId,
			howToReceive,
			memo
		);
		return success(res, RENTAL_REQUEST_MESSAGES.RENTAL_REQUEST_CREATED, { rentalRequest });
	} catch (error) {
		next(error);
	}
};
