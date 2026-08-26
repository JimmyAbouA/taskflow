const jwt = require('jsonwebtoken');

function signToken(user) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
  }

  // `sub` (subject) is the standard JWT claim for "who this token is about".
  // Only the id and role go in: a JWT payload is signed, not encrypted, so
  // anyone holding the token can read it.
  return jwt.sign({ sub: user._id.toString(), role: user.role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
