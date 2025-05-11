import * as authService from "../services/auth.service.js";

export const signup = async (req, res) => {
	try {
		const user = await authService.signup(req.body);
		res.status(201).json({ message: "회원가입이 완료되었습니다.", user });
	} catch (error) {
		console.error("회원가입 에러:", error);
		res.status(400).json({ message: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await authService.login({ email, password });
		res.json({ message: "로그인 성공", user });
	} catch (error) {
		console.error("로그인 에러:", error);
		res.status(401).json({ message: error.message });
	}
};
