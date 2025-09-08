import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { Version } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Controller, Post } from '@nestjs/common';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('currency')
  @Version(VERSION_ONE)
  async seedCurrency() {
    const result = await this.seedService.seedCurrency();
    return { data: result, message: RESPONSE.SUCCESS };
  }

  @Post('brands')
  @Version(VERSION_ONE)
  async seedBrands() {
    const result = await this.seedService.seedBrands();
    return { data: result, message: RESPONSE.SUCCESS };
  }

  @Post('categories')
  @Version(VERSION_ONE)
  async seedCategories() {
    const result = await this.seedService.seedCategories();
    return { data: result, message: RESPONSE.SUCCESS };
  }

  @Post('sizes')
  @Version(VERSION_ONE)
  async seedSizes() {
    const result = await this.seedService.seedSizes();
    return { data: result, message: RESPONSE.SUCCESS };
  }

  @Post('users')
  @Version(VERSION_ONE)
  async seedUsers() {
    const result = await this.seedService.seedUsers();
    return { data: result, message: RESPONSE.SUCCESS };
  }

  @Post('stores')
  @Version(VERSION_ONE)
  async seedStores() {
    const result = await this.seedService.seedStores();
    return { data: result, message: RESPONSE.SUCCESS };
  }

  @Post('products')
  @Version(VERSION_ONE)
  async seedProducts() {
    const result = await this.seedService.seedProducts();
    return { data: result, message: RESPONSE.SUCCESS };
  }

  @Post('all')
  @Version(VERSION_ONE)
  async seedAll() {
    const result = await this.seedService.seedDatabase();
    return { data: result, message: RESPONSE.SUCCESS };
  }
}
