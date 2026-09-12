import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

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
    const user = await User.findOne({ username: cleanUsername });

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

    const isMatch = await user.comparePassword(password);
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
    const user = await User.findById(req.user._id).select('-password');
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
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, username, currentPassword, newPassword } = req.body;

    // If updating username, check uniqueness
    if (username && username.trim().toLowerCase() !== user.username) {
      const cleanNewUsername = username.trim().toLowerCase();
      const existing = await User.findOne({ username: cleanNewUsername });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken. Please choose another.',
        });
      }
      user.username = cleanNewUsername;
    }

    if (name) {
      user.name = name.trim();
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
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Current password does not match',
          });
        }
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Account updated successfully',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
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
    const users = await User.find({}).select('-password').sort({ role: 1, createdAt: -1 });
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
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists. Please choose a different one.',
      });
    }

    // Check limit on staff accounts (Max 3)
    if (role === 'staff') {
      const currentStaffCount = await User.countDocuments({ role: 'staff' });
      if (currentStaffCount >= MAX_STAFF_ACCOUNTS) {
        return res.status(400).json({
          success: false,
          message: `Limit reached: You can create a maximum of ${MAX_STAFF_ACCOUNTS} team accounts. Delete an existing account to add a new one.`,
        });
      }
    }

    const newUser = await User.create({
      username: cleanUsername,
      password,
      name: name.trim(),
      role: role === 'admin' ? 'admin' : 'staff',
      isActive: true,
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userResponse,
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

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (username && username.trim().toLowerCase() !== user.username) {
      const cleanUsername = username.trim().toLowerCase();
      const existing = await User.findOne({ username: cleanUsername });
      if (existing && existing._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'Username is already in use',
        });
      }
      user.username = cleanUsername;
    }

    if (name) user.name = name.trim();
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (role && ['admin', 'staff'].includes(role)) user.role = role;
    if (password && password.trim().length >= 6) {
      user.password = password.trim();
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

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

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User account deleted successfully. 1 slot freed.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
