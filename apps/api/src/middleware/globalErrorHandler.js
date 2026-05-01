const httpStatus = require("http-status");

const globalErrorHandler = (err, req, res, next) => {
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong!";
  let errorSources = [];

  if (err.message) {
    message = err.message;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: process.env.NODE_ENV === "development" ? err?.stack : null,
  });
};

module.exports = globalErrorHandler;
