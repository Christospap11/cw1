# Restaurant Reservation App - Frontend

A React Native mobile application for restaurant reservations built with Expo, TypeScript, and React Navigation.

## Features

- **User Authentication**: Login and registration with JWT tokens
- **Restaurant Discovery**: Browse restaurants with search and filtering
- **Reservation Management**: Create, view, edit, and cancel reservations
- **Profile Management**: View user profile and reservation history
- **Modern UI**: Clean, responsive design with smooth navigation

## Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio (for emulators)
- Expo Go app on your mobile device (for testing)

## Installation

1. Navigate to the app directory:
   ```bash
   cd RestaurantApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the API base URL in `src/services/api.ts`:
   ```typescript
   // Replace with your computer's IP address
   const BASE_URL = 'http://YOUR_IP_ADDRESS:3000/api';
   ```

   To find your IP address:
   - **Windows**: Run `ipconfig` in Command Prompt
   - **Mac/Linux**: Run `ifconfig` in Terminal
   - Look for your local network IP (usually 192.168.x.x or 10.x.x.x)

## Development

1. Start the Expo development server:
   ```bash
   npm start
   ```

2. Run on different platforms:
   - **iOS Simulator**: Press `i` in the terminal or run `npm run ios`
   - **Android Emulator**: Press `a` in the terminal or run `npm run android`
   - **Physical Device**: Scan the QR code with Expo Go app
   - **Web Browser**: Press `w` in the terminal or run `npm run web`

## Project Structure

```
RestaurantApp/
├── App.tsx                 # Main app component with navigation
├── src/
│   ├── screens/           # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── RestaurantListScreen.tsx
│   │   ├── RestaurantDetailScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── context/           # React Context providers
│   │   └── AuthContext.tsx
│   ├── services/          # API services
│   │   └── api.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── utils/             # Utility functions
├── package.json
└── README.md
```

## App Screens

### Authentication
- **Login Screen**: Email/password authentication
- **Register Screen**: User registration with validation

### Main App (After Login)
- **Restaurant List**: Browse restaurants with search functionality
- **Restaurant Detail**: View restaurant info and make reservations
- **Profile**: User info, reservation history, and logout

## Navigation Structure

```
├── Authentication Flow (Not Authenticated)
│   ├── Login Screen
│   └── Register Screen
└── Main App Flow (Authenticated)
    ├── Tab Navigator
    │   ├── Restaurant List
    │   └── Profile
    └── Modal/Stack Screens
        └── Restaurant Detail
```

## Key Features

### Restaurant Discovery
- Search restaurants by name or location
- View restaurant details, ratings, and cuisine types
- Infinite scroll with pagination
- Pull-to-refresh functionality

### Reservation System
- Create new reservations with date, time, and party size
- View all user reservations with status indicators
- Edit confirmed reservations
- Cancel reservations with confirmation
- Special requests support

### User Experience
- JWT-based authentication with automatic token handling
- Smooth navigation with React Navigation
- Loading states and error handling
- Responsive design for different screen sizes

## API Integration

The app integrates with the backend API for:
- User authentication (login/register)
- Restaurant data retrieval
- Reservation management (CRUD operations)
- Automatic token refresh and error handling

## Development Notes

- Built with TypeScript for type safety
- Uses React Navigation 6 for navigation
- Implements React Context for state management
- Axios for HTTP requests with interceptors
- AsyncStorage for local data persistence

## Troubleshooting

### Common Issues

1. **API Connection Issues**:
   - Ensure the backend server is running on port 3000
   - Update the IP address in `src/services/api.ts`
   - Check network connectivity

2. **Expo CLI Issues**:
   - Clear Expo cache: `expo r -c`
   - Restart the development server
   - Update Expo CLI: `npm install -g expo-cli@latest`

3. **Module Resolution**:
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Testing on Physical Device

1. Install Expo Go from App Store/Play Store
2. Connect to the same WiFi network as your development machine
3. Scan the QR code displayed in terminal/browser
4. Make sure your firewall allows connections on port 19000-19002

## Backend Requirements

This frontend requires the RestaurantBackend API to be running. Make sure to:

1. Start the backend server: `cd RestaurantBackend && npm run dev`
2. Ensure MariaDB/MySQL is running
3. Backend should be accessible on your network IP at port 3000

## Building for Production

For production builds:

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Or use EAS Build (recommended)
npx eas build --platform all
```

## License

This project is part of a restaurant reservation system demo.
