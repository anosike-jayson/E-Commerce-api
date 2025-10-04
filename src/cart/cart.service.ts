import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from 'src/entities/cart-item.entity';
import { Cart } from 'src/entities/cart.entity';
import { ProductsService } from 'src/product/product.service';
import { UsersService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private productsService: ProductsService,
    private usersService: UsersService,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      cart = this.cartRepository.create({ user });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity } = addToCartDto;

    const product = await this.productsService.findOne(productId);
    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    if (product.stock < quantity) {
      throw new BadRequestException(`Only ${product.stock} items available in stock`);
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = cart.items.find(item => item.product.id === productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(`Only ${product.stock} items available in stock`);
      }
      existingItem.quantity = newQuantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
        priceAtAdd: product.price,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return this.getOrCreateCart(userId);
  }

  async updateCartItem(userId: string, itemId: string, updateDto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find(i => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    const product = await this.productsService.findOne(item.product.id);
    if (product.stock < updateDto.quantity) {
      throw new BadRequestException(`Only ${product.stock} items available in stock`);
    }

    item.quantity = updateDto.quantity;
    await this.cartItemRepository.save(item);

    return this.getOrCreateCart(userId);
  }

  async removeFromCart(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find(i => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(item);
    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    if (cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }
  }

  async getCartTotal(userId: string): Promise<number> {
    const cart = await this.getOrCreateCart(userId);
    return cart.items.reduce((total, item) => {
      return total + (Number(item.priceAtAdd) * item.quantity);
    }, 0);
  }

  async getCart(userId: string): Promise<Cart> {
    return this.getOrCreateCart(userId);
  }
}
