import express from "express";
import {
	getMyProfile,
	updateMyProfile,
	deleteMyAccount,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.js";

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 내 정보 관리 API
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: 내 정보 조회
 *     tags: [User]
 *     responses:
 *       200:
 *         description: 내 프로필 반환
 */

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: 내 정보 수정
 *     tags: [User]
 *     responses:
 *       200:
 *         description: 수정된 프로필 반환
 */

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: 회원 탈퇴
 *     tags: [User]
 *     responses:
 *       200:
 *         description: 회원 탈퇴 완료
 */

const router = express.Router();
//내정보조회
router.get("/me", authenticate, getMyProfile);
//내정보수정
router.patch("/me", authenticate, updateMyProfile);
//회원탈퇴
router.delete("/me", authenticate, deleteMyAccount);

export default router;
