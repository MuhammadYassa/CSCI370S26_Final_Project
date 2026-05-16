const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const {
  UnauthorizedError
} = require('../utils/errors');

async function authMiddleware(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization || '';
    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedError('A valid Bearer token is required.');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Missing required environment variable: JWT_SECRET');
    }

    const payload = jwt.verify(token, secret);
    const user = await authService.getUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedError('Authentication is no longer valid.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      next(new UnauthorizedError('A valid Bearer token is required.'));
      return;
    }

    next(error);
  }
}

module.exports = {
  authMiddleware
};
