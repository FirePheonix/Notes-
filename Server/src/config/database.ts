import mongoose from 'mongoose';

export class Database {
  private static instance: Database;
  
  private constructor() {}
  
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
  
  public async connect(): Promise<void> {
    try {
      // Skip if already connected
      if (mongoose.connection.readyState === 1) {
        console.log('Already connected to MongoDB');
        return;
      }

      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drawing-app';
      
      // Optimized connection options for serverless/Vercel
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        connectTimeoutMS: 10000, // Give up initial connection after 10s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        maxPoolSize: 10, // Maintain up to 10 socket connections
        minPoolSize: 0, // Maintain minimum connections (serverless friendly)
        maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
        bufferCommands: false // Disable mongoose buffering
      });
      
      console.log('Connected to MongoDB successfully');
      
      // Set up connection event listeners
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
      });

    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }
  
  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }
  
  public isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}
