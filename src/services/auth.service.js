import { findByEmail, createUser } from "../repositories/auth.repository.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/jwt.js";
import { setRefreshToken, deleteRefreshToken, getRefreshToken } from "../utils/redis.js";

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

	// refreshToken을 redis에 저장
	await setRefreshToken(account.user.id, refreshToken);

	return {
		id: account.user.id,
		name: account.user.name,
		accessToken,
		refreshToken, // 컨트롤러에서 쿠키로 전달할 수 있도록 포함
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

	// refreshToken을 redis에 저장
	await setRefreshToken(account.user.id, refreshToken);

	return {
		message: "로그인 성공",
		id: account.user.id,
		name: account.user.name,
		accessToken,
		refreshToken, // 컨트롤러에서 쿠키로 전달할 수 있도록 포함
	};
};

// refreshToken 검증 및 재발급을 위한 서비스 함수 추가 예정
