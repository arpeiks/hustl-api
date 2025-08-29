import {
  Catch,
  Logger,
  HttpStatus,
  ArgumentsHost,
  HttpException,
  ExceptionFilter,
} from '@nestjs/common';
import { HUSTL } from '../consts';
import { Response } from 'express';
import { RESPONSE } from '../response';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const logger = new Logger();
    const ctx = host.switchToHttp();
    const timestamp = new Date().toISOString();
    const response = ctx.getResponse<Response>();
    response.setHeader('x-powered-by', HUSTL);

    const errResponse: any =
      exception instanceof HttpException ? exception.getResponse() : null;

    const data = errResponse ? errResponse.data : {};
    const message = errResponse ? errResponse.message : RESPONSE.SERVER_ERROR;

    const status = errResponse
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const technicalMessage =
      errResponse?.technicalMessage ||
      errResponse?.message ||
      RESPONSE.SERVER_ERROR;

    logger.error(technicalMessage, exception, 'ErrorHandler');
    response.status(status).json({ status, message, timestamp, data });
  }
}
