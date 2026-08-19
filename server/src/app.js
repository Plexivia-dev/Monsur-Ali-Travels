import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import env from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const app = express();

// Security & Utility Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl) or allowed origins
      if (!origin || env.CORS_ORIGINS.includes('*') || env.CORS_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static Assets Serving for Uploads and Documents
app.use('/uploads', express.static(path.resolve(env.UPLOAD_PATH)));
app.use('/documents', express.static(path.resolve(env.DOCUMENT_PATH)));
app.use('/src/uploads', express.static(path.resolve(env.UPLOAD_PATH)));
app.use('/src/documents', express.static(path.resolve(env.DOCUMENT_PATH)));

// Mount API v1 Routes
app.use('/api/v1', apiRouter);

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    service: 'Monsur Ali Travels ERP Backend API (PostgreSQL + Prisma)',
    version: '2.0.0',
    status: 'running',
    docs: '/api/v1/health',
  });
});

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
