import { CatalogService } from './catalog.service';
import { Module, OnModuleInit } from '@nestjs/common';
import { TokenService } from '@/services/token.service';
import { CatalogController } from './catalog.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  exports: [CatalogService],
  imports: [CloudinaryModule],
  controllers: [CatalogController],
  providers: [CatalogService, TokenService],
})
export class CatalogModule implements OnModuleInit {
  constructor(private readonly catalogService: CatalogService) {}

  async onModuleInit() {
    try {
      await this.catalogService.seedDatabase();
    } catch (error) {
      console.error('Failed to seed database:', error);
    }
  }
}
