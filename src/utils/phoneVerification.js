import { sendSMS } from "./sms.js";
import { setPhoneCode, getPhoneCode, deletePhoneCode } from "./redis.js";

export const sendVerificationCode = async (phone) => {
  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6자리
  await setPhoneCode(phone, code);
  await sendSMS(phone, `[핏풀] 인증번호는 ${code}입니다. (3분 이내 입력)`);
};

export const verifyCode = async (phone, inputCode) => {
  const savedCode = await getPhoneCode(phone);
  if (!savedCode) throw new Error("인증번호가 만료되었습니다.");
  if (savedCode !== inputCode) throw new Error("인증번호가 일치하지 않습니다.");
  await deletePhoneCode(phone);
  return true;
};
