import { z } from 'zod';

export const createInvoiceSchema = z.object({
  body: z.object({
    issueDate: z.string().optional(),
    dueDate: z.string().optional(),
    paymentStatus: z.string().default('Pending'),
    currency: z.string().default('BDT'),
    taxRate: z.coerce.number().min(0).default(0),
    biller: z.record(z.any()),
    client: z.object({
      name: z.string().min(2, 'Client name is required').trim(),
      phone: z.string().optional().default(''),
      email: z.string().optional().default(''),
      address: z.string().optional().default(''),
      passportNo: z.string().optional().default(''),
    }),
    items: z.array(
      z.object({
        description: z.string().min(1, 'Item description is required'),
        quantity: z.coerce.number().min(1).default(1),
        rate: z.coerce.number().min(0).default(0),
        amount: z.coerce.number().min(0).default(0),
      })
    ).min(1, 'At least one invoice item is required'),
    paymentTerms: z.string().optional().default(''),
  }),
});

export const updateInvoiceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid invoice ID format'),
  }),
  body: createInvoiceSchema.shape.body.partial(),
});

export const listInvoiceSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    paymentStatus: z.string().optional(),
  }),
});

export default { createInvoiceSchema, updateInvoiceSchema, listInvoiceSchema };
