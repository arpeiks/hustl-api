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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { TUser } from '@/modules/drizzle/schema';
import { ProductService } from './product.service';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { ReqUser } from '@/modules/auth/decorators/user.decorator';
import { MultiImageInterceptor } from '@/interceptors/file.interceptor';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Auth()
  @Get('store')
  @Version(VERSION_ONE)
  async getStoreProducts(@ReqUser() user: TUser, @Query() query: Dto.GetProductsQuery) {
    const data = await this.productService.getStoreProducts(user, query);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Post('review')
  @Version(VERSION_ONE)
  async createProductReview(@ReqUser() user: TUser, @Body() body: Dto.CreateProductReviewBody) {
    const data = await this.productService.createProductReview(user, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Post('size')
  @Version(VERSION_ONE)
  async createProductSize(@ReqUser() user: TUser, @Body() body: Dto.CreateProductSizeBody) {
    const data = await this.productService.createProductSize(user, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get(':id')
  @Version(VERSION_ONE)
  async getProductById(@Param('id') id: number) {
    const data = await this.productService.getProductById(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Delete(':id')
  @Version(VERSION_ONE)
  async deleteProduct(@ReqUser() user: TUser, @Param('id') id: number) {
    const data = await this.productService.deleteProduct(user, id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put(':id')
  @Version(VERSION_ONE)
  @UseInterceptors(MultiImageInterceptor)
  async updateProduct(
    @ReqUser() user: TUser,
    @Param('id') id: number,
    @Body() body: Dto.UpdateProductBody,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const data = await this.productService.updateProduct(user, id, body, files);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Post()
  @Version(VERSION_ONE)
  @UseInterceptors(MultiImageInterceptor)
  async createProduct(
    @ReqUser() user: TUser,
    @Body() body: Dto.CreateProductBody,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const data = await this.productService.createProduct(user, body, files);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get()
  @Auth()
  @Version(VERSION_ONE)
  async getProducts(@Query() query: Dto.GetProductsQuery) {
    const data = await this.productService.getProducts(query);
    return { data, message: RESPONSE.SUCCESS };
  }
}
