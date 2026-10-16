const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const complaintsRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admin');
const healthRoutes = require('./routes/healthRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const connectDB = require('./config/db');

const app = express();

// Ensure DB connection for incoming requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Connect Error]:', err.message);
    next();
  }
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static serving for uploaded photos
const localUploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
const tmpUploadDir = path.join(require('os').tmpdir(), 'uploads');

app.use('/uploads', express.static(localUploadDir));
app.use('/uploads', express.static(tmpUploadDir));

app.use('/uploads', (req, res) => {
  const localFallback = path.join(localUploadDir, 'sample_pothole_1.jpg');
  if (fs.existsSync(localFallback)) {
    return res.sendFile(localFallback);
  }
  res.status(404).json({ error: 'Photo not found' });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Smart Civic Complaint Triage System API',
    problemStatement: 'SC-01 (Smart Communities & Public Services)',
    status: 'online',
    healthCheck: '/api/health',
  });
});

// Mount Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
