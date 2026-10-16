require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[Civic Triage API] Server running on http://localhost:${PORT}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] ${err.name}: ${err.message}`);
  });

  process.on('uncaughtException', (err) => {
    console.error(`[Uncaught Exception] ${err.name}: ${err.message}`);
    if (process.env.NODE_ENV === 'production') process.exit(1);
  });

  const shutdown = () => {
    console.log('\n[Server] Gracefully shutting down...');
    server.close(() => {
      console.log('[Server] Closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};


startServer();

