import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CacheModule } from '../cache/cache.module';
import { ArgonService } from '@/services/argon.service';
import { TokenService } from '@/services/token.service';

@Module({
  imports: [CacheModule],
  controllers: [AuthController],
  providers: [AuthService, ArgonService, TokenService],
})
export class AuthModule {}
