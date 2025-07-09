import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';

import { Database } from './config/database.js';
import { authenticateUser } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import chatRoutes from './routes/chatRoutes.js';
import authTestRoutes from './routes/authTest.js';

// Load environment variables
dotenv.config();

const app = express();

// --- Optional Local Port (ONLY used in dev) ---
const PORT = process.env.PORT || 3000;

// --- CORS ---
const corsOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://notes-16q6.vercel.app',
  'https://noteslo-frontend.vercel.app',
  'http://localhost:5173'
];
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// --- Middleware ---
app.use(helmet());
app.use(clerkMiddleware());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Rate Limiting ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// --- Routes ---
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy - CORS updated for notes-16q6 v1.2',
    timestamp: new Date().toISOString(),
    cors_origins: corsOrigins,
    version: '1.2.0',
    backend_url: 'notes-sand-five-24.vercel.app'
  });
});

app.use('/api/auth', authTestRoutes);
app.use('/api/chats', authenticateUser, chatRoutes);

// --- Error Handlers ---
app.use(notFoundHandler);
app.use(errorHandler);

// --- Auto-connect to DB (for Vercel cold starts) ---
let isConnecting = false;
let connectionPromise: Promise<void> | null = null;

const ensureDBConnection = async () => {
  if (isConnecting && connectionPromise) {
    // If connection is in progress, wait for it
    await connectionPromise;
    return;
  }
  
  const database = Database.getInstance();
  if (database.isConnected()) {
    // Already connected
    return;
  }
  
  if (!isConnecting) {
    isConnecting = true;
    connectionPromise = (async () => {
      try {
        console.log('🔄 Connecting to database...');
        await database.connect();
        console.log('✅ Connected to database');
      } catch (error) {
        console.error('❌ Failed to connect to DB:', error);
        throw error;
      } finally {
        isConnecting = false;
        connectionPromise = null;
      }
    })();
  }
  
  await connectionPromise;
};

// Initialize DB connection immediately when module loads
const initPromise = ensureDBConnection();

// Middleware to ensure DB connection before each request
app.use(async (req, res, next) => {
  try {
    await ensureDBConnection();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed'
    });
  }
});

// --- Export app for Vercel ---
export default app;
