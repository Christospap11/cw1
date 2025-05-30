const express = require('express');
const { pool, isUsingInMemory, inMemoryQueries } = require('../config/database');

const router = express.Router();

// Get all restaurants with search functionality
router.get('/restaurants', async (req, res) => {
  try {
    const { search, location, cuisine, page = 1, limit = 10 } = req.query;
    
    if (isUsingInMemory()) {
      // Use in-memory database
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const { restaurants, total } = await inMemoryQueries.getRestaurants(
        search, location, cuisine, parseInt(limit), offset
      );

      res.json({
        success: true,
        data: {
          restaurants,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
      return;
    }

    // Use MySQL database (original code)
    let query = `
      SELECT id, name, location, description, image_url, rating, price_range, cuisine_type, 
             created_at, updated_at 
      FROM restaurants 
      WHERE 1=1
    `;
    
    const queryParams = [];

    // Search by name or location
    if (search) {
      query += ` AND (name LIKE ? OR location LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    // Filter by location
    if (location) {
      query += ` AND location LIKE ?`;
      queryParams.push(`%${location}%`);
    }

    // Filter by cuisine type
    if (cuisine) {
      query += ` AND cuisine_type LIKE ?`;
      queryParams.push(`%${cuisine}%`);
    }

    // Add ordering
    query += ` ORDER BY rating DESC, name ASC`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    const connection = await pool.getConnection();
    try {
      // Get restaurants
      const [restaurants] = await connection.execute(query, queryParams);

      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) as total FROM restaurants WHERE 1=1`;
      const countParams = [];
      
      if (search) {
        countQuery += ` AND (name LIKE ? OR location LIKE ?)`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm);
      }
      
      if (location) {
        countQuery += ` AND location LIKE ?`;
        countParams.push(`%${location}%`);
      }
      
      if (cuisine) {
        countQuery += ` AND cuisine_type LIKE ?`;
        countParams.push(`%${cuisine}%`);
      }

      const [countResult] = await connection.execute(countQuery, countParams);
      const total = countResult[0].total;

      res.json({
        success: true,
        data: {
          restaurants,
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
    console.error('Get restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single restaurant by ID
router.get('/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isUsingInMemory()) {
      // Use in-memory database
      const restaurant = await inMemoryQueries.getRestaurantById(id);
      
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      res.json({
        success: true,
        data: {
          restaurant
        }
      });
      return;
    }

    // Use MySQL database (original code)
    const connection = await pool.getConnection();
    try {
      const [restaurants] = await connection.execute(
        `SELECT id, name, location, description, image_url, rating, price_range, cuisine_type, 
                created_at, updated_at 
         FROM restaurants 
         WHERE id = ?`,
        [id]
      );

      if (restaurants.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      res.json({
        success: true,
        data: {
          restaurant: restaurants[0]
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get unique cuisine types for filtering
router.get('/restaurants/meta/cuisines', async (req, res) => {
  try {
    if (isUsingInMemory()) {
      // Use in-memory database
      const cuisines = await inMemoryQueries.getCuisines();
      res.json({
        success: true,
        data: {
          cuisines
        }
      });
      return;
    }

    // Use MySQL database (original code)
    const connection = await pool.getConnection();
    try {
      const [cuisines] = await connection.execute(
        'SELECT DISTINCT cuisine_type FROM restaurants WHERE cuisine_type IS NOT NULL ORDER BY cuisine_type'
      );

      res.json({
        success: true,
        data: {
          cuisines: cuisines.map(row => row.cuisine_type)
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get cuisines error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get unique locations for filtering
router.get('/restaurants/meta/locations', async (req, res) => {
  try {
    if (isUsingInMemory()) {
      // Use in-memory database
      const locations = await inMemoryQueries.getLocations();
      res.json({
        success: true,
        data: {
          locations
        }
      });
      return;
    }

    // Use MySQL database (original code)
    const connection = await pool.getConnection();
    try {
      const [locations] = await connection.execute(
        'SELECT DISTINCT location FROM restaurants ORDER BY location'
      );

      res.json({
        success: true,
        data: {
          locations: locations.map(row => row.location)
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 