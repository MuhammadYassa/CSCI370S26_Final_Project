class AppError extends Error {
  constructor(code, message, statusCode, fields) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.fields = fields;
  }
}

class ValidationError extends AppError {
  constructor(message = 'Please correct the highlighted fields.', fields = {}) {
    super('VALIDATION_ERROR', message, 400, fields);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication is required.') {
    super('UNAUTHORIZED', message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'You do not have access to this resource.') {
    super('FORBIDDEN', message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'The requested resource was not found.') {
    super('NOT_FOUND', message, 404);
  }
}

class ServerError extends AppError {
  constructor(message = 'An unexpected error occurred.') {
    super('SERVER_ERROR', message, 500);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ServerError
};
