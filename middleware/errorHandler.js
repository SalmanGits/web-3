
//its my package only
const { sendResponse } = require("res-express")

const errorHandler = (error, req, res, next) => {
  console.log(error)
  if (error.status === 401 && error.message === "Unauthorized") {
    const status = 401;
    const message = "Requires authentication";
    sendResponse({ res, status, data: { message } });
    return;
  }

  if (
    (error.status === 401 && error.message === "Permission denied") ||
    (error.status === 401 && error.message === 'Invalid token')
  ) {
    const status = 403;
    const message = error.message;

    sendResponse({ res, status, data: { message } });
    return;
  }

  const status = error.statusCode || error.code || 500;
  const message = error.message || "Internal Server Error";

  sendResponse({ res, status, data: { message } });
};

module.exports = errorHandler;
