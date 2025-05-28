import { findByEmail, createUser } from "../repositories/auth.repository.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/jwt.js";
import { setRefreshToken, deleteRefreshToken, getRefreshToken } from "../utils/redis.js";
import CustomError from "../utils/customError.js";
import messages from "../constants/messages.js";

export const signup = async ({
	email,
	password,
	passwordCheck,
	name,
	phone,
}) => {
	if (password !== passwordCheck) {
		throw new CustomError(400, "PASSWORD_MISMATCH", messages.PASSWORD_MISMATCH);
	}
	const exists = await findByEmail(email);
	if (exists) throw new CustomError(409, "EMAIL_EXISTS", messages.EMAIL_EXISTS);

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
	if (!account) throw new CustomError(404, "USER_NOT_FOUND", messages.USER_NOT_FOUND);

	const isMatch = await bcrypt.compare(password, account.passwordHash);
	if (!isMatch) throw new CustomError(401, "PASSWORD_MISMATCH", messages.PASSWORD_MISMATCH);

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
		message: messages.LOGIN_SUCCESS,
		id: account.user.id,
		name: account.user.name,
		accessToken,
		refreshToken, // 컨트롤러에서 쿠키로 전달할 수 있도록 포함
	};
};

