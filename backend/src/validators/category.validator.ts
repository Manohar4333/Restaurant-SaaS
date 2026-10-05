import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required'),
    description: z.string().optional(),
    image: z.string().optional(),
    sortOrder: z.number().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    sortOrder: z.number().optional(),
  }),
});
