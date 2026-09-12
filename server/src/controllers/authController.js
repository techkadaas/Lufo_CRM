import jwt from 'jsonwebtoken';
import { Store } from '../services/storeService.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'lufo_clothing_crm_secret_key_2026_super_secure_token', {
    expiresIn: '30d',
  });
};

const MAX_STAFF_ACCOUNTS = 3;

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password',
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const user = await Store.getUserByUsername(cleanUsername);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact the administrator.',
      });
    }

    const isMatch = await Store.comparePassword(user, password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await Store.getUserById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current user profile / change username & password
// @route   PUT /api/auth/update-me
// @access  Private
export const updateMe = async (req, res) => {
  try {
    const user = await Store.getUserByIdWithPassword(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, username, currentPassword, newPassword } = req.body;
    const updateData = {};

    // If updating username, check uniqueness
    if (username && username.trim().toLowerCase() !== user.username.toLowerCase()) {
      const cleanNewUsername = username.trim().toLowerCase();
      const existing = await Store.getUserByUsername(cleanNewUsername);
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken. Please choose another.',
        });
      }
      updateData.username = cleanNewUsername;
    }

    if (name) {
      updateData.name = name.trim();
    }

    // If changing password
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
        });
      }

      // If current password is provided, verify it
      if (currentPassword) {
        const isMatch = await Store.comparePassword(user, currentPassword);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Current password does not match',
          });
        }
      }
      updateData.password = newPassword;
    }

    const updatedUser = await Store.updateUser(user._id, updateData);

    res.json({
      success: true,
      message: 'Account updated successfully',
      token: generateToken(updatedUser._id),
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await Store.getUsers();
    const staffCount = users.filter((u) => u.role === 'staff').length;

    res.json({
      success: true,
      users,
      stats: {
        total: users.length,
        staffCount,
        maxStaffAccounts: MAX_STAFF_ACCOUNTS,
        availableSlots: Math.max(0, MAX_STAFF_ACCOUNTS - staffCount),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new sub-user/team account (Max 3 staff)
// @route   POST /api/auth/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { username, password, name, role = 'staff' } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Username, full name, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check username uniqueness
    const existing = await Store.getUserByUsername(cleanUsername);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists. Please choose a different one.',
      });
    }

    // Check limit on staff accounts (Max 3)
    if (role === 'staff') {
      const currentStaffCount = await Store.countStaffUsers();
      if (currentStaffCount >= MAX_STAFF_ACCOUNTS) {
        return res.status(400).json({
          success: false,
          message: `Limit reached: You can create a maximum of ${MAX_STAFF_ACCOUNTS} team accounts. Delete an existing account to add a new one.`,
        });
      }
    }

    const newUser = await Store.createUser({
      username: cleanUsername,
      password,
      name: name.trim(),
      role: role === 'admin' ? 'admin' : 'staff',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create user' });
  }
};

// @desc    Update a user (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password, isActive, role } = req.body;

    const user = await Store.getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updateData = {};

    if (username && username.trim().toLowerCase() !== user.username.toLowerCase()) {
      const cleanUsername = username.trim().toLowerCase();
      const existing = await Store.getUserByUsername(cleanUsername);
      if (existing && existing._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'Username is already in use',
        });
      }
      updateData.username = cleanUsername;
    }

    if (name) updateData.name = name.trim();
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (role && ['admin', 'staff'].includes(role)) updateData.role = role;
    if (password && password.trim().length >= 6) {
      updateData.password = password.trim();
    }

    const userResponse = await Store.updateUser(id, updateData);

    res.json({
      success: true,
      message: 'User account updated successfully',
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own active administrator account',
      });
    }

    const user = await Store.getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await Store.deleteUser(id);

    res.json({
      success: true,
      message: 'User account deleted successfully. 1 slot freed.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
