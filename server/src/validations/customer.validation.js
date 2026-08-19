import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Customer full name is required').trim(),
    phone: z.string().min(6, 'Phone number is required').trim(),
    altPhone: z.string().optional().default(''),
    email: z.string().email().optional().or(z.literal('')).default(''),
    nidNumber: z.string().optional().default(''),
    passportNumber: z.string().optional().default(''),
    passportExpiryDate: z.string().optional().default(''),
    birthDate: z.string().optional().default(''),
    gender: z.enum(['Male', 'Female', 'Other']).default('Male'),
    bloodGroup: z.string().optional().default(''),
    maritalStatus: z.string().optional().default(''),
    presentAddress: z.string().optional().default(''),
    permanentAddress: z.string().optional().default(''),
    district: z.string().optional().default(''),
    policeStation: z.string().optional().default(''),
    postCode: z.string().optional().default(''),
    fatherName: z.string().optional().default(''),
    motherName: z.string().optional().default(''),
    spouseName: z.string().optional().default(''),
    guardian: z.object({
      name: z.string().optional().default(''),
      relationship: z.string().optional().default('Father'),
      phone: z.string().optional().default(''),
      nidNumber: z.string().optional().default(''),
      address: z.string().optional().default(''),
    }).optional().default({}),
    attachments: z.object({
      photo: z.string().optional().default(''),
      passportScan: z.string().optional().default(''),
      nidScan: z.string().optional().default(''),
      otherDocuments: z.array(z.any()).optional().default([]),
    }).optional().default({}),
    status: z.enum(['Active', 'Lead', 'Inactive', 'Blacklisted', 'Archived']).default('Active'),
    customerType: z.enum(['Individual', 'Corporate', 'Agent_Referred', 'VIP']).default('Individual'),
    remarks: z.string().optional().default(''),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid customer ID format'),
  }),
  body: createCustomerSchema.shape.body.partial(),
});

export const listCustomersSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.enum(['Active', 'Lead', 'Inactive', 'Blacklisted', 'Archived', 'all']).optional(),
    customerType: z.enum(['Individual', 'Corporate', 'Agent_Referred', 'VIP', 'all']).optional(),
  }),
});

export const lookupCustomerSchema = z.object({
  query: z.object({
    query: z.string().min(1, 'Search query is required'),
  }),
});

export default { createCustomerSchema, updateCustomerSchema, listCustomersSchema, lookupCustomerSchema };
