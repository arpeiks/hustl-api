import 'dotenv/config';
import { isLocalDb } from '@/utils';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  verbose: true,
  dialect: 'postgresql',
  casing: 'snake_case',
  out: './drizzle/migrations',
  schema: './src/modules/drizzle/schema.ts',
  dbCredentials: { url: process.env.DATABASE_URL!, ssl: isLocalDb ? undefined : { rejectUnauthorized: false } },
});
