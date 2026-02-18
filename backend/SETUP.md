# Backend Setup Guide

## Prerequisites

1. **PostgreSQL** installed and running (default port: 5433 as per your setup)
2. **PostGIS extension** enabled (for GIS functionality)

## Step 1: Create Database

Connect to PostgreSQL and create the database:

```sql
-- Connect to PostgreSQL
psql -U postgres -p 5433

-- Create database
CREATE DATABASE smart_water_management;

-- Connect to the new database
\c smart_water_management

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
```

## Step 2: Configure Environment

1. Copy the environment example file:
   ```bash
   cp env.example.txt .env
   ```

2. Edit `.env` with your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5433
   DB_NAME=smart_water_management
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   ```

## Step 3: Initialize Database

Run the database initialization script to create all tables:

```bash
npm run db:init
```

This will:
- Test database connection
- Create all tables based on Sequelize models
- Set up all relationships and indexes

## Step 4: Seed Initial Data (Optional)

Seed the database with default admin user and sample data:

```bash
npm run db:seed
```

This creates:
- Default admin user (username: `admin`, password: `admin123`)
- Sample DMA (District Metered Area)

## Step 5: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## Quick Setup (All Steps)

```bash
# 1. Install dependencies (already done)
npm install

# 2. Create .env file and configure it
cp env.example.txt .env
# Edit .env with your settings

# 3. Initialize and seed database
npm run db:setup

# 4. Start server
npm run dev
```

## Verify Setup

1. Check server health:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. Expected response:
   ```json
   {
     "status": "OK",
     "message": "Smart Water Management System API",
     "timestamp": "2024-01-30T..."
   }
   ```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists
- Verify PostGIS extension is installed

### Port Already in Use
- Change `PORT` in `.env` file
- Or stop the process using port 5000

### Models Not Syncing
- Check database connection
- Verify all models are properly defined
- Check for syntax errors in model files

## Default Admin Credentials

After seeding:
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@solapur.gov.in`

⚠️ **Important**: Change the default admin password after first login!
