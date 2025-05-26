class CustomError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'CustomError';
  }
}

export default CustomError;
