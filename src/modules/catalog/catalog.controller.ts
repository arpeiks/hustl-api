import {
  Get,
  Put,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Version,
  Controller,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { CatalogService } from './catalog.service';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { ImageInterceptor } from '@/interceptors/file.interceptor';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Auth()
  @Get('category/:id')
  @Version(VERSION_ONE)
  async getCategoryById(@Param('id') id: number) {
    const data = await this.catalogService.getCategoryById(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put('category/:id')
  @Version(VERSION_ONE)
  async updateCategory(@Param('id') id: number, @Body() body: Dto.UpdateCategoryBody) {
    const data = await this.catalogService.updateCategory(id, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('brand/:id')
  @Version(VERSION_ONE)
  async getBrandById(@Param('id') id: number) {
    const data = await this.catalogService.getBrandById(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Delete('brand/:id')
  @Version(VERSION_ONE)
  async deleteBrand(@Param('id') id: number) {
    const data = await this.catalogService.deleteBrand(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put('brand/:id')
  @Version(VERSION_ONE)
  @UseInterceptors(ImageInterceptor)
  async updateBrand(
    @Param('id') id: number,
    @Body() body: Dto.UpdateBrandBody,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.catalogService.updateBrand(id, body, file);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Version(VERSION_ONE)
  @Delete('category/:id')
  async deleteCategory(@Param('id') id: number) {
    const data = await this.catalogService.deleteCategory(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('size/:id')
  @Version(VERSION_ONE)
  async getSizeById(@Param('id') id: number) {
    const data = await this.catalogService.getSizeById(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put('size/:id')
  @Version(VERSION_ONE)
  async updateSize(@Param('id') id: number, @Body() body: Dto.UpdateSizeBody) {
    const data = await this.catalogService.updateSize(id, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Delete('size/:id')
  @Version(VERSION_ONE)
  async deleteSize(@Param('id') id: number) {
    const data = await this.catalogService.deleteSize(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Post('size')
  @Version(VERSION_ONE)
  async createSize(@Body() body: Dto.CreateSizeBody) {
    const data = await this.catalogService.createSize(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Post('brand')
  @Version(VERSION_ONE)
  @UseInterceptors(ImageInterceptor)
  async createBrand(@Body() body: Dto.CreateBrandBody, @UploadedFile() file?: Express.Multer.File) {
    const data = await this.catalogService.createBrand(body, file);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('brand')
  @Version(VERSION_ONE)
  async getBrands(@Query() query: Dto.GetCatalogQuery) {
    const data = await this.catalogService.getBrands(query);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Post('category')
  @Version(VERSION_ONE)
  async createCategory(@Body() body: Dto.CreateCategoryBody) {
    const data = await this.catalogService.createCategory(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get('category')
  @Version(VERSION_ONE)
  async getCategories(@Query() query: Dto.GetCatalogQuery) {
    const data = await this.catalogService.getCategories(query);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get('size')
  @Version(VERSION_ONE)
  async getSizes(@Query() query: Dto.GetCatalogQuery) {
    const data = await this.catalogService.getSizes(query);
    return { data, message: RESPONSE.SUCCESS };
  }
}
