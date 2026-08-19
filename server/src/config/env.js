import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @typedef {Object} EnvConfig
 * @property {string} NODE_ENV - Runtime environment
 * @property {number} PORT - HTTP server port
 * @property {string} DATABASE_URL - PostgreSQL connection URL
 * @property {string} JWT_SECRET - JWT secret key
 * @property {string} JWT_EXPIRES_IN - JWT expiry duration
 * @property {string} REFRESH_TOKEN_SECRET - Refresh token secret
 * @property {string} REFRESH_TOKEN_EXPIRES_IN - Refresh token expiry duration
 * @property {string} UPLOAD_PATH - Uploads directory path
 * @property {string} DOCUMENT_PATH - Documents directory path
 * @property {number} MAX_FILE_SIZE_MB - Max upload file size in MB
 * @property {string[]} CORS_ORIGINS - Allowed CORS origins
 */

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5092),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().default('monsuralitravels_super_secret_access_token_jwt_2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().default('monsuralitravels_super_secret_refresh_token_jwt_2026'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  UPLOAD_PATH: z.string().default('./uploads'),
  DOCUMENT_PATH: z.string().default('./documents'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(25),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:8005,http://localhost:8006,https://dashboard.monsuralitravelsbd.com,https://monsuralitravelsbd.com'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

/** @type {EnvConfig} */
export const env = {
  ...parsedEnv.data,
  CORS_ORIGINS: parsedEnv.data.CORS_ORIGIN.split(',').map((o) => o.trim()),
};

export default env;
