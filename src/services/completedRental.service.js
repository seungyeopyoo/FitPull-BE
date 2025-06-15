import {
	createCompletedRentalRepo,
	findCompletedRentalsByUser,
	findAllCompletedRentals,
	findCompletedRentalByRequestId,
} from "../repositories/completedRental.repository.js";
import { getRentalRequestById } from "../repositories/rentalRequest.repository.js";
import { getProductById } from "../repositories/product.repository.js";
import CustomError from "../utils/customError.js";
import { COMPLETED_RENTAL_MESSAGES , PLATFORM_MESSAGES} from "../constants/messages.js";
import { createNotification } from "./notification.service.js";
import { NOTIFICATION_MESSAGES } from "../constants/messages.js";
import prisma from "../data-source.js";

export const completeRental = async (rentalRequestId) => {
	const rental = await getRentalRequestById(rentalRequestId);
	if (!rental) throw new CustomError(404, "RENTAL_NOT_FOUND", COMPLETED_RENTAL_MESSAGES.RENTAL_NOT_FOUND);
	if (rental.status !== "APPROVED")
		throw new CustomError(400, "RENTAL_NOT_APPROVED", COMPLETED_RENTAL_MESSAGES.RENTAL_NOT_APPROVED);

	const product = await getProductById(rental.productId);
	const pricePerDay = Number(product.price);
	const owner = product.owner;

	const days = Math.ceil(
		(rental.endDate - rental.startDate) / (1000 * 60 * 60 * 24),
	);
	const totalPrice = pricePerDay * days;

	const alreadyCompleted = await findCompletedRentalByRequestId(rentalRequestId);
	if (alreadyCompleted) {
		return { message: COMPLETED_RENTAL_MESSAGES.ALREADY_COMPLETED };
	}

	const completedRental = await prisma.$transaction(async (tx) => {
		// 1. CompletedRental 생성
	const created = await tx.completedRental.create({
			data: {
					rentalRequestId,
				userId: rental.userId,
				productId: rental.productId,
				startDate: rental.startDate,
				endDate: rental.endDate,
				totalPrice,
			},
		});

				// 2. 소유주 잔액 증가
	const updatedOwner = await tx.user.update({
					where: { id: owner.id },
					data: { balance: { increment: totalPrice } },
					select: { balance: true },
				});

						// 3. 유저 수익 로그
		await tx.paymentLog.create({
			data: {
				userId: owner.id,
				rentalRequestId,
				amount: totalPrice,
				paymentType: "OWNER_PROFIT",
				memo: `[자동] ${product.title} 대여 수익`,
				balanceBefore: owner.balance,
				balanceAfter: updatedOwner.balance,
				paidAt: new Date(),
			},
		});

				// 4. 플랫폼 계정 조회 + 잔액 감소
				const platform = await tx.platformAccount.findFirst();
				if (!platform) throw new CustomError(500, "PLATFORM_ACCOUNT_NOT_FOUND", PLATFORM_MESSAGES.PLATFORM_ACCOUNT_NOT_FOUND);
		
				const platformBalanceBefore = platform.balance;
				const platformBalanceAfter = platformBalanceBefore - totalPrice;
		
				if (platformBalanceAfter < 0) {
					throw new CustomError(422, "INSUFFICIENT_PLATFORM_BALANCE", "플랫폼 잔액이 부족합니다.");
				}
		
				await tx.platformAccount.update({
					where: { id: platform.id },
					data: { balance: { decrement: totalPrice } },
				});

						// 5. 플랫폼 지출 로그
		await tx.platformPaymentLog.create({
			data: {
				platformAccountId: platform.id,
				type: "OWNER_PAYOUT",
				amount: totalPrice,
				memo: `[자동] 소유주 정산: ${product.title}`,
				balanceBefore: platformBalanceBefore,
				balanceAfter: platformBalanceAfter,
				rentalRequestId,
				userId: owner.id,
			},
		});

		return created;
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
