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

export const findAnyByEmail = async (email) => {
	return await prisma.account.findFirst({
		where: { email },
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

export const restoreAccountByEmail = async (email, passwordHash) => {
	
	const account = await prisma.account.findFirst({
		where: { email },
		include: { user: true },
	});
	if (!account) throw new Error("Account not found");

	
	return await prisma.account.update({
		where: { id: account.id },
		data: {
			deletedAt: null,
			passwordHash,
			verifiedEmail: true,
			user: { update: { deletedAt: null } }
		},
		include: { user: true },
	});
};
