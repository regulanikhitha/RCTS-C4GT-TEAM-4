const dns = require('dns');
const mongoose = require('mongoose');

// Ensure reliable DNS resolution for MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

let memoryServer = null;

/**
 * Connect to MongoDB using Mongoose.
 * Reads MONGO_URI from environment variables.
 * Falls back to an embedded in-memory MongoDB instance if local MongoDB is not running.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/c4gt-hub-attendance';
  const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isLocal ? 2500 : 10000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    if (isLocal && process.env.NODE_ENV !== 'production') {
      console.warn(`⚠️ Local MongoDB not found on ${uri} (${error.message}).`);
      console.log('🔄 Starting embedded in-memory MongoDB server for development...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`✅ Embedded MongoDB connected: ${conn.connection.host}`);
      } catch (memErr) {
        console.error(`❌ Embedded MongoDB startup failed: ${memErr.message}`);
        process.exit(1);
      }
    } else {
      console.error(`❌ MongoDB connection error: ${error.message}`);
      process.exit(1);
    }
  }

  // Auto-seed if database is empty
  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Auto-seeding initial data...');
      const { seedDatabase } = require('../seed');
      await seedDatabase(false);
    }
  } catch (seedErr) {
    console.warn(`⚠️ Auto-seeding check encountered an issue: ${seedErr.message}`);
  }
};

module.exports = connectDB;
