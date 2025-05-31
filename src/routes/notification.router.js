import express from "express";
import { sendNotification } from "../utils/notify.js";

const router = express.Router();

// 테스트용 API
router.post("/test", async (req, res) => {
  const { userId, message } = req.body;

  sendNotification(userId, {
    type: "INFO",
    message,
    url: "/some/path",
  });

  return res.status(200).json({ success: true });
});

export default router;