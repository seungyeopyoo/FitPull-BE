import prisma from "../data-source.js";

export const createNotificationRepo = async (data) => {
  return await prisma.notification.create({ data });
};

export const getNotificationsByUserRepo = async (userId) => {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10, // 최근 10개까지 (옵션)
    });
  };

  export const markNotificationAsReadRepo = async (id) => {
    return await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  };