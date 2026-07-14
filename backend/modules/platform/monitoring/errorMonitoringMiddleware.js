import ErrorLog from '../../../models/ErrorLog.js';
import { isDbConnected } from '../../../config/inMemoryDb.js';

export const errorMonitoringMiddleware = async (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  // Extract path and module info
  const route = req.originalUrl || req.url || 'Unknown Route';
  let moduleName = 'system';
  if (route.startsWith('/api/v1/')) {
    moduleName = route.split('/api/v1/')[1]?.split('/')[0] || 'system';
  }

  // Extract client telemetry
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown IP';
  if (ip.includes('::ffff:')) {
    ip = ip.split('::ffff:')[1];
  }
  const userAgent = req.headers['user-agent'] || 'Unknown Agent';
  const userId = req.user ? req.user._id : null;

  // Determine severity based on status code
  let severity = 'medium';
  if (statusCode >= 500) {
    severity = 'high';
  }
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    severity = 'low';
  }

  const logPayload = {
    message,
    stack: err.stack || '',
    module: moduleName,
    route,
    method: req.method || 'GET',
    statusCode,
    userId,
    ipAddress: ip,
    userAgent,
    environment: process.env.NODE_ENV || 'production',
    severity,
    timestamp: new Date()
  };

  // Log error to stdout for debugging
  console.error(`🔴 [ERROR MONITORED] Module: ${moduleName} | Route: ${logPayload.method} ${route} | Status: ${statusCode} | Msg: ${message}`);

  try {
    if (isDbConnected()) {
      await ErrorLog.create(logPayload);
    }
  } catch (logErr) {
    console.error('Failed to save ErrorLog trail:', logErr.message);
  }

  // Pass to standard JSON error renderer (ensuring we don't break existing response structures)
  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorMonitoringMiddleware;
