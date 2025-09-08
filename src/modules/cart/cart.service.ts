import * as Dto from './dto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { eq, and } from 'drizzle-orm';
import { Cart, CartItem, Product, TUser } from '../drizzle/schema';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';

@Injectable()
export class CartService {
  constructor(@Inject(DATABASE) private readonly db: TDatabase) {}

  async getCart(user: TUser) {
    const cart = await this.db.query.Cart.findFirst({
      where: eq(Cart.userId, user.id),
      with: {
        items: {
          with: {
            productSize: true,
            product: { with: { productSizes: true, brand: true, category: true, currency: true } },
          },
        },
      },
    });

    if (!cart) throw new NotFoundException('cart not found');
    return cart;
  }

  async HandleAddToCart(user: TUser, body: Dto.AddToCartBody) {
    const cart = await this.getCart(user);

    const existingItem = await this.db.query.CartItem.findFirst({
      where: and(
        eq(CartItem.cartId, cart.id),
        eq(CartItem.productId, body.productId),
        body.productSizeId ? eq(CartItem.productSizeId, body.productSizeId) : undefined,
      ),
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + (body.quantity || 1);
      const [updatedItem] = await this.db
        .update(CartItem)
        .set({ quantity: newQuantity, updatedAt: new Date() })
        .where(eq(CartItem.id, existingItem.id))
        .returning();

      return updatedItem;
    }

    const product = await this.db.query.Product.findFirst({ where: eq(Product.id, body.productId) });
    if (!product) throw new NotFoundException('product not found');

    const [newItem] = await this.db
      .insert(CartItem)
      .values({
        cartId: cart.id,
        productId: body.productId,
        quantity: body.quantity || 1,
        productSizeId: body.productSizeId,
      })
      .returning();

    return newItem;
  }

  async HandleUpdateCartItem(user: TUser, itemId: number, body: Dto.UpdateCartItemBody) {
    const cart = await this.getCart(user);

    const [updatedItem] = await this.db
      .update(CartItem)
      .set({ quantity: body.quantity, updatedAt: new Date() })
      .where(and(eq(CartItem.id, itemId), eq(CartItem.cartId, cart.id)))
      .returning();

    if (!updatedItem) return;
    return updatedItem;
  }

  async HandleRemoveFromCart(user: TUser, itemId: number) {
    const cart = await this.getCart(user);
    await this.db.delete(CartItem).where(and(eq(CartItem.id, itemId), eq(CartItem.cartId, cart.id)));
    return {};
  }

  async HandleClearCart(user: TUser) {
    const cart = await this.getCart(user);
    await this.db.delete(CartItem).where(eq(CartItem.cartId, cart.id));
    return {};
  }

  async HandleGetCart(user: TUser) {
    return await this.getCart(user);
  }
}
