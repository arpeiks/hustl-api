import {
  Inject,
  Injectable,
  ConflictException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

import * as Dto from './dto';
import { TDatabase } from '@/types';
import { DATABASE } from '@/consts';
import { and, eq, gte, or } from 'drizzle-orm';
import { generateOtp, minutesFromNow } from '@/utils';
import { ArgonService } from '@/services/argon.service';
import { TokenService } from '@/services/token.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Otp, Auth, User, TUser, Wallet, UserService, Subscription, NotificationSetting } from '../drizzle/schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly argon: ArgonService,
    private readonly token: TokenService,
    private readonly cloudinary: CloudinaryService,
    @Inject(DATABASE) private readonly provider: TDatabase,
  ) {}

  async HandleCreateAccount(body: Dto.CreateAccountBody) {
    const existingUser = await this.provider.query.User.findFirst({
      columns: { id: true, phone: true, email: true },
      where: or(eq(User.email, body.email), eq(User.phone, body.phone)),
    });

    const sameEmail = existingUser?.email === body.email;
    const samePhone = existingUser?.phone === body.phone;

    if (samePhone) throw new ConflictException('user with this phone already exists');
    if (sameEmail) throw new ConflictException('user with this email already exists');

    const expiredAt = minutesFromNow(10);
    const code = Math.random() < 10 ? '0000' : generateOtp(4);
    const hashedPassword = await this.argon.hash(body.password);
    const currencies = await this.provider.query.Currency.findMany();

    const result = await this.provider.transaction(async (tx) => {
      const [user] = await tx
        .insert(User)
        .values({ fullName: body.phone, role: 'user', phone: body.phone, email: body.email })
        .returning();

      const token = this.token.generateAccessToken({ sub: user.id });
      await tx.insert(NotificationSetting).values({ userId: user.id });
      await tx.insert(Auth).values({ userId: user.id, token, password: hashedPassword });
      await tx.insert(Otp).values({ code, identifier: body.phone, type: 'PHONE_VERIFICATION', expiredAt });
      for (const currency of currencies) await tx.insert(Wallet).values({ userId: user.id, currencyId: currency.id });

      return { ...user, token };
    });

    return result;
  }

  async HandleVerifyPhone(body: Dto.VerifyPhoneBody) {
    const user = await this.provider.query.User.findFirst({ where: eq(User.phone, body.phone) });
    if (!user?.id) throw new UnauthorizedException('invalid or expired verification code');

    const otp = await this.provider.query.Otp.findFirst({
      where: and(
        eq(Otp.code, body.code),
        eq(Otp.identifier, body.phone),
        gte(Otp.expiredAt, new Date()),
        eq(Otp.type, 'PHONE_VERIFICATION'),
      ),
    });

    if (!otp?.id) throw new UnauthorizedException('invalid or expired verification code');

    await this.provider.transaction(async (tx) => {
      await tx.delete(Otp).where(eq(Otp.id, otp.id));
      await tx.update(User).set({ phoneVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(User.id, user.id));
    });

    return {};
  }

  async HandleVerifyEmail(body: Dto.VerifyEmailBody) {
    const user = await this.provider.query.User.findFirst({ where: eq(User.email, body.email) });

    if (!user?.id) throw new UnauthorizedException('invalid or expired verification code');

    const otp = await this.provider.query.Otp.findFirst({
      where: and(
        eq(Otp.code, body.code),
        eq(Otp.identifier, body.email),
        gte(Otp.expiredAt, new Date()),
        eq(Otp.type, 'EMAIL_VERIFICATION'),
      ),
    });

    if (!otp?.id) throw new UnauthorizedException('invalid or expired verification code');

    await this.provider.transaction(async (tx) => {
      await tx.delete(Otp).where(eq(Otp.id, otp.id));
      await tx.update(User).set({ emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(User.id, user.id));
    });

    return {};
  }

  async HandleLogin(body: Dto.LoginBody) {
    const user = await this.provider.query.User.findFirst({ with: { auth: true }, where: eq(User.phone, body.phone) });
    if (!user?.id || !user.auth?.password) throw new UnauthorizedException('invalid credentials');

    const isPasswordValid = await this.argon.verify(body.password, user.auth.password);
    if (!isPasswordValid) throw new UnauthorizedException('invalid credentials');

    const token = this.token.generateAccessToken({ sub: user.id });

    await this.provider.update(Auth).set({ token, updatedAt: new Date() }).where(eq(Auth.userId, user.id));

    return { ...user, auth: undefined, token };
  }

  async HandleLogout(user: TUser) {
    if (!user?.id) return {};

    await this.provider.update(Auth).set({ token: null, updatedAt: new Date() }).where(eq(Auth.userId, user.id));
    return {};
  }

  async HandleSendEmailVerificationCode(body: Dto.SendEmailVerificationCodeBody) {
    const user = await this.provider.query.User.findFirst({ where: eq(User.email, body.email) });

    if (!user?.id) return {};
    if (user.emailVerifiedAt) return {};

    const code = Math.random() < 10 ? '0000' : generateOtp(4);

    await this.provider.insert(Otp).values({
      code,
      identifier: body.email,
      type: 'EMAIL_VERIFICATION',
      expiredAt: minutesFromNow(10),
    });

    return {};
  }

  async HandleSendPasswordResetCode(body: Dto.SendPasswordResetCodeBody) {
    const user = await this.provider.query.User.findFirst({
      where: or(eq(User.email, body.identifier), eq(User.phone, body.identifier)),
    });

    if (!user?.id) return {};

    const isEmail = body.identifier.includes('@');
    const isPhone = !isEmail;

    if (isEmail && !user.emailVerifiedAt) throw new UnprocessableEntityException();
    if (isPhone && !user.phoneVerifiedAt) throw new UnprocessableEntityException();

    const otpType = isEmail ? 'EMAIL_PASSWORD_RESET' : 'PHONE_PASSWORD_RESET';
    const code = Math.random() < 10 ? '0000' : generateOtp(4);

    await this.provider.insert(Otp).values({
      code,
      type: otpType,
      identifier: body.identifier,
      expiredAt: minutesFromNow(10),
    });

    return {};
  }

  async HandleResetPassword(body: Dto.ResetPasswordBody) {
    const user = await this.provider.query.User.findFirst({
      where: or(eq(User.email, body.identifier), eq(User.phone, body.identifier)),
    });

    if (!user?.id) throw new UnauthorizedException('invalid or expired verification code');

    const isEmail = body.identifier.includes('@');
    const isPhone = !isEmail;

    if (isEmail && !user.emailVerifiedAt) throw new UnprocessableEntityException();
    if (isPhone && !user.phoneVerifiedAt) throw new UnprocessableEntityException();

    const expectedOtpType = isEmail ? 'EMAIL_PASSWORD_RESET' : 'PHONE_PASSWORD_RESET';

    const otp = await this.provider.query.Otp.findFirst({
      where: and(
        eq(Otp.code, body.code),
        gte(Otp.expiredAt, new Date()),
        eq(Otp.type, expectedOtpType),
        eq(Otp.identifier, body.identifier),
      ),
    });

    if (!otp?.id) throw new UnauthorizedException('invalid or expired verification code');

    const hashedPassword = await this.argon.hash(body.password);

    await this.provider.transaction(async (tx) => {
      await tx.delete(Otp).where(eq(Otp.id, otp.id));
      await tx
        .update(Auth)
        .set({ token: null, password: hashedPassword, updatedAt: new Date() })
        .where(eq(Auth.userId, user.id));
    });

    return {};
  }

  async HandleGetAuth(user: TUser) {
    const services = await this.provider.query.UserService.findMany({
      with: { service: true },
      where: eq(UserService.userId, user.id),
    });

    const subscription = await this.provider.query.Subscription.findFirst({
      with: { plan: { with: { features: { with: { feature: true } } } } },
      where: and(eq(Subscription.userId, user.id), eq(Subscription.status, 'active')),
    });

    return { ...user, services, subscription, auth: undefined };
  }

  async HandleUpdateProfile(user: TUser, body: Dto.UpdateProfileBody) {
    const [updatedUser] = await this.provider
      .update(User)
      .set({ ...user, ...body })
      .where(eq(User.id, user.id))
      .returning();

    return updatedUser;
  }

  async HandleUploadAvatar(user: TUser, file: Express.Multer.File) {
    const avatar = await this.cloudinary.upload(file, 'profile-photos');

    const [updatedUser] = await this.provider
      .update(User)
      .set({ avatar, updatedAt: new Date() })
      .where(eq(User.id, user.id))
      .returning();

    return updatedUser;
  }
}
