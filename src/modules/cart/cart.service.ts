import * as Dto from './dto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { eq, and } from 'drizzle-orm';
import { Cart, CartItem, Product, TUser } from '../drizzle/schema';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';

@Injectable()
export class CartService {
  constructor(@Inject(DATABASE) private readonly db: TDatabase) {}

  async getOrCreateCart(userId: number) {
    let cart = await this.db.query.Cart.findFirst({
      where: eq(Cart.userId, userId),
      with: {
        items: { with: { product: { with: { productSizes: true, brand: true, category: true, currency: true } } } },
      },
    });

    if (!cart) {
      const [newCart] = await this.db.insert(Cart).values({ userId }).returning();
      cart = await this.db.query.Cart.findFirst({
        where: eq(Cart.id, newCart.id),
        with: {
          items: { with: { product: { with: { productSizes: true, brand: true, category: true, currency: true } } } },
        },
      });
    }

    if (!cart) throw new Error('failed to create cart');

    return cart;
  }

  async addToCart(user: TUser, body: Dto.AddToCartBody) {
    const cart = await this.getOrCreateCart(user.id);

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

  async updateCartItem(userId: number, itemId: number, body: Dto.UpdateCartItemBody) {
    const cart = await this.getOrCreateCart(userId);

    const [updatedItem] = await this.db
      .update(CartItem)
      .set({ quantity: body.quantity, updatedAt: new Date() })
      .where(and(eq(CartItem.id, itemId), eq(CartItem.cartId, cart.id)))
      .returning();

    if (!updatedItem) {
      throw new NotFoundException('Cart item not found');
    }

    return updatedItem;
  }

  async removeFromCart(userId: number, itemId: number) {
    const cart = await this.getOrCreateCart(userId);

    await this.db.delete(CartItem).where(and(eq(CartItem.id, itemId), eq(CartItem.cartId, cart.id)));

    return { success: true };
  }

  async clearCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);

    await this.db.delete(CartItem).where(eq(CartItem.cartId, cart.id));

    return { success: true };
  }

  async getCart(userId: number) {
    return await this.getOrCreateCart(userId);
  }
}
