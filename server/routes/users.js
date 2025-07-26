const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User-sqlite');
const { authenticateToken, isStaff } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all users (staff only)
router.get('/', isStaff, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;

    // For now, we'll get all users and filter in memory
    // In a production app, you'd want to implement proper pagination in the model
    const users = await User.findAll(1000, 0); // Get all users for now
    
    let filteredUsers = users.filter(user => user.is_active);

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const total = filteredUsers.length;
    const startIndex = offset;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user (staff only)
router.put('/:id', isStaff, [
  body('first_name').optional().trim().notEmpty(),
  body('last_name').optional().trim().notEmpty(),
  body('role').optional().isIn(['admin', 'manager', 'staff', 'user'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { first_name, last_name, role } = req.body;

    // Update user
    const updated = await User.update(id, { first_name, last_name, role });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get updated user
    const user = await User.findById(id);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Soft delete user (staff only)
router.delete('/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await User.softDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Restore soft deleted user (staff only)
router.post('/:id/restore', isStaff, async (req, res) => {
  try {
    const { id } = req.params;

    const restored = await User.restore(id);
    if (!restored) {
      return res.status(404).json({
        success: false,
        message: 'User not found or not deleted'
      });
    }

    res.json({
      success: true,
      message: 'User restored successfully'
    });
  } catch (error) {
    console.error('Restore user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 