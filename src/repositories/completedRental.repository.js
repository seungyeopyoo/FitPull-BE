import prisma from "../data-source.js";

export const createCompletedRentalRepo = async ({
	rentalRequestId,
	userId,
	productId,
	startDate,
	endDate,
	totalPrice,
}) => {
	return await prisma.completedRental.create({
		data: {
			rentalRequestId,
			userId,
			productId,
			startDate,
			endDate,
			totalPrice,
		},
	});
};

export const findCompletedRentalInfoByRequestId = async (rentalRequestId) => {
	const result = await prisma.completedRental.findUnique({
		where: { rentalRequestId },
		include: {
			user: { select: { name: true, phone: true } },
			product: { select: { title: true } },
		},
	});
	if (!result) throw new Error("완료된 대여 정보를 찾을 수 없습니다.");

	return {
		productTitle: result.product.title,
		userName: result.user.name,
		userPhone: result.user.phone,
		rentalPeriod: `${result.startDate.toISOString().slice(0, 10)} ~ ${result.endDate.toISOString().slice(0, 10)}`,
		totalPrice: result.totalPrice,
	};
};

export const findCompletedRentalsByUser = async (userId) => {
	return await prisma.completedRental.findMany({
		where: {
			userId,
			deletedAt: null,
		},
		include: {
			product: {
				select: { title: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});
};

export const findAllCompletedRentals = async () => {
	return await prisma.completedRental.findMany({
		where: {
			deletedAt: null,
		},
		include: {
			product: {
				select: { title: true },
			},
			user: {
				select: { name: true, phone: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});
};
