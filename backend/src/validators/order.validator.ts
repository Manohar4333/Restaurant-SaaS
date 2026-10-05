import { z } from 'zod';
import { OrderStatus, OrderPaymentMethod } from '../constants';

export const createOrderSchema = z.object({
  body: z.object({
    restaurantSlug: z.string().min(1, 'Restaurant identifier is required'),
    tableToken: z.string().min(1, 'Table token is required'),
    customer: z.object({
      name: z.string().min(1, 'Customer name is required'),
      phone: z.string().min(6, 'Valid phone number is required'),
      email: z.string().email().optional(),
    }),
    items: z.array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      })
    ).min(1, 'Order must contain at least 1 item'),
    paymentMethod: z.nativeEnum(OrderPaymentMethod).default(OrderPaymentMethod.PAY_AT_RESTAURANT),
    specialInstructions: z.string().max(500).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(OrderStatus),
  }),
});
