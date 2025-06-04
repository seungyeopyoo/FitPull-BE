import express from "express";
import {
	createRentalRequestController,
	getMyRentalRequestsController,
	getPendingRequestsController,
	approveRentalRequestController,
	rejectRentalRequestController,
	cancelRentalRequestController,
} from "../controllers/rentalRequest.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { adminOnly } from "../middlewares/adminOnly.js";
import requireVerifiedPhone from "../middlewares/requireVerifiedPhone.js";

/**
 * @swagger
 * tags:
 *   name: RentalRequest
 *   description: 상품 대여 요청 API
 */

/**
 * @swagger
 * /rental-requests:
 *   post:
 *     summary: 대여 요청 생성 (휴대폰 인증 필요)
 *     tags: [RentalRequest]
 *     security:
 *       - bearerAuth: []
 *     description: 휴대폰 인증이 완료된 사용자만 대여 요청을 할 수 있습니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: 대여 요청 생성 완료
 *       401:
 *         description: 인증 실패 또는 휴대폰 미인증
 */

/**
 * @swagger
 * /rental-requests/me:
 *   get:
 *     summary: 내 대여 요청 목록 조회
 *     tags: [RentalRequest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내 요청 목록 반환
 */

/**
 * @swagger
 * /rental-requests/pending:
 *   get:
 *     summary: 관리자용 대기 요청 목록 조회
 *     tags: [RentalRequest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 대기 요청 목록 반환
 */

/**
 * @swagger
 * /rental-requests/{id}/approve:
 *   patch:
 *     summary: 대여 요청 승인
 *     tags: [RentalRequest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 요청 ID
 *     responses:
 *       200:
 *         description: 승인 완료
 */

/**
 * @swagger
 * /rental-requests/{id}/reject:
 *   patch:
 *     summary: 대여 요청 거절
 *     tags: [RentalRequest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 요청 ID
 *     responses:
 *       200:
 *         description: 거절 완료
 */

/**
 * @swagger
 * /rental-requests/{id}/cancel:
 *   patch:
 *     summary: 대여 요청 취소 (고객)
 *     tags: [RentalRequest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 요청 ID
 *     responses:
 *       200:
 *         description: 고객 요청으로 거절됨
 */

const router = express.Router();

// 대여 요청
router.post("/", authenticate, requireVerifiedPhone, createRentalRequestController);

// 본인 대여요청 목록 조회
router.get("/me", authenticate, getMyRentalRequestsController);

// 대기 요청 전체조회
router.get("/pending", authenticate, adminOnly, getPendingRequestsController);

// 대여요청수락
router.patch(
	"/:id/approve",
	authenticate,
	adminOnly,
	approveRentalRequestController,
);

// 대여요청거절
router.patch(
	"/:id/reject",
	authenticate,
	adminOnly,
	rejectRentalRequestController,
);

// 대여요청취소 (본인만)
router.patch(
	"/:id/cancel",
	authenticate,
	cancelRentalRequestController,
);

export default router;
