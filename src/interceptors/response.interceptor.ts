import { map } from 'rxjs/operators';
import { RESPONSE } from '../response';
import { Response as IResponse, Request as IRequest } from 'express';
import { Injectable, CallHandler, NestInterceptor, ExecutionContext } from '@nestjs/common';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, nextCallHandler: CallHandler) {
    const skipPaths = ['/', '/health', '/health-check', '/auth/ably', '/api/auth/ably', 'api/auth/ably'];

    let url = context.switchToHttp().getRequest<IRequest>().url;
    url = url.replaceAll('/api/v1', '');
    url = new URL(url, 'http://localhost').pathname;

    const status = context.switchToHttp().getResponse<IResponse>().statusCode;
    if (skipPaths.includes(url)) return nextCallHandler.handle();

    return nextCallHandler.handle().pipe(
      map((res) => {
        const timestamp = new Date().toISOString();
        const message = res?.message ?? RESPONSE.SUCCESS;
        return { status, message, timestamp, data: res?.data ?? {} };
      }),
    );
  }
}
