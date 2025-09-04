import { Module } from '@nestjs/common';
import { TokenService } from '@/services/token.service';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [ProductController],
  providers: [TokenService, ProductService],
  imports: [CloudinaryModule],
})
export class ProductModule {}
