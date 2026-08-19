import { z } from 'zod';

export const createGuardianAppSchema = z.object({
  body: z.object({
    serviceType: z.string().default('ইন্ডিয়ান ভিসা'),
    customerData: z.object({
      fullName: z.string().min(2, 'Customer name is required').trim(),
      nidNumber: z.string().optional().default(''),
      passportNumber: z.string().optional().default(''),
      fatherName: z.string().optional().default(''),
      motherName: z.string().optional().default(''),
      mobileNumber: z.string().optional().default(''),
      email: z.string().optional().default(''),
    }),
    guardianData: z.object({
      fullName: z.string().optional().default(''),
      nidNumber: z.string().optional().default(''),
      fatherName: z.string().optional().default(''),
      motherName: z.string().optional().default(''),
      mobileNumber: z.string().optional().default(''),
      email: z.string().optional().default(''),
      address: z.string().optional().default(''),
      relationship: z.string().optional().default('Father'),
    }),
    requirementDocuments: z.array(z.any()).optional().default([]),
    payment: z.object({
      totalAmount: z.coerce.number().min(0).default(0),
      advancePaid: z.coerce.number().min(0).default(0),
      paymentMethod: z.string().default('Cash'),
      paymentDate: z.string().optional().default(''),
    }).optional().default({}),
    attachments: z.object({
      passportPhoto: z.string().optional().default(''),
      passportScan: z.string().optional().default(''),
      nidScan: z.string().optional().default(''),
      otherFiles: z.array(z.any()).optional().default([]),
    }).optional().default({}),
    status: z.string().default('received'),
    officeNotes: z.string().optional().default(''),
  }),
});

export const updateGuardianAppSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid application ID format'),
  }),
  body: createGuardianAppSchema.shape.body.partial(),
});

export const listGuardianAppSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.string().optional(),
  }),
});

export default { createGuardianAppSchema, updateGuardianAppSchema, listGuardianAppSchema };
