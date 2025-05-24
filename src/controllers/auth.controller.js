import { signup, login } from "../services/auth.service.js";
import { deleteRefreshToken, getRefreshToken, setRefreshToken } from "../utils/redis.js";
import { verifyRefreshToken } from "../utils/jwt.js";
import { generateTokens } from "../utils/jwt.js";

export const signupController = async (req, res) => {
	try {
		const user = await signup(req.body);
		// 서비스에서 반환된 refreshToken을 쿠키로 전달
		res.cookie("refreshToken", user.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
			path: "/",
		});
		res.status(201).json({ message: "회원가입이 완료되었습니다.", user: { id: user.id, name: user.name, accessToken: user.accessToken } });
	} catch (error) {
		console.error("회원가입 에러:", error);
		res.status(400).json({ message: error.message });
	}
};

export const loginController = async (req, res) => {
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
		res.json({ message: result.message, id: result.id, name: result.name, accessToken: result.accessToken });
	} catch (error) {
		console.error("로그인 에러:", error);
		res.status(401).json({ message: error.message });
	}
};

export const logoutController = async (req, res) => {
	try {
		const userId = req.user?.userId;
		if (userId) {
			await deleteRefreshToken(userId);
		}
		res.clearCookie("refreshToken", { path: "/" });
		return res.status(200).json({ message: "로그아웃 되었습니다." });
	} catch (error) {
		console.error("로그아웃 에러:", error);
		return res.status(500).json({ message: "로그아웃 처리 중 오류가 발생했습니다." });
	}
};

// refreshToken 재발급
export const refreshTokenController = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (!refreshToken) {
			return res.status(401).json({ message: "refreshToken이 필요합니다." });
		}
		let decoded;
		try {
			decoded = verifyRefreshToken(refreshToken);
		} catch (err) {
			return res.status(401).json({ message: "유효하지 않은 refreshToken입니다." });
		}
		const userId = decoded.userId;
		const savedToken = await getRefreshToken(userId);
		if (!savedToken || savedToken !== refreshToken) {
			return res.status(401).json({ message: "refreshToken이 유효하지 않습니다." });
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
		return res.json({ accessToken });
	} catch (error) {
		console.error("refreshToken 재발급 에러:", error);
		return res.status(500).json({ message: "토큰 재발급 중 오류가 발생했습니다." });
	}
};
