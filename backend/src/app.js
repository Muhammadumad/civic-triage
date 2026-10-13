const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const authRoutes = require('./routes/auth');
const complaintsRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admin');
const healthRoutes = require('./routes/healthRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

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
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadDir));

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
