import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { OrderStatus } from 'src/entities/order.entity';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}