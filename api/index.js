// Vercel serverless entrypoint - routes all /api/* and /uploads/* to Express
require('dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });

const app = require('../backend/src/app');

module.exports = app;
