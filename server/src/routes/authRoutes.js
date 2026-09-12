import express from 'express';
import {
  login,
  getMe,
  updateMe,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/authController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Authenticated user routes
router.get('/me', protect, getMe);
router.put('/update-me', protect, updateMe);

// Admin-only user management routes (max 3 users limit enforced in controller)
router.get('/users', protect, requireAdmin, getUsers);
router.post('/users', protect, requireAdmin, createUser);
router.put('/users/:id', protect, requireAdmin, updateUser);
router.delete('/users/:id', protect, requireAdmin, deleteUser);

export default router;
