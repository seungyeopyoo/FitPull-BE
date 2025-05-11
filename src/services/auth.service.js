import * as authRepo from "../repositories/auth.repository.js";
import bcrypt from "bcryptjs";

export const signup = async ({ email, password, name, phone }) => {
	const exists = await authRepo.findByEmail(email);
	if (exists) throw new Error("이미 가입된 이메일입니다.");

	const hash = await bcrypt.hash(password, 10);
	const user = await authRepo.createUser({
		email,
		passwordHash: hash,
		name,
		phone,
	});

	return { id: user.id, email: user.email };
};

export const login = async ({ email, password }) => {
	const account = await authRepo.findByEmail(email);
	if (!account) throw new Error("존재하지 않는 사용자입니다.");

	const isMatch = await bcrypt.compare(password, account.passwordHash);
	if (!isMatch) throw new Error("비밀번호가 일치하지 않습니다.");

	return { message: "로그인 성공", user: account.user };
};
