import {
	createRentalRequest,
	getMyRentalRequests,
	getPendingRequests,
	approveRentalRequest,
	rejectRentalRequest,
} from "../services/rentalRequest.service.js";

export const createRentalRequestController = async (req, res) => {
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
		res.status(201).json(rentalRequest);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const getMyRentalRequestsController = async (req, res) => {
	try {
		const myRequests = await getMyRentalRequests(req.user.id);
		res.json(myRequests);
	} catch (error) {
		res.status(500).json({ message: "예약 목록 조회 실패" });
	}
};

export const getPendingRequestsController = async (_req, res) => {
	try {
		const requests = await getPendingRequests();
		res.json(requests);
	} catch (error) {
		res.status(500).json({ message: "대기중 요청 조회 실패" });
	}
};

export const approveRentalRequestController = async (req, res) => {
	try {
		const request = await approveRentalRequest(req.params.id);
		res.json({ message: "승인되었습니다.", request });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const rejectRentalRequestController = async (req, res) => {
	try {
		const request = await rejectRentalRequest(req.params.id);
		res.json({ message: "거절되었습니다.", request });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};
