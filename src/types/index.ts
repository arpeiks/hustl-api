import * as schema from '@/modules/drizzle/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export type TResult<T> = [T, null] | [null, any];
export type TDatabase = PostgresJsDatabase<typeof schema>;
