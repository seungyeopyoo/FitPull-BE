import prisma from "../data-source.js";

export const findUserById = async (userId) => {
	return await prisma.user.findFirst({
		where: { id: userId, deletedAt: null },
	});
};

export const updateUserById = async (userId, updateData) => {
	return await prisma.user.update({
		where: { id: userId },
		data: updateData,
	});
};

export const softDeleteUserById = async (userId) => {
	await prisma.account.updateMany({
		where: { userId, deletedAt: null },
		data: { deletedAt: new Date() },
	  });
	  return await prisma.user.update({
		where: { id: userId },
		data: { deletedAt: new Date() },
	  });
};
