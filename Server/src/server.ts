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

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://notes-16q6.vercel.app', // Your actual frontend URL
    'https://noteslo-frontend.vercel.app', // Alternative frontend URL
    'http://localhost:5173' // Local development
  ],
  credentials: true
}));

// Clerk middleware
app.use(clerkMiddleware());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is healthy - CORS updated for notes-16q6',
    timestamp: new Date().toISOString(),
    cors_origins: [
      'https://notes-16q6.vercel.app',
      'https://noteslo-frontend.vercel.app',
      'http://localhost:5173'
    ],
    version: '1.1.0' // Added to trigger redeployment
  });
});

// API routes with Clerk authentication
app.use('/api/auth', authTestRoutes);
app.use('/api/chats', authenticateUser, chatRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to database
    const database = Database.getInstance();
    await database.connect();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  const database = Database.getInstance();
  await database.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  const database = Database.getInstance();
  await database.disconnect();
  process.exit(0);
});

startServer();

// Export app for Vercel
export default app;