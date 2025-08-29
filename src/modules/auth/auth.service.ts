import * as Dto from './dto';
import { TDatabase } from '@/types';
import { DATABASE } from '@/consts';
import { and, eq, gte, or } from 'drizzle-orm';
import { generateOtp, minutesFromNow } from '@/utils';
import { Auth, Otp, User } from '../drizzle/schema';
import { ArgonService } from '@/services/argon.service';
import { TokenService } from '@/services/token.service';
import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly argon: ArgonService,
    private readonly token: TokenService,
    @Inject(DATABASE) private readonly provider: TDatabase,
  ) {}

  async HandleCreateAccount(body: Dto.CreateAccountBody) {
    const existingUser = await this.provider.query.User.findFirst({
      columns: { id: true, phone: true, email: true },
      where: or(eq(User.email, body.email), eq(User.phone, body.phone)),
    });

    const sameEmail = existingUser?.email === body.email;
    const samePhone = existingUser?.phone === body.phone;

    if (samePhone) throw new ConflictException('User with this phone already exists');
    if (sameEmail) throw new ConflictException('User with this email already exists');

    const hashedPassword = await this.argon.hash(body.password);

    return await this.provider.transaction(async (tx) => {
      const [user] = await tx
        .insert(User)
        .values({
          city: body.city,
          role: body.role,
          phone: body.phone,
          niche: body.niche,
          email: body.email,
          state: body.state,
          address: body.address,
          fullName: body.fullName,
        })
        .returning();

      const code = Math.random() < 10 ? '0000' : generateOtp(4);
      await tx.insert(Otp).values({ type: 'PHONE_VERIFICATION', code, userId: user.id, expiredAt: minutesFromNow(10) });

      const token = this.token.generateAccessToken({ sub: user.id });
      await tx.insert(Auth).values({ userId: user.id, token, password: hashedPassword }).returning();

      return { ...user, token };
    });
  }

  async HandleSendPhoneVerificationCode(body: Dto.SendPhoneVerificationCodeBody) {
    const user = await this.provider.query.User.findFirst({
      where: eq(User.phone, body.phone),
      columns: { id: true, phone: true, phoneVerifiedAt: true },
    });

    if (!user?.id) return {};
    if (user.phoneVerifiedAt) return {};

    const otp = await this.provider.query.Otp.findFirst({
      columns: { id: true },
      where: and(eq(Otp.type, 'PHONE_VERIFICATION'), eq(Otp.userId, user.id), gte(Otp.expiredAt, new Date())),
    });

    if (otp?.id) return {};

    const code = Math.random() < 10 ? '0000' : generateOtp(4);

    await this.provider.insert(Otp).values({
      code,
      userId: user.id,
      type: 'PHONE_VERIFICATION',
      expiredAt: minutesFromNow(10),
    });

    return {};
  }

  async HandleVerifyPhone(body: Dto.VerifyPhoneBody) {
    const user = await this.provider.query.User.findFirst({
      where: eq(User.phone, body.phone),
      columns: { id: true, phone: true, phoneVerifiedAt: true },
    });

    if (!user?.id) return {};
    if (user.phoneVerifiedAt) return {};

    const otp = await this.provider.query.Otp.findFirst({
      columns: { id: true },
      where: and(
        eq(Otp.code, body.code),
        eq(Otp.userId, user.id),
        gte(Otp.expiredAt, new Date()),
        eq(Otp.type, 'PHONE_VERIFICATION'),
      ),
    });

    if (!otp?.id) throw new UnauthorizedException('invalid or expired verification code');

    await this.provider
      .update(User)
      .set({ phoneVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(User.id, user.id));

    return {};
  }

  async HandleLogin(body: Dto.LoginBody) {
    const user = await this.provider.query.User.findFirst({
      with: { auth: true },
      where: eq(User.phone, body.phone),
    });

    if (!user?.id || !user.auth?.password) throw new UnauthorizedException('invalid credentials');

    const isPasswordValid = await this.argon.verify(body.password, user.auth.password);
    if (!isPasswordValid) throw new UnauthorizedException('invalid credentials');

    const token = this.token.generateAccessToken({ sub: user.id });

    await this.provider.update(Auth).set({ token, updatedAt: new Date() }).where(eq(Auth.userId, user.id));

    return { ...user, auth: undefined, token };
  }
}
