import jwt from 'jsonwebtoken';
import { Store } from '../services/storeService.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lufo_clothing_crm_secret_key_2026_super_secure_token');
      req.user = await Store.getUserById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found or deleted' });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ success: false, message: 'Account has been deactivated' });
      }

      return next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
  }
};
