import { findByEmail, createUser, findAnyByEmail, restoreAccountByEmail, findAccountByProvider } from "../repositories/auth.repository.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/jwt.js";
import { setRefreshToken, deleteRefreshToken, getRefreshToken, getEmailCode, deleteEmailCode, setEmailCode } from "../utils/redis.js";
import CustomError from "../utils/customError.js";
import messages from "../constants/messages.js";
import { sendRecoveryEmail } from "../utils/nodemailer.js"


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
	const exists = await findAnyByEmail(email);
	if (exists && exists.deletedAt === null) {
		throw new CustomError(409, "EMAIL_EXISTS", messages.EMAIL_EXISTS);
	}
	if (exists && exists.deletedAt !== null) {
		throw new CustomError(409, "DELETED_ACCOUNT", messages.DELETED_ACCOUNT);
	}

	const hash = await bcrypt.hash(password, 10);
	const account = await createUser({
		email,
		passwordHash: hash,
		name,
		phone,
		provider: "LOCAL", 
		providerId: email,
	  });

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

export const rejoinRequest = async (email) => {
	const account = await findAnyByEmail(email);
	if (!account || !account.deletedAt) throw new CustomError(404, "USER_NOT_FOUND", "탈퇴한 계정만 재가입 가능합니다.");
	const code = Math.floor(100000 + Math.random() * 900000).toString();
	await setEmailCode(email, code);
	await sendRecoveryEmail(email, code);
};

export const rejoinVerify = async ({ email, code, password }) => {
	if (!password || password.length < 6) {
		throw new CustomError(400, "INVALID_PASSWORD", messages.INVALID_PASSWORD);
	}

	const savedCode = await getEmailCode(email);

	if (!savedCode) {
		throw new CustomError(400, "NO_CODE", messages.NO_CODE);
	}
	if (String(savedCode) !== String(code)) {
		throw new CustomError(400, "INVALID_CODE", messages.INVALID_CODE);
	}
	await deleteEmailCode(email);
	
	const hash = await bcrypt.hash(password, 10);
	const account = await restoreAccountByEmail(email, hash);

	const payload = {
		userId: account.user.id,
		accountId: account.id,
		email: account.email,
		role: account.user.role,
	};

	const { accessToken, refreshToken } = generateTokens(payload);

	
	await setRefreshToken(account.user.id, refreshToken);

	return {
		message: messages.LOGIN_SUCCESS,
		id: account.user.id,
		name: account.user.name,
		accessToken,
		refreshToken, 
	};
};

export const findOrCreateSocialAccount = async (profile, provider) => {
	const kakaoId = String(profile.id);
	const email = profile._json.kakao_account?.email ?? `kakao_${kakaoId}@social-login.com`;
	const nickname = profile.username || profile.displayName || "카카오유저";

	const existing = await findAccountByProvider(provider, kakaoId);
	if (existing) {
	  return existing.user;
	}
  
	const user = await createUser({
	  email,
	  name: nickname,
	  phone: "00000000000",
	  provider,
	  providerId: kakaoId,
	});
  
	return user;
  };
