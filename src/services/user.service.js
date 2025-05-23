import { findUserById } from "../repositories/user.repository.js";
import { updateUserById } from "../repositories/user.repository.js";
import { softDeleteUserById } from "../repositories/user.repository.js";

export const getUserById = async (userId) => {
	const user = await findUserById(userId);
	if (!user) throw new Error("유저를 찾을 수 없습니다.");
	const { id, name, phone, verifiedPhone, bankAccount, bankName, accountHolder, verifiedBankAccount } = user;
	return { id, name, phone, verifiedPhone, bankAccount, bankName, accountHolder, verifiedBankAccount };
};

export const updateUserInfo = async (userId, { name, phone, bankAccount, bankName, accountHolder }) => {
	const updateData = {};

	if (name) updateData.name = name;
	if (phone) updateData.phone = phone;
	if (bankAccount !== undefined) updateData.bankAccount = bankAccount;
	if (bankName !== undefined) updateData.bankName = bankName;
	if (accountHolder !== undefined) updateData.accountHolder = accountHolder;

	const updatedUser = await updateUserById(userId, updateData);
	const { id, name: updatedName, phone: updatedPhone, verifiedPhone, bankAccount: updatedBankAccount, bankName: updatedBankName, accountHolder: updatedAccountHolder, verifiedBankAccount } = updatedUser;
	return { id, name: updatedName, phone: updatedPhone, verifiedPhone, bankAccount: updatedBankAccount, bankName: updatedBankName, accountHolder: updatedAccountHolder, verifiedBankAccount };
};

export const deactivateUser = async (userId) => {
	return await softDeleteUserById(userId);
};
