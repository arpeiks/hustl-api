import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { TokenService } from '@/services/token.service';
import { ProductController } from './product.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  exports: [ProductService],
  controllers: [ProductController],
  providers: [TokenService, ProductService],
  imports: [CloudinaryModule, NotificationModule],
})
export class ProductModule {}
