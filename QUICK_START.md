# Quick Start Guide

## ✅ What's Done

1. ✅ Project structure created (Backend, Web Frontend, Mobile App)
2. ✅ Dependencies installed for backend and web-frontend
3. ✅ Database models and associations defined
4. ✅ Authentication structure (JWT + role-based access)
5. ✅ API route structure
6. ✅ Database initialization scripts created

## 🚀 Next Steps

### Step 1: Set Up Backend Environment

1. **Create `.env` file in `backend/` directory:**
   ```bash
   cd backend
   copy env.example.txt .env
   ```

2. **Edit `.env` with your PostgreSQL credentials:**
   ```
   DB_HOST=localhost
   DB_PORT=5433
   DB_NAME=smart_water_management
   DB_USER=postgres
   DB_PASSWORD=your_actual_password
   JWT_SECRET=your_random_secret_key_here
   ```

### Step 2: Create PostgreSQL Database

Open PostgreSQL (pgAdmin or psql) and run:

```sql
CREATE DATABASE smart_water_management;

\c smart_water_management

CREATE EXTENSION IF NOT EXISTS postgis;
```

### Step 3: Initialize Database Tables

```bash
cd backend
npm run db:init
```

This creates all tables based on your models.

### Step 4: Seed Initial Data (Optional)

```bash
npm run db:seed
```

Creates default admin user:
- Username: `admin`
- Password: `admin123`
- Email: `admin@solapur.gov.in`

### Step 5: Start Backend Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

Test it:
```bash
curl http://localhost:5000/api/health
```

### Step 6: Start Web Frontend (Optional)

In a new terminal:

```bash
cd web-frontend
npm run dev
```

Web app will run on `http://localhost:3000`

## 📋 Available Scripts

### Backend
- `npm run dev` - Start development server
- `npm run db:init` - Initialize database tables
- `npm run db:seed` - Seed initial data
- `npm run db:setup` - Initialize + seed (one command)

### Web Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production

## 🔍 Verify Everything Works

1. **Backend Health Check:**
   - Visit: `http://localhost:5000/api/health`
   - Should return: `{"status":"OK",...}`

2. **Database Connection:**
   - Check backend console for: `✅ PostgreSQL database connected successfully`

3. **Web Frontend:**
   - Visit: `http://localhost:3000`
   - Should show login page (placeholder)

## 📁 Project Structure

```
smart-water-management/
├── backend/              # Node.js + Express API
│   ├── config/          # Database & auth config
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── scripts/         # DB init & seed scripts
│   └── server.js        # Main server file
├── web-frontend/        # React.js Control Room
│   └── src/            # React components
└── mobile-app/          # React Native App
    └── src/            # Mobile screens
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `.env` file has correct credentials
- Ensure database exists
- Verify PostGIS extension is installed

### Port Already in Use
- Change `PORT` in `.env` (backend)
- Or change port in `vite.config.js` (frontend)

### Module Not Found Errors
- Run `npm install` in the respective directory
- Check `node_modules` exists

## 📚 Documentation

- **Backend Setup**: See `backend/SETUP.md`
- **Main README**: See `README.md`
- **Project Overview**: See root `README.md`

---

**Ready to build features!** 🎉
