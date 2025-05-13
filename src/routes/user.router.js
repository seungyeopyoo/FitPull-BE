import express from "express";
import {
	getMyProfile,
	updateMyProfile,
	deleteMyAccount,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();
//내정보조회
router.get("/me", authenticate, getMyProfile);
//내정보수정
router.patch("/me", authenticate, updateMyProfile);
//회원탈퇴
router.delete("/me", authenticate, deleteMyAccount);

export default router;
