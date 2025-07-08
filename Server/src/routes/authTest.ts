import { Router } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Test authentication endpoint
router.get('/test', authenticateUser, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    userId: req.userId,
    user: {
      id: req.user?.id,
      email: req.user?.emailAddresses?.[0]?.emailAddress,
      firstName: req.user?.firstName,
      lastName: req.user?.lastName
    }
  });
});

export default router;
