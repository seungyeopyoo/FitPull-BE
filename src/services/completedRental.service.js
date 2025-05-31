import {
	createCompletedRentalRepo,
	findCompletedRentalsByUser,
	findAllCompletedRentals,
	findCompletedRentalByRequestId,
} from "../repositories/completedRental.repository.js";
import { getRentalRequestById } from "../repositories/rentalRequest.repository.js";
import { getProductById } from "../repositories/product.repository.js";
import CustomError from "../utils/customError.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import { createNotification } from "./notification.service.js";
import { NOTIFICATION_MESSAGES } from "../constants/messages.js";

export const completeRental = async (rentalRequestId) => {
	const rental = await getRentalRequestById(rentalRequestId);
	if (!rental) throw new CustomError(404, "RENTAL_NOT_FOUND", ERROR_MESSAGES.RENTAL_NOT_FOUND);
	if (rental.status !== "APPROVED")
		throw new CustomError(400, "RENTAL_NOT_APPROVED", "승인된 요청만 완료할 수 있습니다.");

	const product = await getProductById(rental.productId);
	const pricePerDay = Number(product.price);

	const days = Math.ceil(
		(rental.endDate - rental.startDate) / (1000 * 60 * 60 * 24),
	);
	const totalPrice = pricePerDay * days;

	const alreadyCompleted = await findCompletedRentalByRequestId(rentalRequestId);
	if (alreadyCompleted) {
		return { message: "이미 완료된 대여입니다." };
	}

	const completedRental = await createCompletedRentalRepo({
		rentalRequestId,
		userId: rental.userId,
		productId: rental.productId,
		startDate: rental.startDate,
		endDate: rental.endDate,
		totalPrice: Number(totalPrice),
	});

	// === 리뷰 작성 요청 알림 ===
	await createNotification({
		userId: rental.userId,
		type: "REVIEW",
		message: `${NOTIFICATION_MESSAGES.REVIEW_REQUEST} [${product.title}]`,
		url: `/products/${product.id}`,
		productId: product.id,
		rentalRequestId: rentalRequestId,
	});

	return {
		completedRentalId: completedRental.id,
		rentalRequestId: completedRental.rentalRequestId,
		productTitle: rental.product.title,
		userName: rental.user.name,
		userPhone: rental.user.phone,
		rentalPeriod: `${rental.startDate.toISOString().slice(0, 10)} ~ ${rental.endDate.toISOString().slice(0, 10)}`,
		totalPrice: Number(totalPrice),
	};
};

export const getMyCompletedRentals = async (userId) => {
	const rentals = await findCompletedRentalsByUser(userId);

	return rentals.map((rental) => ({
		completedRentalId: rental.id,
		rentalRequestId: rental.rentalRequestId,
		productTitle: rental.product.title,
		rentalPeriod: `${rental.startDate.toISOString().slice(0, 10)} ~ ${rental.endDate.toISOString().slice(0, 10)}`,
		totalPrice: Number(rental.totalPrice),
	}));
};

export const getAllCompletedRentals = async () => {
	const rentals = await findAllCompletedRentals();

	return rentals.map((rental) => ({
		completedRentalId: rental.id,
		rentalRequestId: rental.rentalRequestId,
		productTitle: rental.product.title,
		userName: rental.user.name,
		userPhone: rental.user.phone,
		rentalPeriod: `${rental.startDate.toISOString().slice(0, 10)} ~ ${rental.endDate.toISOString().slice(0, 10)}`,
		totalPrice: Number(rental.totalPrice),
	}));
};
