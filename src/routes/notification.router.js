import express from "express";

import { sendTestNotification, getNotificationList, markNotificationRead } from "../controllers/notification.controller.js";
import { authenticate  } from "../middlewares/auth.js";

const router = express.Router();

// 테스트용 알림 전송
router.post("/test", sendTestNotification);

// 알림 목록 조회
router.get("/", authenticate, getNotificationList);

// 알림 읽음 처리
router.patch("/:id/read", authenticate, markNotificationRead);


export default router;
