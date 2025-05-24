import express from "express";
import {
	signupController,
	loginController,
	logoutController,
	refreshTokenController,
} from "../controllers/auth.controller.js";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 회원가입 / 로그인 / 로그아웃 / 토큰 재발급 API
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

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: refreshToken으로 accessToken 재발급
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: accessToken 재발급 성공
 *       401:
 *         description: refreshToken이 유효하지 않음
 */

const router = express.Router();
//회원가입
router.post("/signup", signupController);
//로그인
router.post("/login", loginController);
//로그아웃
router.post("/logout", logoutController);
//토큰 재발급
router.post("/refresh", refreshTokenController);

export default router;
