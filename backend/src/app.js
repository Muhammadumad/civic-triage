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

// Robust CORS middleware - mounted first before all routes and DB connect
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, curl, Postman or same-origin (no origin header)
    if (!origin) return callback(null, true);

    // If wildcard or empty, allow
    if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Explicitly allowed origin
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Localhost dev ports
    if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview and production deployments (*.vercel.app)
    if (/^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// Explicitly handle all preflight OPTIONS requests across all routes
app.options('/*splat', cors(corsOptions));

// Ensure DB connection for incoming requests (skip for OPTIONS preflight)
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Connect Error]:', err.message);
    next();
  }
});

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

// Mount Routes with both /api/* and root aliases for bulletproof routing
app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes);

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// Direct /api/login and /login aliases to auth router
app.post(['/api/login', '/login'], (req, res, next) => {
  req.url = '/login';
  authRoutes(req, res, next);
});

app.use('/api/complaints', complaintsRoutes);
app.use('/complaints', complaintsRoutes);

// Direct aliases for /analyze, /inspect, /mine
app.all(['/api/analyze', '/analyze'], (req, res, next) => {
  req.url = '/analyze';
  complaintsRoutes(req, res, next);
});
app.all(['/api/inspect', '/inspect'], (req, res, next) => {
  req.url = '/inspect';
  complaintsRoutes(req, res, next);
});
app.all(['/api/mine', '/mine'], (req, res, next) => {
  req.url = '/mine';
  complaintsRoutes(req, res, next);
});

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
