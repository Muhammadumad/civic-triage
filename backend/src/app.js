import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import healthRoutes from './routes/healthRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging HTTP requests
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded static files
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadDir));

// Base root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Smart Civic Complaint Triage System API',
    problemStatement: 'SC-01 (Smart Communities & Public Services)',
    status: 'online',
    documentation: '/api',
    healthCheck: '/api/health',
  });
});

// API Info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OpenHack 26 - Smart Civic Complaint Triage Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
      },
      complaints: {
        submit: 'POST /api/complaints',
        mine: 'GET /api/complaints/mine',
        detail: 'GET /api/complaints/:id',
      },
      admin: {
        listQueue: 'GET /api/admin/complaints',
        updateStatus: 'PATCH /api/admin/complaints/:id/status',
        mergeDuplicate: 'POST /api/admin/complaints/:id/merge',
        statistics: 'GET /api/admin/stats',
        rules: 'GET/PUT /api/admin/rules',
      },
    },
  });
});

// Mount Routes
app.use('/api/health', healthRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
