import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { AuthService } from './auth.service';
import { Body, Controller, Post, Version } from '@nestjs/common';

@Controller('/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Version(VERSION_ONE)
  @Post('/password/reset/code')
  async HandleSendPasswordResetCode(@Body() body: Dto.SendPhoneVerificationCodeBody) {
    const data = await this.auth.HandleSendPhoneVerificationCode(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Version(VERSION_ONE)
  @Post('/verify/phone/code')
  async HandleSendPhoneVerificationCode(@Body() body: Dto.SendPhoneVerificationCodeBody) {
    const data = await this.auth.HandleSendPhoneVerificationCode(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Version(VERSION_ONE)
  @Post('/verify/phone')
  async HandleVerifyPhone(@Body() body: Dto.VerifyPhoneBody) {
    const data = await this.auth.HandleVerifyPhone(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Version(VERSION_ONE)
  @Post('/password/reset')
  async HandleResetPassword(@Body() body: Dto.VerifyPhoneBody) {
    const data = await this.auth.HandleVerifyPhone(body);
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
}
