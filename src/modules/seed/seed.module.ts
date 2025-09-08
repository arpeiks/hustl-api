import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { ArgonService } from '../../services/argon.service';

@Module({
  exports: [SeedService],
  imports: [DrizzleModule],
  controllers: [SeedController],
  providers: [SeedService, ArgonService],
})
export class SeedModule {}
