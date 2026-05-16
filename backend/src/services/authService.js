const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const {
  ValidationError,
  UnauthorizedError
} = require('../utils/errors');
const {
  validateRegistrationInput,
  validateLoginInput
} = require('../utils/validation');

function mapUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role
  };
}

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    }
  );
}

async function registerUser(payload) {
  const input = validateRegistrationInput(payload);
  const pool = getPool();

  const [existingUsers] = await pool.execute(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [input.email]
  );

  if (existingUsers.length > 0) {
    throw new ValidationError('Please correct the highlighted fields.', {
      email: 'An account with this email already exists.'
    });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const [result] = await pool.execute(
    `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `,
    [input.fullName, input.email, passwordHash, input.role]
  );

  const user = {
    id: result.insertId,
    fullName: input.fullName,
    email: input.email,
    role: input.role
  };

  return {
    message: 'Account created successfully.',
    user
  };
}

async function loginUser(payload) {
  const input = validateLoginInput(payload);
  const pool = getPool();

  const [rows] = await pool.execute(
    `
      SELECT id, full_name, email, password_hash, role
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [input.email]
  );

  const userRow = rows[0];
  if (!userRow) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(input.password, userRow.password_hash);
  if (!passwordMatches) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const user = mapUser(userRow);

  return {
    token: signToken(user),
    user
  };
}

async function getUserById(userId) {
  const pool = getPool();
  const [rows] = await pool.execute(
    `
      SELECT id, full_name, email, role
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] ? mapUser(rows[0]) : null;
}

module.exports = {
  registerUser,
  loginUser,
  getUserById
};
