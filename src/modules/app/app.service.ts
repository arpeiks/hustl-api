import { HttpStatus, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {}

  healthCheck() {
    Logger.log('OK', 'HealthCheck');
    return { status: HttpStatus.OK };
  }
}
