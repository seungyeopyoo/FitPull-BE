import express from "express";
import {
	signupController,
	loginController,
	logoutController,
	refreshTokenController,
	rejoinRequestController,
	rejoinVerifyController,
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

/**
 * @swagger
 * /auth/rejoin/request:
 *   post:
 *     summary: 탈퇴한 계정 재가입 인증코드 요청
 *     description: 탈퇴한 계정의 이메일로 인증코드를 전송합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: 인증 코드 전송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: 탈퇴한 계정이 아닐 때
 *       500:
 *         description: 서버 내부 오류
 */

/**
 * @swagger
 * /auth/rejoin/verify:
 *   post:
 *     summary: 탈퇴한 계정 재가입 인증코드 검증 및 계정 복구
 *     description: 인증코드와 새 비밀번호를 입력하여 탈퇴한 계정을 복구합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 example: "새비밀번호"
 *     responses:
 *       200:
 *         description: 재가입(계정 복구) 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *       400:
 *         description: 인증코드 불일치 등 잘못된 요청
 *       404:
 *         description: 계정 없음
 *       500:
 *         description: 서버 내부 오류
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
//재가입 요청
router.post("/rejoin/request", rejoinRequestController);
//재가입 인증
router.post("/rejoin/verify", rejoinVerifyController);

export default router;
