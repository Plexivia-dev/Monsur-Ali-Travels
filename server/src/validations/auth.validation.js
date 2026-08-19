import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required').toLowerCase().trim(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').trim(),
    email: z.string().email('Valid email is required').toLowerCase().trim(),
    phone: z.string().min(6, 'Valid phone number is required').trim(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['Owner', 'Admin', 'Manager', 'Employee', 'Agent', 'Staff']).default('Employee'),
    department: z.string().optional().default(''),
    designation: z.string().optional().default(''),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

/**
 * @typedef {z.infer<typeof loginSchema>['body']} LoginInput
 * @typedef {z.infer<typeof registerSchema>['body']} RegisterInput
 * @typedef {z.infer<typeof changePasswordSchema>['body']} ChangePasswordInput
 */

export default { loginSchema, registerSchema, changePasswordSchema };
