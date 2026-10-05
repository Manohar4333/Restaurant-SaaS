import { z } from 'zod';
import { ProductAvailability } from '../constants';

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, 'Category is required'),
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be greater than or equal to 0'),
    image: z.string().optional(),
    stock: z.number().optional(),
    availability: z.nativeEnum(ProductAvailability).default(ProductAvailability.AVAILABLE),
    isPopular: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    categoryId: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    image: z.string().optional(),
    stock: z.number().optional(),
    availability: z.nativeEnum(ProductAvailability).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    isPopular: z.boolean().optional(),
  }),
});
