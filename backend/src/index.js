import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import fortuneRoutes from './routes/fortuneRoutes.js';
import draftRoutes from './routes/draftRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import sseRoutes from './routes/sseRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import securityHeaders from './middlewares/securityHeaders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

function buildCorsWhitelist() {
  const devOrigins = process.env.NODE_ENV === 'production'
    ? []
    : [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:4173',
        'http://127.0.0.1:4173',
      ];

  return new Set(
    [
      ...devOrigins,
      ...(process.env.CORS_ALLOWED_ORIGINS || '').split(','),
      process.env.FRONTEND_ORIGIN || '',
    ]
      .map((o) => o.trim())
      .filter(Boolean),
  );
}

const corsWhitelist = buildCorsWhitelist();
function getRequestHost(req) {
  return req.headers['x-forwarded-host'] || req.headers.host || '';
}

function isAllowedCorsOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) {
    return true;
  }

  const host = getRequestHost(req);
  if (origin === `http://${host}` || origin === `https://${host}`) {
    return true;
  }

  return corsWhitelist.has(origin);
}

const corsMiddleware = cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// ─── Middleware ───
app.use(securityHeaders);
app.use((req, res, next) => {
  if (!isAllowedCorsOrigin(req)) {
    return res.status(403).json({
      error: 'CORS origin not allowed',
      errorCode: 'CORS_ORIGIN_FORBIDDEN',
    });
  }
  return corsMiddleware(req, res, next);
});
app.use(express.json({ limit: '15mb' }));

// ─── Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/fortune', fortuneRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/stream', sseRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error handler (must be last) ───
app.use(errorHandler);

// ─── Start ───
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
