import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ArgonService } from '@/services/argon.service';
import { TokenService } from '@/services/token.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, ArgonService, TokenService],
})
export class AuthModule {}
