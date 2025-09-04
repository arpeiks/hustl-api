import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { TUser } from '../drizzle/schema';
import { CartService } from './cart.service';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { ReqUser } from '@/modules/auth/decorators/user.decorator';
import { Get, Put, Post, Body, Param, Delete, Version, Controller } from '@nestjs/common';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Auth()
  @Post('add')
  @Version(VERSION_ONE)
  async addToCart(@ReqUser() user: TUser, @Body() body: Dto.AddToCartBody) {
    const data = await this.cartService.addToCart(user, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get()
  @Auth()
  @Version(VERSION_ONE)
  async getCart(@ReqUser('id') userId: number) {
    const data = await this.cartService.getCart(userId);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put('item/:id')
  @Version(VERSION_ONE)
  async updateCartItem(
    @ReqUser('id') userId: number,
    @Param('id') itemId: number,
    @Body() body: Dto.UpdateCartItemBody,
  ) {
    const data = await this.cartService.updateCartItem(userId, itemId, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Delete('item/:id')
  @Version(VERSION_ONE)
  async removeFromCart(@ReqUser('id') userId: number, @Param('id') itemId: number) {
    const data = await this.cartService.removeFromCart(userId, itemId);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Delete('clear')
  @Version(VERSION_ONE)
  async clearCart(@ReqUser('id') userId: number) {
    const data = await this.cartService.clearCart(userId);
    return { data, message: RESPONSE.SUCCESS };
  }
}

