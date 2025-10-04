import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartService } from 'src/cart/cart.service';
import { OrderItem } from 'src/entities/order-item.entity';
import { Order, OrderStatus } from 'src/entities/order.entity';
import { ProductsService } from 'src/product/product.service';
import { UsersService } from 'src/user/user.service';
import { Repository, DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private cartService: CartService,
    private productsService: ProductsService,
    private usersService: UsersService,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartService.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const cartItem of cart.items) {
        const product = await this.productsService.findOne(cartItem.product.id);
        
        if (!product.isActive) {
          throw new BadRequestException(`Product ${product.name} is no longer available`);
        }

        if (product.stock < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}. Only ${product.stock} available`,
          );
        }
      }

      const totalAmount = cart.items.reduce((total, item) => {
        return total + (Number(item.product.price) * item.quantity);
      }, 0);

      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const order = this.ordersRepository.create({
        user: user,
        totalAmount,
        shippingAddress: createOrderDto.shippingAddress,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      for (const cartItem of cart.items) {
        const orderItem = this.orderItemsRepository.create({
          order: savedOrder,
          product: cartItem.product,
          quantity: cartItem.quantity,
          priceAtOrder: cartItem.product.price,
        });

        await queryRunner.manager.save(OrderItem, orderItem);

        await this.productsService.decrementStock(
          cartItem.product.id,
          cartItem.quantity,
        );
      }

      await this.cartService.clearCart(userId);

      await queryRunner.commitTransaction();

      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.ordersRepository.save(order);
  }

  async cancelOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.user.id !== userId) {
      throw new BadRequestException('You can only cancel your own orders');
    }

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel orders that have been shipped or delivered');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    for (const item of order.items) {
      const product = await this.productsService.findOne(item.product.id);
      product.stock += item.quantity;
      await this.productsService.update(product.id, { stock: product.stock });
    }

    order.status = OrderStatus.CANCELLED;
    return this.ordersRepository.save(order);
  }

  async findAllOrders(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['items', 'items.product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }
}
