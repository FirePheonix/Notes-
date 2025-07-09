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
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet());

// Define CORS options
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://notes-16q6.vercel.app',
    'https://noteslo-frontend.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// 👇 Preflight OPTIONS support
app.options('*', cors(corsOptions));

// Apply CORS middleware
app.use(cors(corsOptions));

// Clerk authentication
app.use(clerkMiddleware());

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy - CORS configured correctly.',
    timestamp: new Date().toISOString(),
    version: '1.1.0'
  });
});

// API routes
app.use('/api/auth', authTestRoutes);
app.use('/api/chats', authenticateUser, chatRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    const db = Database.getInstance();
    await db.connect();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 CORS origins: ${corsOptions.origin.join(', ')}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔻 Shutting down...');
  const db = Database.getInstance();
  await db.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔻 Shutting down...');
  const db = Database.getInstance();
  await db.disconnect();
  process.exit(0);
});

startServer();

export default app;
