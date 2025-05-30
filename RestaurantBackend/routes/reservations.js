const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create a new reservation (requires authentication)
router.post('/reservations', authenticateToken, [
  body('restaurant_id').isInt({ min: 1 }).withMessage('Valid restaurant ID is required'),
  body('date').isISO8601().withMessage('Valid date is required (YYYY-MM-DD)'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required (HH:MM)'),
  body('people_count').isInt({ min: 1, max: 20 }).withMessage('People count must be between 1 and 20'),
  body('special_requests').optional().isLength({ max: 500 }).withMessage('Special requests must be less than 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { restaurant_id, date, time, people_count, special_requests } = req.body;
    const user_id = req.user.id;

    const connection = await pool.getConnection();
    try {
      // Check if restaurant exists
      const [restaurants] = await connection.execute(
        'SELECT id FROM restaurants WHERE id = ?',
        [restaurant_id]
      );

      if (restaurants.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      // Check if the date is not in the past
      const reservationDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (reservationDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Cannot make reservations for past dates'
        });
      }

      // Insert reservation
      const [result] = await connection.execute(
        `INSERT INTO reservations (user_id, restaurant_id, date, time, people_count, special_requests) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, restaurant_id, date, time, people_count, special_requests || null]
      );

      // Get the created reservation with restaurant details
      const [reservations] = await connection.execute(
        `SELECT r.*, rest.name as restaurant_name, rest.location as restaurant_location,
                u.name as user_name, u.email as user_email
         FROM reservations r
         JOIN restaurants rest ON r.restaurant_id = rest.id
         JOIN users u ON r.user_id = u.id
         WHERE r.id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Reservation created successfully',
        data: {
          reservation: reservations[0]
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's reservations (requires authentication)
router.get('/user/reservations', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT r.*, rest.name as restaurant_name, rest.location as restaurant_location,
             rest.image_url as restaurant_image, rest.rating as restaurant_rating
      FROM reservations r
      JOIN restaurants rest ON r.restaurant_id = rest.id
      WHERE r.user_id = ?
    `;
    
    const queryParams = [user_id];

    // Filter by status if provided
    if (status && ['confirmed', 'cancelled', 'completed'].includes(status)) {
      query += ` AND r.status = ?`;
      queryParams.push(status);
    }

    // Order by date and time (most recent first)
    query += ` ORDER BY r.date DESC, r.time DESC`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    const connection = await pool.getConnection();
    try {
      const [reservations] = await connection.execute(query, queryParams);

      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) as total FROM reservations WHERE user_id = ?`;
      const countParams = [user_id];
      
      if (status && ['confirmed', 'cancelled', 'completed'].includes(status)) {
        countQuery += ` AND status = ?`;
        countParams.push(status);
      }

      const [countResult] = await connection.execute(countQuery, countParams);
      const total = countResult[0].total;

      res.json({
        success: true,
        data: {
          reservations,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get user reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific reservation (requires authentication and ownership)
router.get('/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const connection = await pool.getConnection();
    try {
      const [reservations] = await connection.execute(
        `SELECT r.*, rest.name as restaurant_name, rest.location as restaurant_location,
                rest.image_url as restaurant_image, rest.rating as restaurant_rating,
                rest.description as restaurant_description
         FROM reservations r
         JOIN restaurants rest ON r.restaurant_id = rest.id
         WHERE r.id = ? AND r.user_id = ?`,
        [id, user_id]
      );

      if (reservations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
      }

      res.json({
        success: true,
        data: {
          reservation: reservations[0]
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update reservation (requires authentication and ownership)
router.put('/reservations/:id', authenticateToken, [
  body('date').optional().isISO8601().withMessage('Valid date is required (YYYY-MM-DD)'),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required (HH:MM)'),
  body('people_count').optional().isInt({ min: 1, max: 20 }).withMessage('People count must be between 1 and 20'),
  body('special_requests').optional().isLength({ max: 500 }).withMessage('Special requests must be less than 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const user_id = req.user.id;
    const { date, time, people_count, special_requests } = req.body;

    const connection = await pool.getConnection();
    try {
      // Check if reservation exists and belongs to user
      const [existingReservations] = await connection.execute(
        'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
        [id, user_id]
      );

      if (existingReservations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
      }

      const reservation = existingReservations[0];

      // Check if reservation can be modified (not cancelled or completed)
      if (reservation.status === 'cancelled' || reservation.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot modify cancelled or completed reservations'
        });
      }

      // Check if the new date is not in the past (if date is being updated)
      if (date) {
        const reservationDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (reservationDate < today) {
          return res.status(400).json({
            success: false,
            message: 'Cannot modify reservation to a past date'
          });
        }
      }

      // Build update query dynamically
      const updateFields = [];
      const updateParams = [];

      if (date) {
        updateFields.push('date = ?');
        updateParams.push(date);
      }
      if (time) {
        updateFields.push('time = ?');
        updateParams.push(time);
      }
      if (people_count) {
        updateFields.push('people_count = ?');
        updateParams.push(people_count);
      }
      if (special_requests !== undefined) {
        updateFields.push('special_requests = ?');
        updateParams.push(special_requests || null);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateParams.push(id);

      await connection.execute(
        `UPDATE reservations SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );

      // Get updated reservation with restaurant details
      const [updatedReservations] = await connection.execute(
        `SELECT r.*, rest.name as restaurant_name, rest.location as restaurant_location,
                rest.image_url as restaurant_image, rest.rating as restaurant_rating
         FROM reservations r
         JOIN restaurants rest ON r.restaurant_id = rest.id
         WHERE r.id = ?`,
        [id]
      );

      res.json({
        success: true,
        message: 'Reservation updated successfully',
        data: {
          reservation: updatedReservations[0]
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cancel reservation (requires authentication and ownership)
router.delete('/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const connection = await pool.getConnection();
    try {
      // Check if reservation exists and belongs to user
      const [existingReservations] = await connection.execute(
        'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
        [id, user_id]
      );

      if (existingReservations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
      }

      const reservation = existingReservations[0];

      // Check if reservation is already cancelled
      if (reservation.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Reservation is already cancelled'
        });
      }

      // Update status to cancelled instead of deleting
      await connection.execute(
        'UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['cancelled', id]
      );

      res.json({
        success: true,
        message: 'Reservation cancelled successfully'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 