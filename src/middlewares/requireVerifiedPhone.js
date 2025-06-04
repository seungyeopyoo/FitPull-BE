import CustomError from "../utils/customError.js";
import messages from "../constants/messages.js";

const requireVerifiedPhone = (req, res, next) => {
  if (!req.user || !req.user.verifiedPhone) {
    throw new CustomError(403, "PHONE_NOT_VERIFIED", messages.PHONE_NOT_VERIFIED);
  }
  next();
};

export default requireVerifiedPhone;