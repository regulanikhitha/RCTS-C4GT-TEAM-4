const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Middleware ---------------

// Enable CORS for all origins (frontend will be on a different port)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// --------------- Routes ---------------

// Health-check endpoint — useful for testing if the server is alive
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'C4GT Hub Attendance API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount member routes at /api/members
// (Devi & Lithika Sraya will implement the route handlers)
try {
  const memberRoutes = require('./routes/members');
  app.use('/api/members', memberRoutes);
  console.log('📌 Member routes mounted at /api/members');
} catch (err) {
  console.warn('⚠️  Member routes not yet implemented — skipping mount');
}

// --------------- Error-handling middleware ---------------
// (Sai Teja will implement these; safe-load so server doesn't crash)

try {
  const notFound = require('./middleware/notFound');
  app.use(notFound);
} catch (err) {
  // Fallback 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: `Not Found — ${req.originalUrl}` });
  });
}

try {
  const errorHandler = require('./middleware/errorHandler');
  app.use(errorHandler);
} catch (err) {
  // Fallback error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
      message: err.message || 'Internal Server Error',
    });
  });
}

// --------------- Start server ---------------

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();

module.exports = app;
