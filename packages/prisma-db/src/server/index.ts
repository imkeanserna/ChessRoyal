import { getPrisma } from '../index';
import { PrismaClient } from '@prisma/client/edge'

export type PrismaClientOrTx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'> | PrismaClient;
export const db: PrismaClient = getPrisma({ DATABASE_URL: process.env.DATABASE_URL! });
