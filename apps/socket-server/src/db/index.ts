import { getPrisma } from '@repo/db/client';
import { PrismaClient } from '@prisma/client/edge'
import { DATABASE_URL } from '../config/config';

export const db: PrismaClient = getPrisma({ DATABASE_URL: DATABASE_URL });
