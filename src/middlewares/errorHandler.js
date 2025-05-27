import CustomError from '../utils/customError.js';

function errorHandler(err, req, res, next) {
  if (err instanceof CustomError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
  // 예상치 못한 에러
  return res.status(500).json({
    success: false,
    message: '서버 내부 오류',
    code: 'INTERNAL_SERVER_ERROR',
  });
}

export default errorHandler;
