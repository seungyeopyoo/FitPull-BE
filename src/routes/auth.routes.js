import express from "express";
import {
	signupController,
	loginController,
	logoutController,
} from "../controllers/auth.controller.js";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 회원가입 / 로그인 / 로그아웃 API
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: 회원가입 성공
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그인 성공
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 */

const router = express.Router();
//회원가입
router.post("/signup", signupController);
//로그인
router.post("/login", loginController);
//로그아웃
router.post("/logout", logoutController);

export default router;
