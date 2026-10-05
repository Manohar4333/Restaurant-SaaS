import { z } from 'zod';
import { TableStatus } from '../constants';

export const createTableSchema = z.object({
  body: z.object({
    tableNumber: z.string().min(1, 'Table number is required'),
    capacity: z.number().min(1, 'Capacity must be at least 1').default(4),
  }),
});

export const updateTableSchema = z.object({
  body: z.object({
    tableNumber: z.string().optional(),
    capacity: z.number().min(1).optional(),
    status: z.nativeEnum(TableStatus).optional(),
  }),
});
