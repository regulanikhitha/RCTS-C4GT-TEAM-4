const express = require('express');

const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const attendanceRoutes = require('./routes/attendance');
const coordinatorRoutes = require('./routes/coordinators');
const permissionRoutes = require('./routes/permissions');
const notificationRoutes = require('./routes/notifications');

// Import middleware
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --------------- Global Middleware ---------------

app.use(logger);

// CORS Configuration
const allowedOrigins = process.env.CLIENT_URL || process.env.FRONTEND_URL || process.env.CORS_ORIGIN;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, curl, server-to-server, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins) {
      const originsList = allowedOrigins
        .split(',')
        .map((o) => o.trim().replace(/\/+$/, ''));
      if (originsList.includes('*') || originsList.includes(origin.replace(/\/+$/, ''))) {
        return callback(null, true);
      }
    }
    // Reflect origin to allow all web clients dynamically
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// --------------- Routes ---------------

// Root & Health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'C4GT Hub Attendance API is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'C4GT Hub Attendance API is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'C4GT Hub Attendance API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount modules
app.use('/api/auth', authRoutes);

app.use('/api/members', memberRoutes);

app.use('/api/attendance', attendanceRoutes);

app.use('/api/coordinators', coordinatorRoutes);

// Permission routes
app.use('/api/permissions', permissionRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// --------------- Error Handlers ---------------

app.use(notFound);

app.use(errorHandler);
console.log('🔥 PERMISSION ROUTE IS MOUNTED');
module.exports = app;
