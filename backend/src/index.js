import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import postRoutes from './routes/postRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───
app.use(cors());
app.use(express.json());

// ─── Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/posts', postRoutes);

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
