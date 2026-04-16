import './config/env.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import authRoutes from './routes/authRoutes.js';
import smsRoutes from './routes/smsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

dotenv.config();

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ── Railway: serve built React client ──────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const clientDist = join(__dirname, '..', '..', '..', 'client', 'dist');

if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback — let React Router handle all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
  console.log('📦 Serving React client from', clientDist);
}
// ───────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
