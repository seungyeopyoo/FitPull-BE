import express from "express";
import {
	signupController,
	loginController,
	logoutController,
} from "../controllers/auth.controller.js";

const router = express.Router();
//회원가입
router.post("/signup", signupController);
//로그인
router.post("/login", loginController);
//로그아웃
router.post("/logout", logoutController);

export default router;
