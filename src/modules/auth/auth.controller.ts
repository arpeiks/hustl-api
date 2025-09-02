import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { TUser } from '../drizzle/schema';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { ReqUser } from './decorators/user.decorator';
import { ImageInterceptor } from '@/interceptors/file.interceptor';
import { Body, Controller, Get, Post, Put, Version, UseInterceptors, UploadedFile } from '@nestjs/common';

@Controller('/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Version(VERSION_ONE)
  @Post('/password/reset/code')
  async HandleSendPasswordResetCode(@Body() body: Dto.SendPasswordResetCodeBody) {
    const data = await this.auth.HandleSendPasswordResetCode(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Version(VERSION_ONE)
  @Post('/verify/email/code')
  async HandleSendEmailVerificationCode(@Body() body: Dto.SendEmailVerificationCodeBody) {
    const data = await this.auth.HandleSendEmailVerificationCode(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Version(VERSION_ONE)
  @Post('/password/reset')
  async HandleResetPassword(@Body() body: Dto.ResetPasswordBody) {
    const data = await this.auth.HandleResetPassword(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Version(VERSION_ONE)
  @Post('/verify/phone')
  async HandleVerifyPhone(@Body() body: Dto.VerifyPhoneBody) {
    const data = await this.auth.HandleVerifyPhone(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Version(VERSION_ONE)
  @Post('/verify/email')
  async HandleVerifyEmail(@Body() body: Dto.VerifyEmailBody) {
    const data = await this.auth.HandleVerifyEmail(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put('/avatar')
  @Version(VERSION_ONE)
  @UseInterceptors(ImageInterceptor)
  async HandleUploadAvatar(@ReqUser() user: TUser, @UploadedFile() file: Express.Multer.File) {
    const data = await this.auth.HandleUploadAvatar(user, file);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Post('/create')
  @Version(VERSION_ONE)
  async HandleCreateAccount(@Body() body: Dto.CreateAccountBody) {
    const data = await this.auth.HandleCreateAccount(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Post('/login')
  @Version(VERSION_ONE)
  async HandleLogin(@Body() body: Dto.LoginBody) {
    const data = await this.auth.HandleLogin(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Post('/logout')
  @Version(VERSION_ONE)
  async HandleLogout(@ReqUser() user: TUser) {
    const data = await this.auth.HandleLogout(user);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put('/profile')
  @Version(VERSION_ONE)
  async HandleUpdateProfile(@ReqUser() user: TUser, @Body() body: Dto.UpdateProfileBody) {
    const data = await this.auth.HandleUpdateProfile(user, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get()
  @Auth()
  @Version(VERSION_ONE)
  async HandleGetAuth(@ReqUser() user: TUser) {
    const data = await this.auth.HandleGetAuth(user);
    return { data, message: RESPONSE.SUCCESS };
  }
}
