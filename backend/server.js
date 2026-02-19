const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const db = require('./config/database');
// Load models to ensure they're initialized
require('./models');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const engineerRoutes = require('./routes/engineer');
const citizenRoutes = require('./routes/citizen');
const sensorRoutes = require('./routes/sensors');
const dmaRoutes = require('./routes/dma');
const alertRoutes = require('./routes/alerts');
const taskRoutes = require('./routes/tasks');
const complaintRoutes = require('./routes/complaints');
const billingRoutes = require('./routes/billing');
const engineerManagementRoutes = require('./routes/engineers');
const tankRoutes = require('./routes/tanks');
const sourceRoutes = require('./routes/sources');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
// db.authenticate()
//   .then(() => {
//     console.log('✅ PostgreSQL database connected successfully');
//   })
//   .catch(err => {
//     console.error('❌ Unable to connect to database:', err);
//   });
// Database Connection + Auto Sync
// db.authenticate()
//   .then(() => {
//     console.log('✅ PostgreSQL database connected successfully');
//     return db.sync({ alter: true });  // 🔥 This creates tables
//   })
//   .then(() => {
//     console.log('✅ Database synced successfully (tables created)');
//   })
//   .catch(err => {
//     console.error('❌ Unable to connect or sync database:', err);
//   });
db.authenticate()
  .then(async () => {
    console.log('✅ PostgreSQL database connected successfully');
    await db.sync({ force: true });
    console.log('✅ Database synced successfully');
  })
  .catch(err => {
    console.error('❌ Unable to connect or sync database:', err);
  });



// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join room based on user role (if authenticated)
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} joined room: ${room}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Initialize alert service
const AlertService = require('./services/alertService');
const alertService = new AlertService(io);
app.set('alertService', alertService);

// Initialize sensor simulator
const SensorSimulator = require('./services/sensorSimulator');
const sensorSimulator = new SensorSimulator(io, alertService);
app.set('sensorSimulator', sensorSimulator);

// Start sensor simulation (runs every 5 minutes)
if (process.env.ENABLE_SENSOR_SIMULATION !== 'false') {
  sensorSimulator.start(5); // 5 minute intervals
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Smart Water Management System API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/engineer', engineerRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/dma', dmaRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/engineers', engineerManagementRoutes);
app.use('/api/tanks', tankRoutes);
app.use('/api/sources', sourceRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
