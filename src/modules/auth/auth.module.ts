import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailerModule } from '../mailer/mailer.module';
import { TwilioModule } from '../twilio/twilio.module';
import { ArgonService } from '@/services/argon.service';
import { TokenService } from '@/services/token.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, ArgonService, TokenService],
  imports: [CloudinaryModule, MailerModule, TwilioModule],
})
export class AuthModule {}
