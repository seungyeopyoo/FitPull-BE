import {
  sendMessage,
  getReceivedMessages,
  getSentMessages,
  markMessageRead,
  markAllMessagesRead,
  deleteMessage,
} from "../services/message.service.js";
import { success } from "../utils/responseHandler.js";

export const sendMessageController = async (req, res, next) => {
  try {
    const { id: senderId, role: senderRole } = req.user;
    const { receiverId, content, productId } = req.body;
    const result = await sendMessage({ senderId, receiverId, content, productId, senderRole });
    return success(res, result.message, result.data);
  } catch (error) {
    next(error);
  }
};


export const getReceivedMessagesController = async (req, res, next) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const result = await getReceivedMessages(userId, userRole);
    return success(res, result.message, result.data);
  } catch (error) {
    next(error);
  }
};


export const getSentMessagesController = async (req, res, next) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const result = await getSentMessages(userId, userRole);
    return success(res, result.message, result.data);
  } catch (error) {
    next(error);
  }
};


export const markMessageReadController = async (req, res, next) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const { id: messageId } = req.params;
    const result = await markMessageRead(messageId, userId, userRole);
    return success(res, result.message);
  } catch (error) {
    next(error);
  }
};


export const markAllMessagesReadController = async (req, res, next) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const result = await markAllMessagesRead(userId, userRole);
    return success(res, result.message);
  } catch (error) {
    next(error);
  }
};


export const deleteMessageController = async (req, res, next) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const { id: messageId } = req.params;
    const result = await deleteMessage(messageId, userId, userRole);
    return success(res, result.message);
  } catch (error) {
    next(error);
  }
};
