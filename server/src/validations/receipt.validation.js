import { z } from 'zod';

export const createReceiptSchema = z.object({
  body: z.object({
    clientName: z.string().min(2, 'Client name is required').trim(),
    clientPhone: z.string().optional().default(''),
    passportNumber: z.string().optional().default(''),
    serviceType: z.string().min(1, 'Service type is required').default('অন্যান্য'),
    purpose: z.string().optional().default(''),
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    amountInWords: z.string().optional().default(''),
    currency: z.string().default('BDT'),
    paymentMethod: z.enum(['Cash', 'Bank_Transfer', 'Mobile_Banking', 'Cheque', 'Other']).default('Cash'),
    customerId: z.string().uuid().optional().nullable(),
    serviceRef: z.object({
      modelName: z.string().optional(),
      docId: z.string().optional(),
      trackingId: z.string().optional(),
    }).optional().default({}),
    notes: z.string().optional().default(''),
    createdByName: z.string().optional().default('ম্যানেজার'),
  }),
});

export const confirmReceiptSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid receipt ID format'),
  }),
  body: z.object({
    confirmedByName: z.string().optional().default('একাউন্ট্যান্ট / ক্যাশিয়ার'),
    paymentMethod: z.enum(['Cash', 'Bank_Transfer', 'Mobile_Banking', 'Cheque', 'Other']).optional(),
    notes: z.string().optional(),
  }),
});

export const cancelReceiptSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid receipt ID format'),
  }),
  body: z.object({
    reason: z.string().optional().default('Cancelled by user'),
  }),
});

export const bankDepositSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid receipt ID format'),
  }),
  body: z.object({
    handedOverToBank: z.boolean(),
    bankDepositRef: z.string().optional().default(''),
    bankDepositDate: z.string().optional(),
  }),
});

export const listReceiptsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'all']).optional(),
    serviceType: z.string().optional(),
    handedOverToBank: z.enum(['true', 'false', 'all']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export default {
  createReceiptSchema,
  confirmReceiptSchema,
  cancelReceiptSchema,
  bankDepositSchema,
  listReceiptsSchema,
};
