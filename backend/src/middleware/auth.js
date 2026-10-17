const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * @param {boolean} required - Whether authentication is strictly required
 */
const auth = (required = false) => {
  return async (req, res, next) => {
    if (req.method === 'OPTIONS') return next();
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        if (required) {
          return res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
        }
        req.user = null;
        return next();
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'civic_triage_jwt_super_secret_key');
      const user = await User.findById(decoded.id).select('-passwordHash');

      if (!user) {
        if (required) {
          return res.status(401).json({ error: 'User no longer exists.' });
        }
        req.user = null;
        return next();
      }

      req.user = user;
      next();
    } catch (err) {
      if (required) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
      }
      req.user = null;
      next();
    }
  };
};

/**
 * Require admin role middleware
 */
const requireAdmin = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
  }
  next();
};

module.exports = {
  auth,
  requireAdmin,
};
