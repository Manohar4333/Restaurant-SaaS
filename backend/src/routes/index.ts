import { Router } from 'express';
import authRoutes from './auth.routes';
import platformRoutes from './platform.routes';
import adminRoutes from './admin.routes';
import publicRoutes from './public.routes';
import orderRoutes from './order.routes';

const router = Router();

// Versioned /api/v1 routes
router.use('/auth', authRoutes);
router.use('/platform', platformRoutes);
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);
router.use('/orders', orderRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'restaurant-saas-backend',
    version: '1.0.0',
  });
});

export default router;
