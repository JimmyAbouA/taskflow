const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/token');

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

// POST /api/auth/register
async function register(req, res) {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('An account with that email already exists');
  }

  // Role is deliberately not read from the body - otherwise anyone could
  // register themselves as an admin.
  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    data: { user: publicUser(user), token: signToken(user) },
  });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  // password is select:false on the schema, so ask for it explicitly.
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  // Same message whether the email or the password was wrong, so the endpoint
  // cannot be used to discover which emails have accounts.
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  res.json({
    success: true,
    data: { user: publicUser(user), token: signToken(user) },
  });
}

// GET /api/auth/me
async function getMe(req, res) {
  res.json({ success: true, data: { user: publicUser(req.user) } });
}

module.exports = { register, login, getMe };
