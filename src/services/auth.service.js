import {
  findByEmail,
  createUser,
  findAnyByEmail,
  restoreAccountByEmail,
  findAccountByProvider,
} from '../repositories/auth.repository.js';
import {
  findUserByPhone,
  updateUserVerifiedPhone,
  findValidUserByPhone,
} from '../repositories/user.repository.js';
import bcrypt from 'bcryptjs';
import { generateTokens } from '../utils/jwt.js';
import {
  setRefreshToken,
  getEmailCode,
  deleteEmailCode,
  setEmailCode,
} from '../utils/redis.js';
import CustomError from '../utils/customError.js';
import { AUTH_MESSAGES } from '../constants/messages.js';
import { sendRecoveryEmail } from '../utils/nodemailer.js';

export const signup = async ({
  email,
  password,
  passwordCheck,
  name,
  phone,
}) => {
  if (!email || !password || !passwordCheck || !name || !phone) {
    throw new CustomError(400, 'MISSING_FIELDS', AUTH_MESSAGES.MISSING_FIELDS);
  }
  if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    throw new CustomError(400, 'INVALID_EMAIL', AUTH_MESSAGES.INVALID_EMAIL);
  }
  if (password.length < 6) {
    throw new CustomError(
      400,
      'INVALID_PASSWORD',
      AUTH_MESSAGES.INVALID_PASSWORD,
    );
  }
  if (!/^[a-zA-Z가-힣]+$/.test(name)) {
    throw new CustomError(400, 'INVALID_NAME', AUTH_MESSAGES.INVALID_NAME);
  }
  if (phone !== '00000000000' && !/^\d+$/.test(phone)) {
    throw new CustomError(
      400,
      'INVALID_PHONE',
      AUTH_MESSAGES.INVALID_PHONE_ONLY_NUMBER,
    );
  }
  if (password !== passwordCheck) {
    throw new CustomError(
      400,
      'PASSWORD_MISMATCH',
      AUTH_MESSAGES.PASSWORD_MISMATCH,
    );
  }
  const exists = await findAnyByEmail(email);
  if (exists && exists.deletedAt === null) {
    throw new CustomError(409, 'EMAIL_EXISTS', AUTH_MESSAGES.EMAIL_EXISTS);
  }
  if (exists && exists.deletedAt !== null) {
    throw new CustomError(
      409,
      'DELETED_ACCOUNT',
      AUTH_MESSAGES.DELETED_ACCOUNT,
    );
  }

  const duplicatePhone = await findValidUserByPhone(phone);
  if (duplicatePhone) {
    throw new CustomError(409, 'PHONE_EXISTS', AUTH_MESSAGES.PHONE_EXISTS);
  }

  const hash = await bcrypt.hash(password, 10);
  const account = await createUser({
    email,
    passwordHash: hash,
    name,
    phone,
    provider: 'LOCAL',
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
  if (!email || !password) {
    throw new CustomError(400, 'MISSING_FIELDS', AUTH_MESSAGES.MISSING_FIELDS);
  }
  if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    throw new CustomError(400, 'INVALID_EMAIL', AUTH_MESSAGES.INVALID_EMAIL);
  }
  const account = await findByEmail(email);
  if (!account)
    throw new CustomError(404, 'USER_NOT_FOUND', AUTH_MESSAGES.USER_NOT_FOUND);

  if (account.provider !== 'LOCAL') {
    throw new CustomError(400, 'SOCIAL_ONLY', AUTH_MESSAGES.SOCIAL_ONLY);
  }

  const isMatch = await bcrypt.compare(password, account.passwordHash);
  if (!isMatch)
    throw new CustomError(
      401,
      'PASSWORD_MISMATCH',
      AUTH_MESSAGES.PASSWORD_MISMATCH,
    );

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
    message: AUTH_MESSAGES.LOGIN_SUCCESS,
    id: account.user.id,
    name: account.user.name,
    accessToken,
    refreshToken, // 컨트롤러에서 쿠키로 전달할 수 있도록 포함
  };
};

