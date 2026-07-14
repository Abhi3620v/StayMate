import PerformanceMetric from '../../../models/PerformanceMetric.js';
import { isDbConnected } from '../../../config/inMemoryDb.js';

export const monitoringMiddleware = async (req, res, next) => {
  // Capture request time
  const start = process.hrtime();
  
  // Track IP Address
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown IP';
  if (ip.includes('::ffff:')) {
    ip = ip.split('::ffff:')[1];
  }

  // Intercept response finish
  res.on('finish', async () => {
    // Exclude static asset and check requests
    if (req.originalUrl.startsWith('/assets') || req.originalUrl.includes('favicon.ico')) {
      return;
    }

    const diff = process.hrtime(start);
    const responseTime = Math.round((diff[0] * 1e3 + diff[1] * 1e-6) * 100) / 100; // in milliseconds

    const userId = req.user ? req.user._id : null;
    const cacheHit = res.get('X-Cache') === 'HIT';

    // Build metric payload
    const logPayload = {
      path: req.originalUrl || req.url,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      dbQueryTime: cacheHit ? 0 : Math.round(responseTime * 0.4), // Mock Mongoose query slice
      cacheHit,
      userId,
      ipAddress: ip,
      timestamp: new Date()
    };

    // Log slow endpoints (> 500ms) to stdout in dev
    if (responseTime > 500) {
      console.warn(`⚠️ [SLOW ENDPOINT] Path: ${req.method} ${logPayload.path} | Duration: ${responseTime}ms | Status: ${res.statusCode}`);
    }

    try {
      if (isDbConnected()) {
        await PerformanceMetric.create(logPayload);
      } else {
        // Mock print logs if debug is enabled (optional)
      }
    } catch (err) {
      console.error('Failed to log performance metric:', err.message);
    }
  });

  next();
};

export default monitoringMiddleware;
