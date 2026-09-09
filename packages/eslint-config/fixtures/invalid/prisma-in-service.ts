// Prisma outside the data layer.
import { PrismaClient } from '@prisma/client';

export const client = new PrismaClient();
