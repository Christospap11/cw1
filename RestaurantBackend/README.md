# Restaurant Reservation Backend API

A Node.js Express backend for a restaurant reservation system with JWT authentication and MySQL/MariaDB database.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Restaurant Management**: Get restaurants with search and filtering capabilities
- **Reservation System**: Create, view, update, and cancel reservations
- **Security**: Password hashing with bcrypt, JWT tokens, input validation
- **Database**: MySQL/MariaDB with connection pooling

## Prerequisites

- Node.js (v14 or higher)
- MySQL or MariaDB server
- npm or yarn package manager

## Installation

1. Clone the repository and navigate to the backend directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (copy from `config.env`):
   ```env
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # MariaDB/MySQL Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=restaurant_app
   DB_USER=root
   DB_PASSWORD=your-database-password
   
   # Development settings
   NODE_ENV=development
   ```

4. Make sure your MySQL/MariaDB server is running

5. Start the development server:
   ```bash
   npm run dev
   ```

The server will automatically create the database and tables if they don't exist.

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Restaurants

#### GET `/api/restaurants`
Get all restaurants with search and filtering
- Query parameters:
  - `search`: Search by name or location
  - `location`: Filter by location
  - `cuisine`: Filter by cuisine type
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)

#### GET `/api/restaurants/:id`
Get single restaurant by ID

#### GET `/api/restaurants/meta/cuisines`
Get all available cuisine types

#### GET `/api/restaurants/meta/locations`
Get all available locations

### Reservations (Requires Authentication)

#### POST `/api/reservations`
Create a new reservation
```json
{
  "restaurant_id": 1,
  "date": "2024-12-31",
  "time": "19:30",
  "people_count": 4,
  "special_requests": "Window seat please"
}
```

#### GET `/api/user/reservations`
Get user's reservations
- Query parameters:
  - `status`: Filter by status (confirmed, cancelled, completed)
  - `page`: Page number
  - `limit`: Items per page

#### GET `/api/reservations/:id`
Get specific reservation

#### PUT `/api/reservations/:id`
Update reservation
```json
{
  "date": "2024-12-31",
  "time": "20:00",
  "people_count": 6,
  "special_requests": "Celebration dinner"
}
```

#### DELETE `/api/reservations/:id`
Cancel reservation

## Authentication

All reservation endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer your-jwt-token
```

## Database Schema

### Users Table
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(255), NOT NULL)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password` (VARCHAR(255), NOT NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Restaurants Table
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(255), NOT NULL)
- `location` (VARCHAR(255), NOT NULL)
- `description` (TEXT)
- `image_url` (VARCHAR(500))
- `rating` (DECIMAL(2,1))
- `price_range` (VARCHAR(10))
- `cuisine_type` (VARCHAR(100))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Reservations Table
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `user_id` (INT, FOREIGN KEY)
- `restaurant_id` (INT, FOREIGN KEY)
- `date` (DATE, NOT NULL)
- `time` (TIME, NOT NULL)
- `people_count` (INT, NOT NULL)
- `status` (ENUM: 'confirmed', 'cancelled', 'completed')
- `special_requests` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Development

- `npm run dev`: Start development server with nodemon
- `npm start`: Start production server

## Environment Variables

- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: JWT token expiration time
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `NODE_ENV`: Environment (development/production)

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT token authentication
- Input validation with express-validator
- SQL injection prevention with parameterized queries
- CORS enabled for cross-origin requests 