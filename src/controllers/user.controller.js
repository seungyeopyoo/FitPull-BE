import { getUserById } from "../services/user.service.js";
import { updateUserInfo } from "../services/user.service.js";
import { deactivateUser } from "../services/user.service.js";

export const getMyProfile = async (req, res) => {
	try {
		const userId = req.user.userId;
		const user = await getUserById(userId);
		res.json({ message: "내 정보 조회", user });
	} catch (err) {
		console.error("내 정보 조회 실패:", err);
		res.status(404).json({ message: err.message });
	}
};

export const updateMyProfile = async (req, res) => {
	try {
		const userId = req.user.userId;
		const { name, bankAccount, bankName, accountHolder } = req.body;

		const updatedUser = await updateUserInfo(userId, {
			name,
			bankAccount,
			bankName,
			accountHolder,
		});

		res.json({ message: "내 정보가 수정되었습니다.", user: updatedUser });
	} catch (err) {
		console.error("내 정보 수정 실패:", err);
		res.status(500).json({ message: "내 정보 수정 중 오류가 발생했습니다." });
	}
};

export const deleteMyAccount = async (req, res) => {
	try {
		const userId = req.user.userId;

		await deactivateUser(userId);

		res.status(200).json({ message: "회원 탈퇴가 완료되었습니다." });
	} catch (err) {
		console.error("회원 탈퇴 실패:", err);
		res.status(500).json({ message: "회원 탈퇴 중 오류가 발생했습니다." });
	}
};
