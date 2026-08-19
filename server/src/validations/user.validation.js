import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required').trim(),
    email: z.string().email('Valid email is required').toLowerCase().trim(),
    phone: z.string().min(6, 'Valid phone number is required').trim(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['Owner', 'Admin', 'Manager', 'Employee', 'Agent', 'Staff']).default('Employee'),
    department: z.string().optional().default(''),
    designation: z.string().optional().default(''),
    assets: z.array(z.string()).optional().default([]),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(6).optional(),
    role: z.enum(['Owner', 'Admin', 'Manager', 'Employee', 'Agent', 'Staff']).optional(),
    department: z.string().optional(),
    designation: z.string().optional(),
    assets: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    role: z.enum(['Owner', 'Admin', 'Manager', 'Employee', 'Agent', 'Staff', 'all']).optional(),
    department: z.string().optional(),
  }),
});

export default { createUserSchema, updateUserSchema, listUsersSchema };
