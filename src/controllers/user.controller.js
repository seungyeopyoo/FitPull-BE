import { getUserById } from "../services/user.service.js";
import { updateUserInfo } from "../services/user.service.js";
import { deactivateUser } from "../services/user.service.js";
import { success } from "../utils/responseHandler.js";
import messages from "../constants/messages.js";

export const getMyProfile = async (req, res, next) => {
	try {
		const userId = req.user.userId;
		const user = await getUserById(userId);
		return success(res, messages.GET_MY_PROFILE_SUCCESS, { user });
	} catch (err) {
		next(err);
	}
};

export const updateMyProfile = async (req, res, next) => {
	try {
		const userId = req.user.userId;
		const { name, bankAccount, bankName, accountHolder } = req.body;

		const updatedUser = await updateUserInfo(userId, {
			name,
			bankAccount,
			bankName,
			accountHolder,
		});

		return success(res, messages.UPDATE_MY_PROFILE_SUCCESS, { user: updatedUser });
	} catch (err) {
		next(err);
	}
};

export const deleteMyAccount = async (req, res, next) => {
	try {
		const userId = req.user.userId;

		await deactivateUser(userId);

		return success(res, messages.DELETE_MY_ACCOUNT_SUCCESS);
	} catch (err) {
		next(err);
	}
};