export const rejoinRequest = async (email) => {
  const account = await findAnyByEmail(email);
  if (!account || !account.deletedAt)
    throw new CustomError(
      404,
      'REJOIN_ONLY_DELETED_ACCOUNT',
      AUTH_MESSAGES.REJOIN_ONLY_DELETED_ACCOUNT,
    );
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await setEmailCode(email, code);
  await sendRecoveryEmail(email, code);
};

export const rejoinVerify = async ({ email, code, password }) => {
  if (!password || password.length < 6) {
    throw new CustomError(
      400,
      'INVALID_PASSWORD',
      AUTH_MESSAGES.INVALID_PASSWORD,
    );
  }

  const savedCode = await getEmailCode(email);

  if (!savedCode) {
    throw new CustomError(400, 'NO_CODE', AUTH_MESSAGES.NO_CODE);
  }
  if (String(savedCode) !== String(code)) {
    throw new CustomError(400, 'INVALID_CODE', AUTH_MESSAGES.INVALID_CODE);
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
    message: AUTH_MESSAGES.LOGIN_SUCCESS,
    id: account.user.id,
    name: account.user.name,
    accessToken,
    refreshToken,
  };
};

const extractSocialProfile = (profile, provider) => {
  const id = String(profile.id);

  const fallbackEmail = `${provider.toLowerCase()}_${id}@social-login.com`;
  const fallbackNickname = `${provider.toUpperCase()}유저`;

  if (provider === 'KAKAO') {
    return {
      providerId: id,
      email: profile._json?.kakao_account?.email ?? fallbackEmail,
      nickname: profile.username || profile.displayName || fallbackNickname,
    };
  }

  if (provider === 'GOOGLE') {
    return {
      providerId: id,
      email: profile.emails?.[0]?.value ?? fallbackEmail,
      nickname: profile.displayName || profile.username || fallbackNickname,
    };
  }

  if (provider === 'NAVER') {
    return {
      providerId: id,
      email:
        profile.emails?.[0]?.value || profile._json?.email || fallbackEmail,
      nickname:
        profile._json?.nickname ||
        profile._json?.name ||
        profile.displayName ||
        profile.username ||
        fallbackEmail.split('@')[0] ||
        fallbackNickname,
    };
  }

  return {
    providerId: id,
    email: fallbackEmail,
    nickname: profile.displayName || profile.username || fallbackNickname,
  };
};

export const findOrCreateSocialAccount = async (profile, provider) => {
  const { providerId, email, nickname } = extractSocialProfile(
    profile,
    provider,
  );

  const localAccount = await findByEmail(email);
  if (localAccount && localAccount.provider === 'LOCAL') {
    throw new CustomError(400, 'LOCAL_ONLY', AUTH_MESSAGES.LOCAL_ONLY);
  }

  // 기존 소셜 계정이 있으면 반환
  const existing = await findAccountByProvider(provider, providerId);
  if (existing) return existing.user;

  // 새 소셜 계정 생성
  const user = await createUser({
    email,
    name: nickname,
    phone: '00000000000',
    provider,
    providerId,
  });

  return user;
};

export const verifyPhoneAndUpdateUser = async (phone) => {
  const user = await findUserByPhone(phone);
  if (user && !user.verifiedPhone) {
    await updateUserVerifiedPhone(user.id);
  }
};

export const ensurePhoneExistsForVerification = async (phone) => {
  if (phone === '00000000000') {
    throw new CustomError(400, 'INVALID_PHONE', AUTH_MESSAGES.INVALID_PHONE);
  }

  const user = await findUserByPhone(phone);
  if (!user) {
    throw new CustomError(404, 'USER_NOT_FOUND', AUTH_MESSAGES.USER_NOT_FOUND);
  }

  if (user.verifiedPhone) {
    throw new CustomError(
      400,
      'ALREADY_VERIFIED',
      AUTH_MESSAGES.ALREADY_VERIFIED,
    );
  }
};
