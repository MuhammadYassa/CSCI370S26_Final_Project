const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const caseRoutes = require('./routes/caseRoutes');
const authController = require('./controllers/authController');
const { authMiddleware } = require('./middleware/authMiddleware');
const { asyncHandler } = require('./utils/asyncHandler');
const {
  notFoundMiddleware,
  errorMiddleware
} = require('./middleware/errorMiddleware');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});

app.use('/api/auth', authRoutes);
app.get('/api/me', authMiddleware, asyncHandler(authController.getMe));
app.use('/api', caseRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
