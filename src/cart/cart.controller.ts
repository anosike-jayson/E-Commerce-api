import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Request 
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth-guard';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    const cart = await this.cartService.getCart(req.user.userId);
    const total = await this.cartService.getCartTotal(req.user.userId);
    return { cart, total };
  }

  @Post('items')
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, addToCartDto);
  }

  @Patch('items/:itemId')
  updateCartItem(
    @Request() req,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user.userId, itemId, updateDto);
  }

  @Delete('items/:itemId')
  removeFromCart(@Request() req, @Param('itemId') itemId: string) {
    return this.cartService.removeFromCart(req.user.userId, itemId);
  }

  @Delete()
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}