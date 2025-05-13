import { signup, login } from "../services/auth.service.js";

export const signupController = async (req, res) => {
	try {
		const user = await signup(req.body);
		res.status(201).json({ message: "회원가입이 완료되었습니다.", user });
	} catch (error) {
		console.error("회원가입 에러:", error);
		res.status(400).json({ message: error.message });
	}
};

export const loginController = async (req, res) => {
	try {
		const { email, password } = req.body;
		const result = await login({ email, password });
		res.json(result);
	} catch (error) {
		console.error("로그인 에러:", error);
		res.status(401).json({ message: error.message });
	}
};
// 우선 토큰을 저장하는 공간이 없어서 mvp개발후에 redis or local에 저장 후에 디벨롭
export const logoutController = async (req, res) => {
	return res.status(200).json({ message: "로그아웃 되었습니다." });
};
