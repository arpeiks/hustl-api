import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(@Inject(DATABASE) private readonly db: TDatabase) {}

  healthCheck() {
    Logger.log('OK', 'HealthCheck');
    return { status: HttpStatus.OK };
  }

  async ping() {
    await this.db.query.Service.findMany({ limit: 1 });
    await this.db.query.Currency.findMany({ limit: 1 });
    return {};
  }
}
