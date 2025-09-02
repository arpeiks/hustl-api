import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { TUser } from '../drizzle/schema';
import { WalletService } from './wallet.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { ReqUser } from '../auth/decorators/user.decorator';
import { Controller, Get, Param, Version } from '@nestjs/common';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Auth()
  @Get(':id')
  @Version(VERSION_ONE)
  async HandleGetWalletById(@Param('id') id: number) {
    const data = await this.walletService.HandleGetWalletById(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get()
  @Auth()
  @Version(VERSION_ONE)
  async HandleGetWallets(@ReqUser() user: TUser) {
    const data = await this.walletService.HandleGetWallets(user);
    return { data, message: RESPONSE.SUCCESS };
  }
}
