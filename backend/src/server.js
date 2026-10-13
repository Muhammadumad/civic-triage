import dotenv from 'dotenv';
// Load environment variables before anything else
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Initialize Database and start Express Server
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('====================================================');
    console.log(` Civic Complaint Triage Backend running on port ${PORT}`);
    console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health URL  : http://localhost:${PORT}/api/health`);
    console.log(` Base API    : http://localhost:${PORT}/api`);
    console.log('====================================================');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] ${err.name}: ${err.message}`);
    // Keep server running in development mode
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error(`[Uncaught Exception] ${err.name}: ${err.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

  // Graceful shutdown
  const gracefulShutdown = () => {
    console.log('\n[Server] Graceful shutdown initiated...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
};

startServer();
