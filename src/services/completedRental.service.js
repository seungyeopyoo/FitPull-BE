import {
	createCompletedRentalRepo,
	findCompletedRentalInfoByRequestId,
	findCompletedRentalsByUser,
	findAllCompletedRentals,
} from "../repositories/completedRental.repository.js";
import { getRentalRequestById } from "../repositories/rentalRequest.repository.js";
import { getProductById } from "../repositories/product.repository.js";

export const completeRentalService = async (rentalRequestId) => {
	const rental = await getRentalRequestById(rentalRequestId);
	if (!rental) throw new Error("대여 요청을 찾을 수 없습니다.");
	if (rental.status !== "APPROVED")
		throw new Error("승인된 요청만 완료할 수 있습니다.");

	const product = await getProductById(rental.productId);
	const pricePerDay = product.price;

	const days = Math.ceil(
		(rental.endDate - rental.startDate) / (1000 * 60 * 60 * 24),
	);
	const totalPrice = pricePerDay * days;

	await createCompletedRentalRepo({
		rentalRequestId,
		userId: rental.userId,
		productId: rental.productId,
		startDate: rental.startDate,
		endDate: rental.endDate,
		totalPrice,
	});

	return await findCompletedRentalInfoByRequestId(rentalRequestId);
};

export const getMyCompletedRentals = async (userId) => {
	const rentals = await findCompletedRentalsByUser(userId);

	return rentals.map((rental) => ({
		productTitle: rental.product.title,
		rentalPeriod: `${rental.startDate.toISOString().slice(0, 10)} ~ ${rental.endDate.toISOString().slice(0, 10)}`,
		totalPrice: rental.totalPrice,
	}));
};

export const getAllCompletedRentals = async () => {
	const rentals = await findAllCompletedRentals();

	return rentals.map((rental) => ({
		productTitle: rental.product.title,
		userName: rental.user.name,
		userPhone: rental.user.phone,
		rentalPeriod: `${rental.startDate.toISOString().slice(0, 10)} ~ ${rental.endDate.toISOString().slice(0, 10)}`,
		totalPrice: rental.totalPrice,
	}));
};
