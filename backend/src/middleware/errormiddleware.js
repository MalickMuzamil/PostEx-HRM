import { logger } from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {

  logger.error("Server Error", {
    message: err.message,
    stack: err.stack
  });

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      status: 409,
      message: 'An entry with this name already exists.'
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    status: statusCode,
    message: err.message || "Internal Server Error"
  });
};
