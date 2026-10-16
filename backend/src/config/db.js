const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with robust connection management, serverless caching, and logging
 */
const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 15000,
      bufferCommands: false,
    };

    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civic_complaints_db';

    cached.promise = mongoose.connect(mongoUri, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] Connected successfully: ${mongooseInstance.connection.host}/${mongooseInstance.connection.name}`);
      return mongooseInstance;
    }).catch((error) => {
      cached.promise = null;
      console.error(`[MongoDB] Connection error: ${error.message}`);
      if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
        process.exit(1);
      }
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from database');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconnected to database');
});

module.exports = connectDB;
