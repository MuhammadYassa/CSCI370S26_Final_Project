const multer = require('multer');
const { AppError } = require('../utils/errors');

function notFoundMiddleware(req, res, next) {
  next(new AppError('NOT_FOUND', 'The requested resource was not found.', 404));
}

function errorMiddleware(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred.';
  let fields = err.fields;

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Please correct the highlighted fields.';

    if (err.code === 'LIMIT_FILE_SIZE') {
      fields = {
        evidenceImages: 'Each evidence image must be 5MB or smaller.'
      };
    } else {
      fields = {
        evidenceImages: err.message
      };
    }
  } else if (!(err instanceof AppError)) {
    statusCode = 500;
    code = 'SERVER_ERROR';
    message = 'An unexpected error occurred.';
    fields = undefined;
  }

  const response = {
    error: {
      code,
      message
    }
  };

  if (fields && Object.keys(fields).length > 0) {
    response.error.fields = fields;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  notFoundMiddleware,
  errorMiddleware
};
