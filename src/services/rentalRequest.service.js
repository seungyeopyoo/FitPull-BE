import {
	createRentalRequestRepo,
	findMyRentalRequestsRepo,
	findPendingRequestsRepo,
	updateRentalRequestStatusRepo,
	checkRentalDateConflict,
	findProductTitleById,
	findRentalRequestSummaryById,
} from "../repositories/rentalRequest.repository.js";

export const createRentalRequest = async (
	productId,
	startDate,
	endDate,
	userId,
) => {
	const conflict = await checkRentalDateConflict(productId, startDate, endDate);
	if (conflict) throw new Error("해당 기간은 이미 예약되어 있습니다.");

	await createRentalRequestRepo(productId, startDate, endDate, userId);

	const title = await findProductTitleById(productId);

	return {
		rentalPeriod: `${startDate} ~ ${endDate}`,
		productTitle: title,
	};
};

export const getMyRentalRequests = async (userId) => {
	const requests = await findMyRentalRequestsRepo(userId);

	return requests.map((r) => ({
		rentalPeriod: `${r.startDate.toISOString().slice(0, 10)} ~ ${r.endDate.toISOString().slice(0, 10)}`,
		productTitle: r.product.title,
		status: r.status,
	}));
};

export const getPendingRequests = async () => {
	const requests = await findPendingRequestsRepo();

	return requests.map((r) => ({
		id: r.id,
		rentalPeriod: `${r.startDate.toISOString().slice(0, 10)} ~ ${r.endDate.toISOString().slice(0, 10)}`,
		productTitle: r.product.title,
		userName: r.user.name,
		userPhone: r.user.phone,
		status: r.status,
	}));
};

export const approveRentalRequest = async (id) => {
	await updateRentalRequestStatusRepo(id, "APPROVED");
	return await findRentalRequestSummaryById(id);
};

export const rejectRentalRequest = async (id) => {
	await updateRentalRequestStatusRepo(id, "REJECTED");
	return await findRentalRequestSummaryById(id);
};
