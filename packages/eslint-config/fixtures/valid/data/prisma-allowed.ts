// The data layer is exactly where Prisma belongs.
import { PrismaClient } from '@prisma/client';

export const client = new PrismaClient();
