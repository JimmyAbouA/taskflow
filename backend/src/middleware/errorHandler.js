const ApiError = require('../utils/ApiError');

// Anything that reaches here is turned into a consistent JSON error shape:
//   { success: false, error: { message, details? } }
// Keeping this in one place means no route handler has to format errors itself.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let details;

  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `'${err.value}' is not a valid ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with that ${field} already exists`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired, please log in again';
  } else if (err instanceof ApiError) {
    details = err.details;
  }

  // Never leak internals on a 500 in production.
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error';
  }

  if (statusCode === 500) {
    console.error('[error]', err);
  }

  const body = { success: false, error: { message } };
  if (details) body.error.details = details;
  if (statusCode === 500 && process.env.NODE_ENV !== 'production') {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

function notFound(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

module.exports = { errorHandler, notFound };
