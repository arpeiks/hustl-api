import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailerModule } from '../mailer/mailer.module';
import { ArgonService } from '@/services/argon.service';
import { TokenService } from '@/services/token.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [AuthController],
  imports: [CloudinaryModule, MailerModule],
  providers: [AuthService, ArgonService, TokenService],
})
export class AuthModule {}
