# Restaurant Reservation System

A complete restaurant reservation system consisting of a **React Native mobile app** (frontend) and a **Node.js Express API** (backend) with MySQL/MariaDB database.

## 🏗️ System Architecture

### Frontend (RestaurantApp)
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation 6 (Stack + Bottom Tabs)
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Storage**: AsyncStorage for local persistence
- **UI**: Custom components with responsive design

### Backend (RestaurantBackend)
- **Framework**: Node.js with Express.js
- **Language**: JavaScript with TypeScript types
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MySQL/MariaDB with connection pooling
- **Security**: bcryptjs for password hashing, CORS enabled
- **Validation**: express-validator for input validation

### Database Schema
```sql
Users: id, name, email, password, created_at, updated_at
Restaurants: id, name, location, description, image_url, rating, price_range, cuisine_type
Reservations: id, user_id, restaurant_id, date, time, people_count, status, special_requests
```

## 🚀 Features Analysis

### Core Functionality
1. **User Authentication**
   - User registration and login
   - JWT-based session management
   - Automatic token refresh
   - Secure password storage with bcrypt

2. **Restaurant Discovery**
   - Browse restaurants with pagination
   - Search by name or location
   - Filter by cuisine type and location
   - Restaurant ratings and details

3. **Reservation Management**
   - Create new reservations
   - View reservation history
   - Edit confirmed reservations
   - Cancel reservations
   - Special requests support

4. **User Profile**
   - View personal information
   - Reservation history
   - Account management

### Technical Highlights
- **Cross-platform**: React Native runs on iOS, Android, and Web
- **Real-time updates**: Automatic data synchronization
- **Offline capability**: Local storage for user sessions
- **Security**: JWT tokens, password hashing, input validation
- **Scalable architecture**: Modular structure, separation of concerns

## 📋 Prerequisites

### System Requirements
- **Node.js** v16 or higher
- **npm** or **yarn**
- **MySQL** or **MariaDB** server
- **Expo CLI**: `npm install -g expo-cli`

### Development Tools (Optional)
- **iOS Simulator** (Mac users) or **Android Studio**
- **Expo Go** app on mobile device
- **MySQL Workbench** or similar database client

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Database Setup

1. **Install MySQL/MariaDB** on your system
2. **Start the database server**
3. **Create a database user** (optional, can use root)

The application will automatically create the database and tables when the backend starts.

### 3. Backend Setup

```bash
# Navigate to backend directory
cd RestaurantBackend

# Install dependencies
npm install

# Configure environment
cp config.env .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=restaurant_app
# DB_USER=your_database_user
# DB_PASSWORD=your_database_password
# JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd RestaurantApp

# Install dependencies
npm install

# Update API configuration
# Edit src/services/api.ts and replace YOUR_IP_ADDRESS with your computer's IP
```

## 🚀 Running the Application

### Method 1: Development Mode (Recommended)

#### Terminal 1 - Start Backend
```bash
cd RestaurantBackend
npm run dev
```
The backend will start on `http://localhost:3000`

#### Terminal 2 - Start Frontend
```bash
cd RestaurantApp
npm start
```

### Method 2: Production Mode

#### Start Backend
```bash
cd RestaurantBackend
npm start
```

#### Start Frontend
```bash
cd RestaurantApp
npm run ios    # for iOS simulator
npm run android # for Android emulator
npm run web     # for web browser
```

## 📱 Running on Different Platforms

### iOS Simulator (Mac only)
```bash
cd RestaurantApp
npm run ios
```

### Android Emulator
```bash
cd RestaurantApp
npm run android
```

### Physical Device
1. Install **Expo Go** from App Store/Play Store
2. Ensure device is on the same WiFi network
3. Run `npm start` in RestaurantApp directory
4. Scan the QR code with Expo Go

### Web Browser
```bash
cd RestaurantApp
npm run web
```

## 🔧 Configuration

### Backend Configuration (.env)
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
DB_HOST=localhost
DB_PORT=3306
DB_NAME=restaurant_app
DB_USER=your_db_user
DB_PASSWORD=your_db_password
NODE_ENV=development
```

### Frontend Configuration
Update `RestaurantApp/src/services/api.ts`:
```typescript
// Replace YOUR_IP_ADDRESS with your computer's IP address
const BASE_URL = 'http://YOUR_IP_ADDRESS:3000/api';
```

**Find your IP address:**
- **Windows**: `ipconfig` in Command Prompt
- **Mac/Linux**: `ifconfig` in Terminal
- Look for your local network IP (192.168.x.x or 10.x.x.x)

## 🧪 Testing the Application

### 1. Test Backend API
```bash
# Health check
curl http://localhost:3000/api/health

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 2. Test Frontend
1. Start the Expo dev server
2. Open the app on your preferred platform
3. Test user registration and login
4. Browse restaurants and create reservations

## 📂 Project Structure

```
restaurant-app/
├── RestaurantApp/                 # Frontend (React Native)
│   ├── App.tsx                   # Main app component
│   ├── src/
│   │   ├── screens/              # App screens
│   │   ├── context/              # React Context providers
│   │   ├── services/             # API services
│   │   ├── types/                # TypeScript definitions
│   │   ├── utils/                # Utility functions
│   │   └── components/           # Reusable components
│   └── package.json
├── RestaurantBackend/            # Backend (Node.js)
│   ├── server.js                 # Main server file
│   ├── routes/                   # API routes
│   │   ├── auth.js              # Authentication routes
│   │   ├── restaurants.js       # Restaurant routes
│   │   └── reservations.js      # Reservation routes
│   ├── middleware/               # Custom middleware
│   ├── config/                   # Database configuration
│   └── package.json
└── README.md                     # This file
```

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Restaurants
- `GET /api/restaurants` - Get restaurants (with search/filter)
- `GET /api/restaurants/:id` - Get restaurant details
- `GET /api/restaurants/meta/cuisines` - Get cuisine types
- `GET /api/restaurants/meta/locations` - Get locations

### Reservations (Authenticated)
- `POST /api/reservations` - Create reservation
- `GET /api/user/reservations` - Get user reservations
- `GET /api/reservations/:id` - Get specific reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Cancel reservation

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if MySQL/MariaDB is running
   - Verify database credentials in .env
   - Ensure port 3000 is available

2. **Frontend can't connect to backend**
   - Update IP address in `src/services/api.ts`
   - Check if backend is running on port 3000
   - Ensure devices are on same network

3. **Database connection errors**
   - Verify database server is running
   - Check database user permissions
   - Confirm database name exists (or let app create it)

4. **Expo CLI issues**
   - Clear cache: `expo r -c`
   - Update Expo CLI: `npm install -g expo-cli@latest`
   - Restart development server

### Development Tips

- Use `npm run dev` for backend to enable hot reload
- Check browser console for frontend errors
- Monitor backend logs for API request details
- Use network tab in dev tools to debug API calls

## 🚀 Production Deployment

### Backend Deployment
1. Set up production database
2. Configure environment variables
3. Use PM2 or similar for process management
4. Set up reverse proxy (nginx)
5. Enable HTTPS

### Frontend Deployment
1. Update API base URL for production
2. Build with Expo/EAS Build
3. Deploy to App Store/Play Store
4. Or deploy web version to hosting service

## 📄 License

This project is a demonstration of a restaurant reservation system.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request

---

**Quick Start Summary:**
1. Install MySQL/MariaDB and Node.js
2. Run `cd RestaurantBackend && npm install && npm run dev`
3. Run `cd RestaurantApp && npm install && npm start`
4. Update frontend API URL with your IP address
5. Open Expo app and scan QR code or use simulator 