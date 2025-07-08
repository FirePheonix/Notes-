import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '../types/index.js';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    } as ApiResponse<null>);
    return;
  }

  // MongoDB errors
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    if ((error as any).code === 11000) {
      res.status(409).json({
        success: false,
        error: 'Resource already exists'
      } as ApiResponse<null>);
      return;
    }
  }

  // Cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: 'Invalid ID format'
    } as ApiResponse<null>);
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  } as ApiResponse<null>);
};

export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  } as ApiResponse<null>);
};
