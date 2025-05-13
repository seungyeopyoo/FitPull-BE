import { findByEmail, createUser } from "../repositories/auth.repository.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/jwt.js";

export const signup = async ({
	email,
	password,
	passwordCheck,
	name,
	phone,
}) => {
	if (password !== passwordCheck) {
		throw new Error("비밀번호가 일치하지 않습니다.");
	}
	const exists = await findByEmail(email);
	if (exists) throw new Error("이미 가입된 이메일입니다.");

	const hash = await bcrypt.hash(password, 10);
	const account = await createUser({ email, passwordHash: hash, name, phone });

	const payload = {
		userId: account.user.id,
		accountId: account.id,
		email: account.email,
		role: account.user.role,
	};

	const { accessToken, refreshToken } = generateTokens(payload);

	return {
		message: "회원가입이 완료되었습니다.",
		user: account.user,
		accessToken,
		refreshToken,
	};
};

export const login = async ({ email, password }) => {
	const account = await findByEmail(email);
	if (!account) throw new Error("존재하지 않는 사용자입니다.");

	const isMatch = await bcrypt.compare(password, account.passwordHash);
	if (!isMatch) throw new Error("비밀번호가 일치하지 않습니다.");

	const payload = {
		userId: account.user.id,
		accountId: account.id,
		email: account.email,
		role: account.user.role,
	};

	const { accessToken, refreshToken } = generateTokens(payload);

	return {
		message: "로그인 성공",
		user: account.user,
		accessToken,
		refreshToken,
	};
};
