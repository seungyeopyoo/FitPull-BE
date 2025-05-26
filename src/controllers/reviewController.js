import {
  createReview,
  getReviewsByProduct,
  getReviewById,
  updateReview,
  deleteReview,
} from "../services/review.service.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages.js";

export const createReviewController = async (req, res) => {
  try {
    const review = await createReview(req.user, req.body);
    res.status(201).json({ message: SUCCESS_MESSAGES.REVIEW_CREATED, review });
  } catch (err) {
    // Prisma unique constraint 에러를 ALREADY_REVIEWED로 변환
    if (
      err.message &&
      err.message.includes("Unique constraint failed") &&
      err.message.includes("completed_rental_id")
    ) {
      return res.status(400).json({ message: ERROR_MESSAGES.ALREADY_REVIEWED });
    }
    res.status(400).json({ message: err.message });
  }
};

// 상품별 리뷰 조회
export const getReviewsByProductController = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await getReviewsByProduct(productId);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReviewByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await getReviewById(id);
    if (!review || review.deletedAt) {
      return res.status(404).json({ message: ERROR_MESSAGES.REVIEW_NOT_FOUND });
    }
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateReviewController = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateReview(req.user, id, req.body);
    res.json({ message: SUCCESS_MESSAGES.REVIEW_UPDATED, review: updated });
  } catch (err) {
    if (err.message === ERROR_MESSAGES.ONLY_OWN_REVIEW) {
      return res.status(403).json({ message: err.message });
    }
    res.status(400).json({ message: err.message });
  }
};

export const deleteReviewController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteReview(req.user, id);
    res.status(200).json({ message: SUCCESS_MESSAGES.REVIEW_DELETED });
  } catch (err) {
    if (err.message === ERROR_MESSAGES.ONLY_OWN_DELETE) {
      return res.status(403).json({ message: err.message });
    }
    res.status(400).json({ message: err.message });
  }
}; 