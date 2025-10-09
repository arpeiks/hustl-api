import config from '@/config';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from '../auth/auth.module';
import { CartModule } from '../cart/cart.module';
import { SeedModule } from '../seed/seed.module';
import { BankModule } from '../bank/bank.module';
import { CacheModule } from '../cache/cache.module';
import { OrderModule } from '../order/order.module';
import { StoreModule } from '../store/store.module';
import { WalletModule } from '../wallet/wallet.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { ServiceModule } from '../service/service.module';
import { ProductModule } from '../product/product.module';
import { CatalogModule } from '../catalog/catalog.module';
import { CurrencyModule } from '../currency/currency.module';
import { PaystackModule } from '../paystack/paystack.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  providers: [AppService],
  controllers: [AppController],
  imports: [
    AuthModule,
    CartModule,
    SeedModule,
    BankModule,
    CacheModule,
    OrderModule,
    StoreModule,
    WalletModule,
    DrizzleModule,
    ServiceModule,
    ProductModule,
    CatalogModule,
    CurrencyModule,
    PaystackModule,
    SubscriptionModule,
    NotificationModule,
    ConfigModule.forRoot({ load: [config], isGlobal: true }),
  ],
})
export class AppModule {}
