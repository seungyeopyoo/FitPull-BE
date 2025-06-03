import { sendSMS } from "./sms.js";
import { setPhoneCode, getPhoneCode, deletePhoneCode } from "./redis.js";
import CustomError from "../utils/customError.js"; 
import messages from "../constants/messages.js";    

export const sendVerificationCode = async (phone) => {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await setPhoneCode(phone, code);
  await sendSMS(phone, `[fitpulloverflow] 인증번호는 ${code}입니다. (3분 이내 입력)`);
};

export const verifyCode = async (phone, inputCode) => {
  const savedCode = await getPhoneCode(phone);

  if (!savedCode) {
    throw new CustomError(400, "EXPIRED_CODE", messages.EXPIRED_CODE);
  }

  if (savedCode !== inputCode) {
    throw new CustomError(400, "INVALID_CODE", messages.INVALID_CODE);
  }

  await deletePhoneCode(phone);
  return true;
};