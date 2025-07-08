import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/express';
import { verifyToken } from '@clerk/backend';
import { ApiResponse } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header');
      res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      } as ApiResponse<null>);
      return;
    }

    // Extract the token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('Token received:', token ? 'Token exists' : 'No token');
    
    // Verify the token with Clerk
    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!
      });
      
      if (!payload.sub) {
        console.log('No user ID in token payload');
        res.status(401).json({
          success: false,
          error: 'Invalid token'
        } as ApiResponse<null>);
        return;
      }

      const userId = payload.sub;
      console.log('User ID from token:', userId);

      // Get user information from Clerk
      const user = await clerkClient.users.getUser(userId);
      
      if (!user) {
        console.log('User not found in Clerk');
        res.status(401).json({
          success: false,
          error: 'User not found'
        } as ApiResponse<null>);
        return;
      }

      // Attach user information to the request
      req.userId = user.id;
      req.user = user;
      
      console.log('Authentication successful for user:', user.id);
      next();
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      console.log('CLERK_PUBLISHABLE_KEY:', process.env.CLERK_PUBLISHABLE_KEY);
      console.log('CLERK_SECRET_KEY exists:', !!process.env.CLERK_SECRET_KEY);
      console.log('CLERK_SECRET_KEY prefix:', process.env.CLERK_SECRET_KEY?.substring(0, 10));
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      } as ApiResponse<null>);
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    } as ApiResponse<null>);
  }
};
