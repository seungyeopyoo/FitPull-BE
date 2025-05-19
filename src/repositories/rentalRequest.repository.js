import prisma from "../data-source.js";

export const createRentalRequestRepo = async (
	productId,
	startDate,
	endDate,
	userId,
) => {
	return await prisma.rentalRequest.create({
		data: {
			productId,
			userId,
			startDate: new Date(startDate),
			endDate: new Date(endDate),
		},
	});
};

export const findProductTitleById = async (productId) => {
	const product = await prisma.product.findUnique({
		where: { id: productId },
		select: { title: true },
	});

	return product?.title ?? "제목 없음";
};

export const findMyRentalRequestsRepo = async (userId) => {
	return await prisma.rentalRequest.findMany({
		where: { userId, deletedAt: null },
		include: {
			product: true,
		},
		orderBy: { createdAt: "desc" },
	});
};

export const findPendingRequestsRepo = async () => {
	return await prisma.rentalRequest.findMany({
		where: { status: "PENDING", deletedAt: null },
		include: {
			product: true,
			user: {
				select: { id: true, name: true, phone: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});
};

export const updateRentalRequestStatusRepo = async (id, status) => {
	return await prisma.rentalRequest.update({
		where: { id },
		data: { status },
	});
};

export const checkRentalDateConflict = async (
	productId,
	startDate,
	endDate,
) => {
	const overlapping = await prisma.rentalRequest.findFirst({
		where: {
			productId,
			status: "APPROVED",
			OR: [
				{
					startDate: { lte: new Date(endDate) },
					endDate: { gte: new Date(startDate) },
				},
			],
		},
	});

	return overlapping !== null;
};

export const findRentalRequestSummaryById = async (id) => {
	const request = await prisma.rentalRequest.findUnique({
		where: { id },
		include: {
			product: { select: { title: true } },
			user: { select: { name: true } },
		},
	});

	if (!request) throw new Error("요청 정보를 찾을 수 없습니다.");

	return {
		rentalPeriod: `${request.startDate.toISOString().slice(0, 10)} ~ ${request.endDate.toISOString().slice(0, 10)}`,
		productTitle: request.product.title,
		userName: request.user.name,
		status: request.status,
	};
};

export const getRentalRequestById = async (id) => {
	return await prisma.rentalRequest.findUnique({
		where: { id },
	});
};
