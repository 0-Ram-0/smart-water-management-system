# Backend API - Smart Water Management System

Express.js backend server for the Smart Water Management System.

## Structure

```
backend/
├── config/          # Configuration files (database, auth)
├── models/          # Sequelize models
├── routes/          # API route handlers
├── middleware/      # Custom middleware (to be added)
├── controllers/     # Business logic (to be added)
├── utils/           # Utility functions (to be added)
├── server.js        # Main server file
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Admin Routes (requires admin role)
- `GET /api/admin/dashboard` - Admin dashboard data

### Engineer Routes (requires engineer role)
- `GET /api/engineer/dashboard` - Engineer dashboard
- `GET /api/engineer/tasks` - Get assigned tasks

### Citizen Routes (requires citizen role)
- `GET /api/citizen/dashboard` - Citizen dashboard

### Sensors
- `GET /api/sensors` - Get all sensors
- `GET /api/sensors/:id` - Get sensor details
- `GET /api/sensors/:id/readings` - Get sensor readings
- `GET /api/sensors/:id/latest` - Get latest reading for a sensor
- `GET /api/sensors/latest-all` - Get latest reading for all sensors (optimized)

### DMA
- `GET /api/dma` - Get all DMAs
- `GET /api/dma/:id` - Get DMA details

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id` - Update alert status

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task

### Complaints
- `GET /api/complaints` - Get complaints
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id` - Update complaint

### Billing
- `GET /api/billing/bills` - Get bills
- `POST /api/billing/pay` - Process payment

### Tanks
- `GET /api/tanks` - Get all tanks with geometry

### Sources
- `GET /api/sources` - Get all sources with geometry

## Database Models

- **User** - Users (admin, engineer, citizen)
- **Sensor** - Water sensors (pressure, flow, level, quality)
- **SensorReading** - Time-series sensor data
- **DMA** - District Metered Areas
- **Alert** - System alerts
- **Task** - Engineer tasks
- **Complaint** - Citizen complaints
- **Bill** - Water bills
- **Payment** - Payment records

## Performance indexes

For fast lookups of the latest sensor readings, create the following composite index in your database:

```sql
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id
  ON sensor_readings(sensor_id, recorded_at DESC);
```

This index is used by the optimized `DISTINCT ON (sensor_id)` queries in:
- `/api/admin/dashboard`
- `/api/sensors/latest-all`

## Running the Server

```bash
npm install
npm run dev  # Development with nodemon
npm start    # Production
```

## Environment Variables

See `.env.example` for required environment variables.
