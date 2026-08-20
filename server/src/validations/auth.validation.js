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

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').trim().optional(),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, underscores, dots, and hyphens')
      .trim()
      .optional()
      .nullable(),
    phone: z.string().min(6, 'Valid phone number is required').trim().optional(),
    address: z.string().optional().nullable(),
    avatar: z.string().optional().nullable(),
  }),
});

/**
 * @typedef {z.infer<typeof loginSchema>['body']} LoginInput
 * @typedef {z.infer<typeof registerSchema>['body']} RegisterInput
 * @typedef {z.infer<typeof changePasswordSchema>['body']} ChangePasswordInput
 * @typedef {z.infer<typeof updateProfileSchema>['body']} UpdateProfileInput
 */

export default { loginSchema, registerSchema, changePasswordSchema, updateProfileSchema };
