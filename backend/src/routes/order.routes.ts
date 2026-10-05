import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { createOrderSchema } from '../validators/order.validator';

const router = Router();

// Order creation from customer mobile menu
router.post('/', validateRequest(createOrderSchema), OrderController.createOrder);

// Tracking specific order
router.get('/:id', OrderController.getOrderById);

// Customer order history by phone
router.get('/my-orders', OrderController.getCustomerOrders);

// Cancel order before acceptance
router.post('/:id/cancel', OrderController.cancelOrder);

export default router;
