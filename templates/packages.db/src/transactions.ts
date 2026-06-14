import type { Prisma, PrismaClient } from '../generated/prisma/client.js';

export type DbTransactionClient = Prisma.TransactionClient;
export type DbClient = PrismaClient | DbTransactionClient;

/**
 * Runs a callback inside a Prisma transaction.
 * @param prisma - Prisma client that owns the transaction.
 * @param callback - Work to execute with the transaction-scoped client.
 * @returns the callback result after the transaction commits.
 */
export const runInTransaction = async <T>(
  prisma: PrismaClient,
  callback: (tx: DbTransactionClient) => Promise<T>,
): Promise<T> => prisma.$transaction((tx) => callback(tx));
