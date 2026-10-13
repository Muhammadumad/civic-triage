/**
 * In-memory sliding window rate limiter
 * Protects critical endpoints (e.g. login, register) from brute-force attacks
 * without introducing external dependencies.
 */

const createRateLimiter = ({ windowMs = 60 * 1000, maxRequests = 10, message = 'Too many requests. Please try again later.' }) => {
  const ipRequests = new Map();

  // Periodic cleanup every 5 minutes to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of ipRequests.entries()) {
      const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
      if (validTimestamps.length === 0) {
        ipRequests.delete(ip);
      } else {
        ipRequests.set(ip, validTimestamps);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown-ip';
    const now = Date.now();
    const timestamps = ipRequests.get(ip) || [];

    // Filter requests within current window
    const recentRequests = timestamps.filter(ts => now - ts < windowMs);

    if (recentRequests.length >= maxRequests) {
      const retryAfterSeconds = Math.ceil((recentRequests[0] + windowMs - now) / 1000);
      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        error: message,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
      });
    }

    recentRequests.push(now);
    ipRequests.set(ip, recentRequests);
    next();
  };
};

module.exports = {
  authLimiter: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,     // 10 requests per minute
    message: 'Too many authentication attempts. Please wait a minute before retrying.',
  }),
  createRateLimiter,
};
