import express from "express";

import { sendTestNotification, getNotificationList, markNotificationRead } from "../controllers/notification.controller.js";
import { authenticate  } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: 알림 관련 API
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: 내 알림 목록 조회
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 알림 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       message:
 *                         type: string
 *                       url:
 *                         type: string
 *                       isRead:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       readAt:
 *                         type: string
 *                         format: date-time
 */

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: 알림 읽음 처리
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 알림 ID
 *     responses:
 *       200:
 *         description: 알림 읽음 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 notification:
 *                   type: object
 */

// 알림 목록 조회
router.get("/", authenticate, getNotificationList);

// 알림 읽음 처리
router.patch("/:id/read", authenticate, markNotificationRead);

/**
 * @swagger
 * /notifications/test:
 *   post:
 *     summary: (개발용) 테스트 알림 전송
 *     tags: [Notification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *               message:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: 테스트 알림 전송 성공
 *     x-deprecated: true
 */
router.post("/test", sendTestNotification);

export default router;
