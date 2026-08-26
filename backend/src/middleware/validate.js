const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Runs after a route's express-validator chain and turns any collected
// problems into a single 400 response.
function validate(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const details = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  return next(ApiError.badRequest('Validation failed', details));
}

module.exports = validate;
