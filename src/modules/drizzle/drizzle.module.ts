import { Pool } from 'pg';
import * as schema from './schema';
import { isLocalDb } from '@/utils';
import { DATABASE } from '@/consts';
import { ConfigService } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';

export const DrizzleDatabaseProvider = {
  provide: DATABASE,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const connectionString = configService.getOrThrow('DATABASE_URL');
    const pool = new Pool({
      connectionString,
      ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
    });
    return drizzle(pool, { schema, casing: 'snake_case' });
  },
};

@Global()
@Module({ exports: [DATABASE], providers: [DrizzleDatabaseProvider] })
export class DrizzleModule {}
