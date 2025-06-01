import {
  createMessage,
  findReceivedMessages,
  findSentMessages,
  markAsRead,
  markAllAsRead,
  softDeleteMessage,
  getAdminId,
} from "../repositories/message.repository.js";
import CustomError from "../utils/customError.js";
import { MESSAGE_RESPONSES } from "../constants/messages.js";
import { getProductById } from "../repositories/product.repository.js";
import { createNotification } from "./notification.service.js";
import { NOTIFICATION_MESSAGES } from "../constants/messages.js";
import { findUserById } from "../repositories/user.repository.js";

//메세지 전송
export const sendMessage = async ({ senderId, receiverId, content, productId, senderRole }) => {
  if (!content || !receiverId) {
    throw new CustomError(400, "INVALID_MESSAGE", "내용과 수신자를 입력하세요.");
  }

  // productId 유효성 체크
  if (productId) {
    const product = await getProductById(productId);
    if (!product) {
      throw new CustomError(400, "PRODUCT_NOT_FOUND", "존재하지 않는 상품입니다.");
    }
  }

  let adminId;
  try {
    adminId = await getAdminId();
  } catch {
    throw new CustomError(500, "ADMIN_NOT_FOUND", "운영자 계정이 존재하지 않습니다.");
  }

  // USER → ADMIN만 허용
  if (senderRole === "USER") {
    if (receiverId !== adminId) {
      throw new CustomError(403, "FORBIDDEN", "운영자에게만 문의할 수 있습니다.");
    }
  }
  // ADMIN → USER만 허용
  else if (senderRole === "ADMIN") {
    const user = await findUserById(receiverId);
    if (!user || user.role !== "USER") {
      throw new CustomError(403, "FORBIDDEN", "유저에게만 답변할 수 있습니다.");
    }
  } else {
    throw new CustomError(403, "FORBIDDEN", "권한이 없습니다.");
  }

  const message = await createMessage({ senderId, receiverId, content, productId });

  // === 운영자가 유저에게 보낼 때만 알림 생성 ===
  if (senderRole === "ADMIN") {
    await createNotification({
      userId: receiverId,
      type: "CHAT",
      message: NOTIFICATION_MESSAGES.ADMIN_MESSAGE,
      url: `/messages/${message.id}`,
      messageId: message.id,
      productId: productId || undefined,
    });
  }

  return {
    message: MESSAGE_RESPONSES.SEND_SUCCESS,
    data: { id: message.id }
  };
};

//받은 목록조회
export const getReceivedMessages = async (userId, userRole) => {
  let adminId;
  try {
    adminId = await getAdminId();
  } catch {
    throw new CustomError(500, "ADMIN_NOT_FOUND", "운영자 계정이 존재하지 않습니다.");
  }
  let messages = await findReceivedMessages(userId);
  if (userRole === "USER") {
    messages = messages.filter(msg => msg.sender.id === adminId);
  } else if (userRole === "ADMIN") {
    messages = messages.filter(msg => msg.sender.id !== adminId); // ADMIN이 보낸 메시지는 제외
  } else {
    throw new CustomError(403, "FORBIDDEN", "권한이 없습니다.");
  }
  return {
    message: MESSAGE_RESPONSES.FETCH_SUCCESS,
    data: messages
  };
};

// 보낸목록조회
export const getSentMessages = async (userId, userRole) => {
  let adminId;
  try {
    adminId = await getAdminId();
  } catch {
    throw new CustomError(500, "ADMIN_NOT_FOUND", "운영자 계정이 존재하지 않습니다.");
  }
  let messages = await findSentMessages(userId);
  if (userRole === "USER") {
    messages = messages.filter(msg => msg.receiver.id === adminId);
  } else if (userRole === "ADMIN") {
    messages = messages.filter(msg => msg.receiver.id !== adminId); // ADMIN이 보낸 메시지는 제외
  } else {
    throw new CustomError(403, "FORBIDDEN", "권한이 없습니다.");
  }
  return {
    message: MESSAGE_RESPONSES.FETCH_SUCCESS,
    data: messages
  };
};

// 단건읽음하기 
export const markMessageRead = async (messageId, userId, userRole) => {
  const result = await markAsRead(messageId, userId);
  if (result.count === 0) {
    throw new CustomError(404, "MESSAGE_NOT_FOUND", "메시지를 찾을 수 없거나 권한이 없습니다.");
  }
  return {
    message: MESSAGE_RESPONSES.MARK_READ
  };
};

// 전체읽음하기 
export const markAllMessagesRead = async (userId, userRole) => {
  await markAllAsRead(userId);
  return {
    message: MESSAGE_RESPONSES.MARK_READ
  };
};

export const deleteMessage = async (messageId, userId, userRole) => {
  const result = await softDeleteMessage(messageId, userId);
  if (result.count === 0) {
    throw new CustomError(404, "MESSAGE_NOT_FOUND", "메시지를 찾을 수 없거나 권한이 없습니다.");
  }
  return {
    message: MESSAGE_RESPONSES.DELETE_SUCCESS
  };
};
