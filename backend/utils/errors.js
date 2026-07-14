/**
 * Base Application Error class
 */
export class AppError extends Error {
  constructor(message, statusCode, errorCode = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true; // Demarcates known system operational exceptions

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * HTTP 400 - Validation Schema Failures
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * HTTP 401 - Authentication Exceptions
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * HTTP 403 - Forbidden Access Exceptions
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access denied: Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * HTTP 404 - Resource Missing
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * HTTP 409 - Conflict States (e.g. Duplicate emails)
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict detected') {
    super(message, 409, 'CONFLICT');
  }
}
