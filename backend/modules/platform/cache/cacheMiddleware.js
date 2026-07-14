import cacheService from './cacheService.js';

/**
 * Route caching middleware interceptor
 * @param {number} ttlInSeconds - Time to live in seconds
 * @returns {Function} Express middleware function
 */
export const cacheMiddleware = (ttlInSeconds = 60) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      // If performing updates, invalidate corresponding cache namespaces
      const path = req.originalUrl || req.url;
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        if (path.includes('/properties')) {
          cacheService.invalidatePattern('/properties');
          cacheService.invalidatePattern('/api/v1/properties');
        }
        if (path.includes('/roommates')) {
          cacheService.invalidatePattern('/roommates');
          cacheService.invalidatePattern('/api/v1/roommates');
        }
        if (path.includes('/reviews')) {
          cacheService.invalidatePattern('/reviews');
          cacheService.invalidatePattern('/api/v1/reviews');
        }
        if (path.includes('/profile') || path.includes('/users')) {
          cacheService.invalidatePattern('/users');
          cacheService.invalidatePattern('/auth/me');
          cacheService.invalidatePattern('/api/v1/auth/me');
        }
      }
      return next();
    }

    // Exclude admin analytics and job execution lookups
    const url = req.originalUrl || req.url;
    if (url.includes('/admin') || url.includes('/platform') || url.includes('/unread-count')) {
      return next();
    }

    // Generate unique key based on URL, params, and user context (if separate profile summaries are needed)
    const userId = req.user ? String(req.user._id) : 'guest';
    const key = `${userId}:${url}`;

    const cachedData = cacheService.get(key);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json(cachedData);
    }

    res.set('X-Cache', 'MISS');

    // Override res.json to capture response body
    const originalJson = res.json;
    res.json = function (body) {
      // Only cache successful JSON payloads
      if (res.statusCode === 200 && body && body.success !== false) {
        cacheService.set(key, body, ttlInSeconds);
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

export default cacheMiddleware;
