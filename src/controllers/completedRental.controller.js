import {
	completeRentalService,
	getMyCompletedRentals,
	getAllCompletedRentals,
} from "../services/completedRental.service.js";

export const completeRental = async (req, res) => {
	try {
		const rentalRequestId = req.params.id;
		const completed = await completeRentalService(rentalRequestId);
		res.status(201).json({ message: "대여 완료 처리됨", result: completed });
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

export const getMyCompletedRentalsController = async (req, res) => {
	try {
		const result = await getMyCompletedRentals(req.user.id);

		if (result.length === 0) {
			return res.status(200).json({ message: "조회된 대여 내역이 없습니다." });
		}

		res.json(result);
	} catch (err) {
		res.status(500).json({ message: "조회 실패", error: err.message });
	}
};

export const getAllCompletedRentalsController = async (_req, res) => {
	try {
		const result = await getAllCompletedRentals();

		if (result.length === 0) {
			return res.status(200).json({ message: "완료된 대여가 없습니다." });
		}

		res.json(result);
	} catch (err) {
		res.status(500).json({ message: "조회 실패", error: err.message });
	}
};
