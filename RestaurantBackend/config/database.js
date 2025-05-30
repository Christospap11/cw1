const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });

// In-memory database for development (fallback when MySQL is not available)
let inMemoryRestaurants = [];
let inMemoryUsers = [];
let inMemoryReservations = [];
let isUsingInMemory = false;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'app_password',
  database: process.env.DB_NAME || 'restaurant_app'
};

// Create connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database and create tables
async function initDatabase() {
  try {
    // Try to connect to MySQL first
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1');
    connection.release();

    // Create tables
    await createTables();
    console.log('✅ Database initialized successfully with MySQL');
  } catch (error) {
    console.log('⚠️  MySQL not available, using in-memory database for development');
    isUsingInMemory = true;
    await createInMemoryData();
    console.log('✅ In-memory database initialized successfully');
  }
}

// Create in-memory sample data
async function createInMemoryData() {
  inMemoryRestaurants = [
    {
      id: 1,
      name: 'The Golden Spoon',
      location: 'Downtown Manhattan, New York',
      description: 'Elegant fine dining with contemporary American cuisine and exceptional service.',
      image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
      rating: 4.8,
      price_range: '$$$',
      cuisine_type: 'American',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Sakura Sushi',
      location: 'Little Tokyo, Los Angeles',
      description: 'Authentic Japanese sushi bar with fresh fish flown in daily from Tokyo.',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
      rating: 4.6,
      price_range: '$$',
      cuisine_type: 'Japanese',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Mama Mia Pizzeria',
      location: 'North End, Boston',
      description: 'Traditional Italian pizzeria with wood-fired ovens and homemade pasta.',
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
      rating: 4.4,
      price_range: '$',
      cuisine_type: 'Italian',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Le Jardin',
      location: 'French Quarter, New Orleans',
      description: 'Romantic French bistro with garden seating and live jazz music.',
      image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500',
      rating: 4.7,
      price_range: '$$$',
      cuisine_type: 'French',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Spice Route',
      location: 'Curry Hill, New York',
      description: 'Authentic Indian cuisine with traditional spices and vegetarian options.',
      image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
      rating: 4.3,
      price_range: '$$',
      cuisine_type: 'Indian',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Ocean Breeze',
      location: 'Santa Monica, California',
      description: 'Fresh seafood restaurant with ocean views and sustainable catches.',
      image_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500',
      rating: 4.5,
      price_range: '$$$',
      cuisine_type: 'Seafood',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}

// In-memory query functions
const inMemoryQueries = {
  async getRestaurants(search, location, cuisine, limit, offset) {
    let filteredRestaurants = [...inMemoryRestaurants];

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRestaurants = filteredRestaurants.filter(r => 
        r.name.toLowerCase().includes(searchLower) || 
        r.location.toLowerCase().includes(searchLower)
      );
    }

    if (location) {
      const locationLower = location.toLowerCase();
      filteredRestaurants = filteredRestaurants.filter(r => 
        r.location.toLowerCase().includes(locationLower)
      );
    }

    if (cuisine) {
      const cuisineLower = cuisine.toLowerCase();
      filteredRestaurants = filteredRestaurants.filter(r => 
        r.cuisine_type.toLowerCase().includes(cuisineLower)
      );
    }

    // Sort by rating descending, then name ascending
    filteredRestaurants.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });

    // Apply pagination
    const total = filteredRestaurants.length;
    const restaurants = filteredRestaurants.slice(offset, offset + limit);

    return { restaurants, total };
  },

  async getRestaurantById(id) {
    return inMemoryRestaurants.find(r => r.id === parseInt(id));
  },

  async getCuisines() {
    const cuisines = [...new Set(inMemoryRestaurants.map(r => r.cuisine_type))].sort();
    return cuisines;
  },

  async getLocations() {
    const locations = [...new Set(inMemoryRestaurants.map(r => r.location))].sort();
    return locations;
  }
};

async function createTables() {
  const connection = await pool.getConnection();
  
  try {
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create restaurants table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        rating DECIMAL(2,1) DEFAULT 4.0,
        price_range VARCHAR(10) DEFAULT '$$',
        cuisine_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create reservations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        restaurant_id INT NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        people_count INT NOT NULL,
        status ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )
    `);

    // Insert sample restaurants if table is empty
    const [restaurants] = await connection.execute('SELECT COUNT(*) as count FROM restaurants');
    if (restaurants[0].count === 0) {
      await insertSampleData(connection);
    }

    console.log('✅ Database tables created successfully');
  } finally {
    connection.release();
  }
}

async function insertSampleData(connection) {
  const sampleRestaurants = [
    {
      name: 'The Golden Spoon',
      location: 'Downtown Manhattan, New York',
      description: 'Elegant fine dining with contemporary American cuisine and exceptional service.',
      image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
      rating: 4.8,
      price_range: '$$$',
      cuisine_type: 'American'
    },
    {
      name: 'Sakura Sushi',
      location: 'Little Tokyo, Los Angeles',
      description: 'Authentic Japanese sushi bar with fresh fish flown in daily from Tokyo.',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
      rating: 4.6,
      price_range: '$$',
      cuisine_type: 'Japanese'
    },
    {
      name: 'Mama Mia Pizzeria',
      location: 'North End, Boston',
      description: 'Traditional Italian pizzeria with wood-fired ovens and homemade pasta.',
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
      rating: 4.4,
      price_range: '$',
      cuisine_type: 'Italian'
    },
    {
      name: 'Le Jardin',
      location: 'French Quarter, New Orleans',
      description: 'Romantic French bistro with garden seating and live jazz music.',
      image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500',
      rating: 4.7,
      price_range: '$$$',
      cuisine_type: 'French'
    },
    {
      name: 'Spice Route',
      location: 'Curry Hill, New York',
      description: 'Authentic Indian cuisine with traditional spices and vegetarian options.',
      image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
      rating: 4.3,
      price_range: '$$',
      cuisine_type: 'Indian'
    },
    {
      name: 'Ocean Breeze',
      location: 'Santa Monica, California',
      description: 'Fresh seafood restaurant with ocean views and sustainable catches.',
      image_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500',
      rating: 4.5,
      price_range: '$$$',
      cuisine_type: 'Seafood'
    }
  ];

  for (const restaurant of sampleRestaurants) {
    await connection.execute(
      'INSERT INTO restaurants (name, location, description, image_url, rating, price_range, cuisine_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [restaurant.name, restaurant.location, restaurant.description, restaurant.image_url, restaurant.rating, restaurant.price_range, restaurant.cuisine_type]
    );
  }

  console.log('✅ Sample restaurant data inserted');
}

module.exports = {
  pool,
  initDatabase,
  isUsingInMemory: () => isUsingInMemory,
  inMemoryQueries
}; 