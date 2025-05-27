const success = (res, message, data = null) => {
  return res.json({
    success: true,
    message,
    data,
  });
};

const fail = (res, message, code, status = 400) => {
  return res.status(status).json({
    success: false,
    message,
    code,
  });
};

export { success, fail };
