import mongoose from 'mongoose';

/**
 * Connect to MongoDB with robust connection management and logging
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civic_complaints_db', {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // If running in development without MongoDB immediately available, log a clear warning rather than crashing ungracefully
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('[MongoDB] Running in offline/fallback mode. Ensure MongoDB is running locally or specify a valid MONGO_URI in .env');
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from database');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconnected to database');
});

export default connectDB;
