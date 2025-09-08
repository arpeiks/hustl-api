import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { TokenService } from '@/services/token.service';
import { CatalogController } from './catalog.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  exports: [CatalogService],
  imports: [CloudinaryModule],
  controllers: [CatalogController],
  providers: [CatalogService, TokenService],
})
export class CatalogModule {}
