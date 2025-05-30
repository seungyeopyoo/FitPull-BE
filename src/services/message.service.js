import * as messageRepo from "../repositories/message.repository.js";
import CustomError from "../utils/customError.js";
import { MESSAGE_RESPONSES } from "../constants/messages.js";

//메세지 전송
export const sendMessage = async ({ senderId, receiverId, content, productId, senderRole }) => {
  if (!content || !receiverId) {
    throw new CustomError(400, "INVALID_MESSAGE", "내용과 수신자를 입력하세요.");
  }

  let adminId;
  try {
    adminId = await messageRepo.getAdminId();
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
    const user = await messageRepo.getUserById(receiverId);
    if (!user || user.role !== "USER") {
      throw new CustomError(403, "FORBIDDEN", "유저에게만 답변할 수 있습니다.");
    }
  } else {
    throw new CustomError(403, "FORBIDDEN", "권한이 없습니다.");
  }

  const message = await messageRepo.createMessage({ senderId, receiverId, content, productId });
  return {
    message: MESSAGE_RESPONSES.SEND_SUCCESS,
    data: { id: message.id }
  };
};

//받은 목록조회
export const getReceivedMessages = async (userId, userRole) => {
  let adminId;
  try {
    adminId = await messageRepo.getAdminId();
  } catch {
    throw new CustomError(500, "ADMIN_NOT_FOUND", "운영자 계정이 존재하지 않습니다.");
  }
  let messages;
  if (userRole === "USER") {
    messages = await messageRepo.findReceivedMessages(userId);
    messages = messages.filter(msg => msg.sender.id === adminId);
  } else if (userRole === "ADMIN") {
    messages = await messageRepo.findReceivedMessages(userId);
    messages = messages.filter(msg => msg.sender.role === "USER");
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
    adminId = await messageRepo.getAdminId();
  } catch {
    throw new CustomError(500, "ADMIN_NOT_FOUND", "운영자 계정이 존재하지 않습니다.");
  }
  let messages;
  if (userRole === "USER") {
    messages = await messageRepo.findSentMessages(userId);
    messages = messages.filter(msg => msg.receiver.id === adminId);
  } else if (userRole === "ADMIN") {
    messages = await messageRepo.findSentMessages(userId);
    messages = messages.filter(msg => msg.receiver.role === "USER");
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
  const result = await messageRepo.markAsRead(messageId, userId);
  if (result.count === 0) {
    throw new CustomError(404, "MESSAGE_NOT_FOUND", "메시지를 찾을 수 없거나 권한이 없습니다.");
  }
  return {
    message: MESSAGE_RESPONSES.MARK_READ
  };
};

// 전체읽음하기 
export const markAllMessagesRead = async (userId, userRole) => {
  await messageRepo.markAllAsRead(userId);
  return {
    message: MESSAGE_RESPONSES.MARK_READ
  };
};

export const deleteMessage = async (messageId, userId, userRole) => {
  const result = await messageRepo.softDeleteMessage(messageId, userId);
  if (result.count === 0) {
    throw new CustomError(404, "MESSAGE_NOT_FOUND", "메시지를 찾을 수 없거나 권한이 없습니다.");
  }
  return {
    message: MESSAGE_RESPONSES.DELETE_SUCCESS
  };
};
