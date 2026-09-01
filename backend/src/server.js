const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');

// Load environment variables from the backend folder regardless of launch directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = Number(process.env.PORT || 5000);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    if (error && error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Stop the other server or change PORT in backend/.env.`);
    } else {
      console.error(`❌ Server startup failed: ${error.message}`);
    }
    process.exit(1);
  }
};

startServer();

module.exports = app;
