import config from '@/config';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';
import { WalletModule } from '../wallet/wallet.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { ServiceModule } from '../service/service.module';
import { CurrencyModule } from '../currency/currency.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { NotificationModule } from '../notification/notification.module';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  providers: [AppService],
  controllers: [AppController],
  imports: [
    AuthModule,
    CacheModule,
    WalletModule,
    DrizzleModule,
    ServiceModule,
    CurrencyModule,
    SubscriptionModule,
    NotificationModule,
    OrderModule,
    ProductModule,
    CatalogModule,
    ConfigModule.forRoot({ load: [config], isGlobal: true }),
  ],
})
export class AppModule {}
