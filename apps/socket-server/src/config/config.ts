import dotenv from "dotenv";

dotenv.config();

export const REDIS_URL = process.env.REDIS_URL as string;
export const DATABASE_URL = process.env.DATABASE_URL as string;
