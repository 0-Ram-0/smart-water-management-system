# Smart Water Management System
## Solapur Municipal Corporation

A comprehensive full-stack application for managing municipal water supply, monitoring sensors, handling complaints, and managing billing for Solapur Municipal Corporation.

## Project Structure

```
smart-water-management/
├── backend/              # Node.js + Express.js API server
├── web-frontend/         # React.js Control Room Dashboard
├── mobile-app/           # React Native Mobile App (Engineers & Citizens)
└── README.md
```

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (with PostGIS for GIS data)
- **ORM**: Sequelize
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Validation**: express-validator

### Web Frontend
- **Framework**: React.js 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Maps**: Leaflet / React Leaflet
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client

### Mobile App
- **Framework**: React Native 0.72
- **Navigation**: React Navigation
- **Maps**: React Native Maps
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher) with PostGIS extension
- npm or yarn
- For mobile app: React Native development environment setup

### Installation

#### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

Backend will run on `http://localhost:5000`

#### 2. Web Frontend Setup

```bash
cd web-frontend
npm install
cp .env.example .env
npm run dev
```

Web frontend will run on `http://localhost:3000`

#### 3. Mobile App Setup

```bash
cd mobile-app
npm install
# For iOS
cd ios && pod install && cd ..
npm run ios

# For Android
npm run android
```

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE smart_water_management;
```

2. Enable PostGIS extension:
```sql
\c smart_water_management
CREATE EXTENSION IF NOT EXISTS postgis;
```

3. Run migrations (to be implemented):
```bash
cd backend
npm run migrate
```

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5433
DB_NAME=smart_water_management
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

### Web Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Mobile App (.env)
```
API_URL=http://localhost:5000/api
SOCKET_URL=http://localhost:5000
```

## User Roles

1. **Admin** - Full access to control room dashboard
2. **Engineer** - Field task management and complaint resolution
3. **Citizen** - Complaint submission, bill viewing, and payments

## Features (Current Phase)

- ✅ Project structure setup
- ✅ Database models and associations
- ✅ Authentication structure (JWT-based)
- ✅ Role-based access control
- ✅ API route structure
- ⏳ GIS-based pipeline visualization (to be implemented)
- ⏳ DMA-wise water supply scheduling (to be implemented)
- ⏳ Live sensor data simulation (to be implemented)
- ⏳ Alert generation system (to be implemented)
- ⏳ Engineer task assignment (to be implemented)
- ⏳ Citizen complaints system (to be implemented)
- ⏳ Billing and payment system (to be implemented)

## Future Phase (Not Implemented Yet)

- Real RTU / NB-IoT integration
- ML-based leak detection
- Demand forecasting algorithms
- Real DMA optimization

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Web Frontend Development
```bash
cd web-frontend
npm run dev  # Vite dev server with HMR
```

### Mobile App Development
```bash
cd mobile-app
npm start    # Metro bundler
# Then run on device/emulator
npm run android  # or npm run ios
```

## Project Status

**Current Phase**: Initial project setup and structure
- ✅ Backend API structure
- ✅ Database models
- ✅ Authentication framework
- ✅ Web frontend structure
- ✅ Mobile app structure
- ⏳ Feature implementation (next steps)

## License

ISC

## Author

Solapur Municipal Corporation

---

**Note**: This is a development project. Production deployment requires additional security measures, environment configuration, and testing.
