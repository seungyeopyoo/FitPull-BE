import { createNotificationRepo, getNotificationsByUserRepo, markNotificationAsReadRepo } from "../repositories/notification.repository.js";
import { sendNotification } from "../utils/notify.js";

// 알림 생성 및 실시간 전송
export const createNotification = async ({ userId, type, message, url, productId, rentalRequestId }) => {
  try {
    const notification = await createNotificationRepo({
      userId,
      type,
      message,
      url,
      productId,
      rentalRequestId,
    });

    sendNotification(userId, {
      id: notification.id,
      type,
      message,
      url,
      createdAt: notification.createdAt,
    });

    return notification;
  } catch (err) {
    throw err;
  }
};

export const getMyNotifications = async (userId) => {
    return await getNotificationsByUserRepo(userId);
  };

  export const markAsRead = async (id) => {
    return await markNotificationAsReadRepo(id);
  };