import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().lte(65535).default(5092),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DB_NAME: z.string().min(1).default("monsuralitravels"),
  ACCESS_TOKEN_SECRET: z.string().min(20, "ACCESS_TOKEN_SECRET is required"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_MS: z.coerce.number().int().positive().default(30 * 24 * 60 * 60 * 1000),
  ALLOW_SUPER_ADMIN_CREATION: z.coerce.boolean().default(false),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  ALLOWED_ORIGINS: z.string().default("http://localhost:8001,http://localhost:8005,http://localhost:3000"),
  FRONTEND_DOMAIN_KEYWORDS: z.string().default("localhost,monsuralitravelsbd.com"),
  DASHBOARD_DOMAIN_KEYWORDS: z.string().default("dashboard,localhost:8005"),
  SMTP_HOST: z.string().default("aberi.us.svlogins.com"),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_ENCRYPTION: z.string().default("SSL"),
  SMTP_USER: z.string().default("info@monsuralitravels.com"),
  SMTP_PASSWORD: z.string().default(""),
  SMTP_FROM_NAME: z.string().default("Monsur Ali Travels"),
  SMTP_FROM: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default("monsuralitravels-erp-docs"),
  R2_ENDPOINT: z.string().optional(),
  R2_PUBLIC_DOMAIN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errorMessages = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Environment validation failed: ${errorMessages}`);
}

export const env = parsed.data;
