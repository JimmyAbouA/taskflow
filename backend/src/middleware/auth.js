const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/token');

// Rejects the request unless it carries a valid `Authorization: Bearer <token>`
// header, and attaches the matching user to req.user for later handlers.
async function protect(req, res, next) {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  const token = header.slice('Bearer '.length).trim();

  if (!token) {
    return next(ApiError.unauthorized('No token provided'));
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);

    if (!user) {
      return next(ApiError.unauthorized('The user for this token no longer exists'));
    }

    req.user = user;
    return next();
  } catch (err) {
    // Let errorHandler translate JsonWebTokenError / TokenExpiredError.
    return next(err);
  }
}

// Use after `protect` to restrict a route to particular roles.
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`This action requires one of: ${roles.join(', ')}`));
    }
    return next();
  };
}

module.exports = { protect, authorize };
