import config from '@/config';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { ServiceModule } from '../service/service.module';
import { CurrencyModule } from '../currency/currency.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  providers: [AppService],
  controllers: [AppController],
  imports: [
    AuthModule,
    CacheModule,
    DrizzleModule,
    ServiceModule,
    CurrencyModule,
    SubscriptionModule,
    ConfigModule.forRoot({ load: [config], isGlobal: true }),
  ],
})
export class AppModule {}
