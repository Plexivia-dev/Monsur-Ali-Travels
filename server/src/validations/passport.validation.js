import { z } from 'zod';

export const createPassportSchema = z.object({
  body: z.object({
    applicantName: z.string().min(2, 'Applicant name is required').trim(),
    applicantPhone: z.string().optional().default(''),
    passportNo: z.string().optional().default(''),
    passportType: z.string().default('E-Passport'),
    applicationCategory: z.string().default('Renewal'),
    submissionDate: z.string().optional(),
    status: z.string().default('Pending'),
    fee: z.coerce.number().min(0).default(0),
    details: z.record(z.any()).optional().default({}),
  }),
});

export const updatePassportSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid passport ID format'),
  }),
  body: createPassportSchema.shape.body.partial(),
});

export const listPassportSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.string().optional(),
    passportType: z.string().optional(),
  }),
});

export default { createPassportSchema, updatePassportSchema, listPassportSchema };
