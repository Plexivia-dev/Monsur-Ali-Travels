import { PrismaClient } from '@prisma/client';
import env from './env.js';

/**
 * Global Prisma Client Singleton instance
 * Configured with query logging in development and client extensions for soft-delete
 */

const logOptions = env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'];

const basePrisma = new PrismaClient({
  log: logOptions,
});

/**
 * Extended Prisma Client with automatic soft-delete handling
 */
export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async findMany({ model, operation, args, query }) {
        args.where = { isActive: true, ...args.where };
        return query(args);
      },
      async findFirst({ model, operation, args, query }) {
        args.where = { isActive: true, ...args.where };
        return query(args);
      },
      async count({ model, operation, args, query }) {
        args.where = { isActive: true, ...args.where };
        return query(args);
      },
      async delete({ model, operation, args, query }) {
        // Intercept hard delete and convert to soft delete
        return basePrisma[model.toLowerCase()].update({
          where: args.where,
          data: { isActive: false },
        });
      },
    },
  },
});

/**
 * Connect to PostgreSQL database and test connectivity
 * @returns {Promise<boolean>}
 */
export async function testDatabaseConnection() {
  try {
    await basePrisma.$connect();
    console.log('✅ PostgreSQL Database connected successfully via Prisma');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL database:', error.message);
    return false;
  }
}

export default prisma;
