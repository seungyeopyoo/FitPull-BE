import prisma from "../data-source.js";

export const findByEmail = async (email) => {
	return await prisma.account.findFirst({
		where: {
			email,
			deletedAt: null,
			user: {
				deletedAt: null,
			},
		},
		include: { user: true },
	});
};

export const createUser = async ({ email, passwordHash, name, phone }) => {
	return await prisma.account.create({
		data: {
			provider: "LOCAL",
			email,
			passwordHash,
			user: {
				create: {
					name,
					phone,
				},
			},
		},
		include: { user: true },
	});
};
