import prisma from "../data-source.js";

export const findUserById = async (userId) => {
	return await prisma.user.findUnique({
		where: { id: userId },
	});
};

export const updateUserById = async (userId, updateData) => {
	return await prisma.user.update({
		where: { id: userId },
		data: updateData,
	});
};

export const softDeleteUserById = async (userId) => {
	return await prisma.user.update({
		where: { id: userId },
		data: {
			deletedAt: new Date(),
		},
	});
};
