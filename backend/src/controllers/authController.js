const authService = require('../services/authService');

async function register(req, res) {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
}

async function login(req, res) {
  const result = await authService.loginUser(req.body);
  res.json(result);
}

async function getMe(req, res) {
  res.json(req.user);
}

module.exports = {
  register,
  login,
  getMe
};
