export const ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: "상품을 찾을 수 없습니다.",
  NO_PERMISSION: "권한이 없습니다.",
  INVALID_PRICE: "가격은 0보다 커야 합니다.",
  AUTH_REQUIRED: "인증이 필요합니다.",
  RENTAL_NOT_FOUND: "요청 정보를 찾을 수 없습니다.",
  RENTAL_DATE_CONFLICT: "해당 기간은 이미 예약되어 있습니다.",
  REVIEW_NOT_FOUND: "리뷰를 찾을 수 없습니다.",
  ONLY_OWN_REVIEW: "본인 리뷰만 수정할 수 있습니다.",
  ONLY_OWN_DELETE: "본인 리뷰만 삭제할 수 있습니다.",
  ALREADY_REVIEWED: "이미 해당 대여에 리뷰를 작성하셨습니다.",
  ONLY_COMPLETED_RENTAL: "본인이 완료한 대여에만 리뷰를 작성할 수 있습니다.",
  INVALID_RATING: "별점은 1~5 사이여야 합니다.",
  IMAGE_LIMIT_EXCEEDED: "이미지는 최대 3개까지 첨부할 수 있습니다.",
};

export const SUCCESS_MESSAGES = {
  PRODUCT_CREATED: "상품이 등록되었습니다.",
  PRODUCT_UPDATED: "상품이 수정되었습니다.",
  PRODUCT_DELETED: "상품이 삭제되었습니다.",
  PRODUCT_APPROVED: "상품이 승인되었습니다.",
  PRODUCT_REJECTED: "상품이 거절되었습니다.",
  RENTAL_APPROVED: "대여 요청이 승인되었습니다.",
  RENTAL_REJECTED: "대여 요청이 거절되었습니다.",
  REVIEW_CREATED: "리뷰가 등록되었습니다.",
  REVIEW_UPDATED: "리뷰가 수정되었습니다.",
  REVIEW_DELETED: "리뷰가 삭제되었습니다.",
};

export default {
  SIGNUP_SUCCESS: "회원가입이 완료되었습니다.",
  LOGIN_SUCCESS: "로그인 성공",
  LOGOUT_SUCCESS: "로그아웃 되었습니다.",
  PASSWORD_MISMATCH: "비밀번호가 일치하지 않습니다.",
  EMAIL_EXISTS: "이미 가입된 이메일입니다.",
  USER_NOT_FOUND: "존재하지 않는 사용자입니다.",
  REFRESH_TOKEN_REQUIRED: "refreshToken이 필요합니다.",
  INVALID_REFRESH_TOKEN: "유효하지 않은 refreshToken입니다.",
  REFRESH_TOKEN_SUCCESS: "토큰 재발급 성공",
  GET_MY_PROFILE_SUCCESS: "내 정보 조회 성공",
  UPDATE_MY_PROFILE_SUCCESS: "내 정보가 수정되었습니다.",
  DELETE_MY_ACCOUNT_SUCCESS: "회원 탈퇴가 완료되었습니다.",
}; 