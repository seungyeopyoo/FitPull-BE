import {
	createRentalRequest,
	getMyRentalRequests,
	getPendingRequests,
	approveRentalRequest,
	rejectRentalRequest,
	cancelRentalRequest,
} from "../services/rentalRequest.service.js";
import { success } from "../utils/responseHandler.js";
import { SUCCESS_MESSAGES } from "../constants/messages.js";

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
		return success(res, SUCCESS_MESSAGES.RENTAL_REQUEST_CREATED, { rentalRequest });
	} catch (error) {
		next(error);
	}
};

export const getMyRentalRequestsController = async (req, res, next) => {
	try {
		const myRequests = await getMyRentalRequests(req.user.id);
		return success(res, SUCCESS_MESSAGES.RENTAL_MY_LISTED, { requests: myRequests });
	} catch (error) {
		next(error);
	}
};

export const getPendingRequestsController = async (_req, res, next) => {
	try {
		const requests = await getPendingRequests();
		return success(res, SUCCESS_MESSAGES.RENTAL_PENDING_LISTED, { requests });
	} catch (error) {
		next(error);
	}
};

export const approveRentalRequestController = async (req, res, next) => {
	try {
		const request = await approveRentalRequest(req.params.id);
		return success(res, SUCCESS_MESSAGES.RENTAL_APPROVED, { request });
	} catch (error) {
		next(error);
	}
};

export const rejectRentalRequestController = async (req, res, next) => {
	try {
		const request = await rejectRentalRequest(req.params.id);
		return success(res, SUCCESS_MESSAGES.RENTAL_REJECTED, { request });
	} catch (error) {
		next(error);
	}
};

export const cancelRentalRequestController = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;
		const request = await cancelRentalRequest(id, userId);
		return success(res, SUCCESS_MESSAGES.RENTAL_CANCELED, { request });
	} catch (error) {
		next(error);
	}
};
