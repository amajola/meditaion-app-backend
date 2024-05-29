import * as dotenv from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  DB_HOST:  z.string().ip(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_PORT: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

// Load environment variables from .env file
dotenv.config();

// Parse and validate environment variables
const env = envSchema.safeParse(process.env);

// Check for errors
if (!env.success) {
  console.error('Invalid environment variables:', env.error.format());
  process.exit(1);
}

// Access validated environment variables
export const ENV = env.data;
