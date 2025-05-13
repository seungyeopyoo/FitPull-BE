import { findUserById } from "../repositories/user.repository.js";
import { updateUserById } from "../repositories/user.repository.js";
import { softDeleteUserById } from "../repositories/user.repository.js";

export const getUserById = async (userId) => {
	const user = await findUserById(userId);
	if (!user) throw new Error("유저를 찾을 수 없습니다.");
	return user;
};

export const updateUserInfo = async (userId, { name, phone, profileImage }) => {
	const updateData = {};

	if (name) updateData.name = name;
	if (phone) updateData.phone = phone;
	if (profileImage) updateData.profileImage = profileImage;

	const updatedUser = await updateUserById(userId, updateData);
	return updatedUser;
};

export const deactivateUser = async (userId) => {
	return await softDeleteUserById(userId);
};
