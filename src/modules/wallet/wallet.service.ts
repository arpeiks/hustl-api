import { eq } from 'drizzle-orm';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { Wallet, TUser } from '../drizzle/schema';
import { Injectable, NotFoundException, Inject } from '@nestjs/common';

@Injectable()
export class WalletService {
  constructor(@Inject(DATABASE) private readonly db: TDatabase) {}

  async HandleGetWallets(user: TUser) {
    return await this.db.query.Wallet.findMany({ with: { currency: true }, where: eq(Wallet.userId, user.id) });
  }

  async HandleGetWalletById(id: number) {
    const wallet = await this.db.query.Wallet.findFirst({
      where: eq(Wallet.id, id),
      with: { currency: true },
    });

    if (!wallet) throw new NotFoundException('wallet not found');
    return wallet;
  }
}
