import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartItem } from 'src/entities/cart-item.entity';
import { Cart } from 'src/entities/cart.entity';
import { ProductsModule } from 'src/product/product.module';
import { UsersModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    ProductsModule,
    UsersModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}