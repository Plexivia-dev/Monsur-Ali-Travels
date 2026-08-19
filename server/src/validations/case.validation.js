import { z } from 'zod';

export const createCaseSchema = z.object({
  body: z.object({
    applicantName: z.string().min(2, 'Applicant name is required').trim(),
    passportNumber: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    nidNumber: z.string().optional().default(''),
    caseType: z.string().min(1, 'Case type is required (e.g. greece, n-macedonia, bsf)'),
    status: z.enum([
      'ENTRY',
      'PROCESSING',
      'APPROVED_OFFER_LETTER',
      'SUBMITTED_EMBASSY_BSF',
      'COMPLETED_DELIVERED',
      'REJECTED',
      'ON_HOLD',
    ]).default('ENTRY'),
    checklist: z.object({
      photo2x2: z.boolean().optional().default(false),
      electricityBill: z.boolean().optional().default(false),
      nidCopy: z.boolean().optional().default(false),
      landDocuments: z.boolean().optional().default(false),
      notes: z.string().optional().default(''),
    }).optional().default({}),
    totalAgreedAmount: z.coerce.number().min(0).default(0),
    step1_advance: z.coerce.number().min(0).default(0),
    step2_offerApproval: z.coerce.number().min(0).default(0),
    step3_delivery: z.coerce.number().min(0).default(0),
    extraData: z.record(z.any()).optional().default({}),
    remarks: z.string().optional().default(''),
  }),
});

export const updateCaseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid case ID format'),
  }),
  body: createCaseSchema.shape.body.partial(),
});

export const updateCasePaymentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid case ID format'),
  }),
  body: z.object({
    step1_advance: z.coerce.number().min(0).optional(),
    step2_offerApproval: z.coerce.number().min(0).optional(),
    step3_delivery: z.coerce.number().min(0).optional(),
    totalAgreedAmount: z.coerce.number().min(0).optional(),
  }),
});

export const updateCaseStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid case ID format'),
  }),
  body: z.object({
    status: z.enum([
      'ENTRY',
      'PROCESSING',
      'APPROVED_OFFER_LETTER',
      'SUBMITTED_EMBASSY_BSF',
      'COMPLETED_DELIVERED',
      'REJECTED',
      'ON_HOLD',
    ]),
    remarks: z.string().optional(),
  }),
});

export const listCasesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.string().optional(),
    caseType: z.string().optional(),
  }),
});

export default {
  createCaseSchema,
  updateCaseSchema,
  updateCasePaymentSchema,
  updateCaseStatusSchema,
  listCasesSchema,
};
