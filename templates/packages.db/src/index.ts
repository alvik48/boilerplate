import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.js';

export * from '../generated/prisma/client.js';
export * from '../generated/prisma/enums.js';
export * from '../generated/prisma/models.js';
export * from './raw-sql.js';
export * from './transactions.js';

/**
 * Creates a Prisma client connected via the node-postgres adapter.
 * @param connectionString - PostgreSQL connection string
 * @returns configured PrismaClient instance
 */
export const createPrismaClient = (connectionString: string): PrismaClient => {
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
};
