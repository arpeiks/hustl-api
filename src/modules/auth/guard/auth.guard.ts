import { go } from '@/utils';
import { eq } from 'drizzle-orm';
import { Request } from 'express';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { RESPONSE } from '@/response';
import { User } from '@/modules/drizzle/schema';
import { TokenService } from '@/services/token.service';
import { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { Inject, Injectable, HttpStatus, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

const exception = new UnauthorizedException({
  data: {},
  status: HttpStatus.UNAUTHORIZED,
  message: RESPONSE.NOT_LOGGED_IN,
  timestamp: new Date().toISOString(),
});

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    protected readonly token: TokenService,
    @Inject(DATABASE) protected readonly provider: TDatabase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { accessToken } = this.extractTokensFromHeader(request);

    if (!accessToken) throw exception;
    const [data, error] = await go<JwtPayload, JsonWebTokenError>(() => this.token.verifyAccessToken(accessToken));

    if (error && error.name !== 'TokenExpiredError') throw exception;

    const userId = +data?.sub!;
    const user = await this.provider.query.User.findFirst({
      with: { auth: true, store: true },
      where: eq(User.id, userId),
    });

    if (!user || !user.auth || !user.auth.token || user.auth.token !== accessToken) throw exception;

    request['user'] = user;
    return true;
  }

  private extractTokensFromHeader(request: Request): { accessToken?: string; refreshToken?: string } {
    const [type, reqAccesstoken] = request.headers.authorization?.split(' ') ?? [];
    const accessToken = type === 'Bearer' ? reqAccesstoken : undefined;

    return { accessToken };
  }
}
