import { z } from 'zod';

export const createAgreementSchema = z.object({
  body: z.object({
    companyInfo: z.record(z.any()),
    partyInfo: z.object({
      কর্মচারীর_পূর্ণ_নাম: z.string().min(2, 'Employee name is required').trim(),
      জাতীয়_পরিচয়পত্র_পাসপোর্ট: z.string().optional().default(''),
      কর্মচারীর_ইমেইল: z.string().optional().default(''),
      পিতা_স্বামীর_নাম: z.string().optional().default(''),
      বর্তমান_স্থায়ী_ঠিকানা: z.string().optional().default(''),
    }),
    guardianInfo: z.record(z.any()).optional().default({}),
    positionInfo: z.record(z.any()).optional().default({}),
    salaryStructure: z.record(z.any()).optional().default({}),
    leavePolicy: z.record(z.any()).optional().default({}),
    witnesses: z.record(z.any()).optional().default({}),
    status: z.string().default('active'),
  }),
});

export const createSalarySlipSchema = z.object({
  body: z.object({
    employeeName: z.string().min(2, 'Employee name is required').trim(),
    designation: z.string().optional().default(''),
    monthYear: z.string().min(1, 'Month & Year is required'),
    earnings: z.record(z.any()).default({}),
    deductions: z.record(z.any()).default({}),
    netSalary: z.coerce.number().min(0, 'Net salary is required'),
  }),
});

export const listDocumentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
  }),
});

export default { createAgreementSchema, createSalarySlipSchema, listDocumentsSchema };
