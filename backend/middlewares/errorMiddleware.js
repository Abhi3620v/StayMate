import AppError from '../utils/AppError.js';

/**
 * Centralized global error handling middleware for formatting Express API exceptions.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message || 'Internal Server Error';
  error.statusCode = err.statusCode || 500;
  error.details = err.details || [];

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid path: ${err.path}`;
    error = new AppError(message, 400);
  }

  // Mongoose duplicate key error (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    error = new AppError(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((val) => ({
      field: val.path,
      issue: val.message,
    }));
    error = new AppError('Validation failed', 400, details);
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Session expired, please login again.', 401, [
      { field: 'token', issue: 'TOKEN_EXPIRED' }
    ]);
  }

  // JWT invalid
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication credentials.', 401);
  }

  // Rate Limiting Error
  if (err.statusCode === 429) {
    error = new AppError('Too many requests. Please try again later.', 429);
  }

  // In Production, obscure stack trace and unexpected errors
  const isDev = process.env.NODE_ENV === 'development';

  res.status(error.statusCode).json({
    success: false,
    error: {
      message: error.message,
      details: error.details,
      stack: isDev ? err.stack : undefined,
    },
  });
};

export default errorHandler;
