const express = require('express');

const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const attendanceRoutes = require('./routes/attendance');
const coordinatorRoutes = require('./routes/coordinators');
const permissionRoutes = require('./routes/permissions');

// Import middleware
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --------------- Global Middleware ---------------

app.use(logger);

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// --------------- Routes ---------------

// Health check
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

// --------------- Error Handlers ---------------

app.use(notFound);

app.use(errorHandler);
console.log('🔥 PERMISSION ROUTE IS MOUNTED');
module.exports = app;
