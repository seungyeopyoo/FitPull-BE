import {
  createReview,
  getReviewsByProduct,
  getReviewById,
  updateReview,
  deleteReview,
} from '../services/review.service.js';
import { REVIEW_MESSAGES } from '../constants/messages.js';
import { success } from '../utils/responseHandler.js';
import CustomError from '../utils/customError.js';

export const createReviewController = async (req, res, next) => {
  try {
    const review = await createReview(req.user, req.body);
    return success(res, REVIEW_MESSAGES.REVIEW_CREATED, { review });
  } catch (err) {
    if (
      err.message &&
      err.message.includes('Unique constraint failed') &&
      err.message.includes('completed_rental_id')
    ) {
      return next(
        new CustomError(
          400,
          'ALREADY_REVIEWED',
          REVIEW_MESSAGES.ALREADY_REVIEWED,
        ),
      );
    }
    next(err);
  }
};

// 상품별 리뷰 조회
export const getReviewsByProductController = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await getReviewsByProduct(productId);
    return success(res, REVIEW_MESSAGES.REVIEW_LISTED, { reviews });
  } catch (err) {
    next(err);
  }
};

export const getReviewByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await getReviewById(id);
    if (!review || review.deletedAt) {
      return next(
        new CustomError(
          404,
          'REVIEW_NOT_FOUND',
          REVIEW_MESSAGES.REVIEW_NOT_FOUND,
        ),
      );
    }
    return success(res, REVIEW_MESSAGES.REVIEW_DETAIL, { review });
  } catch (err) {
    next(err);
  }
};

export const updateReviewController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await updateReview(req.user, id, req.body);
    return success(res, REVIEW_MESSAGES.REVIEW_UPDATED, { review: updated });
  } catch (err) {
    if (err.message === REVIEW_MESSAGES.ONLY_OWN_REVIEW) {
      return next(new CustomError(403, 'ONLY_OWN_REVIEW', err.message));
    }
    next(err);
  }
};

export const deleteReviewController = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteReview(req.user, id);
    return success(res, REVIEW_MESSAGES.REVIEW_DELETED);
  } catch (err) {
    if (err.message === REVIEW_MESSAGES.ONLY_OWN_DELETE) {
      return next(new CustomError(403, 'ONLY_OWN_DELETE', err.message));
    }
    next(err);
  }
};
