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
  @Delete('item/:id')
  @Version(VERSION_ONE)
  async HandleRemoveFromCart(@ReqUser() user: TUser, @Param('id') itemId: number) {
    const data = await this.cartService.HandleRemoveFromCart(user, itemId);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put('item/:id')
  @Version(VERSION_ONE)
  async HandleUpdateCartItem(
    @ReqUser() user: TUser,
    @Param('id') itemId: number,
    @Body() body: Dto.UpdateCartItemBody,
  ) {
    const data = await this.cartService.HandleUpdateCartItem(user, itemId, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Post('add')
  @Version(VERSION_ONE)
  async HandleAddToCart(@ReqUser() user: TUser, @Body() body: Dto.AddToCartBody) {
    const data = await this.cartService.HandleAddToCart(user, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Delete()
  @Version(VERSION_ONE)
  async HandleClearCart(@ReqUser() user: TUser) {
    const data = await this.cartService.HandleClearCart(user);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get()
  @Auth()
  @Version(VERSION_ONE)
  async HandleGetCart(@ReqUser() user: TUser) {
    const data = await this.cartService.HandleGetCart(user);
    return { data, message: RESPONSE.SUCCESS };
  }
}
