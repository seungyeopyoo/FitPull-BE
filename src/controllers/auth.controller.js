import { signup, login } from "../services/auth.service.js";
import { deleteRefreshToken, getRefreshToken, setRefreshToken } from "../utils/redis.js";
import { verifyRefreshToken } from "../utils/jwt.js";
import { generateTokens } from "../utils/jwt.js";
import { success } from "../utils/responseHandler.js";
import messages from "../constants/messages.js";

export const signupController = async (req, res, next) => {
	try {
		const user = await signup(req.body);
		// 서비스에서 반환된 refreshToken을 쿠키로 전달
		res.cookie("refreshToken", user.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
			path: "/",
		});
		return success(res, messages.SIGNUP_SUCCESS, { id: user.id, name: user.name, accessToken: user.accessToken });
	} catch (error) {
		console.error("회원가입 에러:", error);
		next(error);
	}
};

export const loginController = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const result = await login({ email, password });
		// 서비스에서 반환된 refreshToken을 쿠키로 전달
		res.cookie("refreshToken", result.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
			path: "/",
		});
		return success(res, result.message, { id: result.id, name: result.name, accessToken: result.accessToken });
	} catch (error) {
		console.error("로그인 에러:", error);
		next(error);
	}
};

export const logoutController = async (req, res, next) => {
	try {
		const userId = req.user?.userId;
		if (userId) {
			await deleteRefreshToken(userId);
		}
		res.clearCookie("refreshToken", { path: "/" });
		return success(res, messages.LOGOUT_SUCCESS);
	} catch (error) {
		console.error("로그아웃 에러:", error);
		next(error);
	}
};

// refreshToken 재발급
export const refreshTokenController = async (req, res, next) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (!refreshToken) {
			return next(new CustomError(401, "REFRESH_TOKEN_REQUIRED", messages.REFRESH_TOKEN_REQUIRED));
		}
		let decoded;
		try {
			decoded = verifyRefreshToken(refreshToken);
		} catch (err) {
			return next(new CustomError(401, "INVALID_REFRESH_TOKEN", messages.INVALID_REFRESH_TOKEN));
		}
		const userId = decoded.userId;
		const savedToken = await getRefreshToken(userId);
		if (!savedToken || savedToken !== refreshToken) {
			return next(new CustomError(401, "INVALID_REFRESH_TOKEN", messages.INVALID_REFRESH_TOKEN));
		}
		const { exp, iat, ...cleanedPayload } = decoded;
		const { accessToken, refreshToken: newRefreshToken } = generateTokens(cleanedPayload);
		res.cookie("refreshToken", newRefreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 7 * 24 * 60 * 60 * 1000,
			path: "/",
		});
		await setRefreshToken(userId, newRefreshToken);
		return success(res, messages.REFRESH_TOKEN_SUCCESS, { accessToken });
	} catch (error) {
		console.error("refreshToken 재발급 에러:", error);
		next(error);
	}
};
