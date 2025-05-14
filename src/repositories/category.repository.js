import prisma from "../data-source.js";

export const findAll = () => {
	return prisma.category.findMany({ orderBy: { id: "asc" } });
};

export const create = (name) => {
	return prisma.category.create({ data: { name } });
};

export const update = (id, name) => {
	return prisma.category.update({
		where: { id },
		data: { name },
	});
};

export const remove = (id) => {
	return prisma.category.delete({
		where: { id },
	});
};
