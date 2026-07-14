/**
 * Middleware to intercept unmatched routes and throw a 404 Not Found response.
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export default notFoundHandler;
