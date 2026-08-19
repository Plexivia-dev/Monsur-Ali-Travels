import { z } from 'zod';

export const createVisaSchema = z.object({
  body: z.object({
    applicantName: z.string().min(2, 'Applicant name is required').trim(),
    passportNo: z.string().min(4, 'Passport number is required').trim(),
    contactNo: z.string().optional().default(''),
    email: z.string().email().optional().or(z.literal('')).default(''),
    visaType: z.string().default('Tourist'),
    status: z.enum(['pending', 'submitted', 'accepted', 'rejected', 'delivered']).default('pending'),
    fee: z.coerce.number().min(0).default(0),
    applicantData: z.record(z.any()).optional().default({}),
    documents: z.array(z.any()).optional().default([]),
  }),
});

export const updateVisaSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid visa ID format'),
  }),
  body: createVisaSchema.shape.body.partial(),
});

export const updateVisaStageSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid visa ID format'),
  }),
  body: z.object({
    status: z.enum(['pending', 'submitted', 'accepted', 'rejected', 'delivered']),
    note: z.string().optional().default(''),
  }),
});

export const listVisaSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.string().optional(),
    visaType: z.string().optional(),
  }),
});

export default { createVisaSchema, updateVisaSchema, updateVisaStageSchema, listVisaSchema };
