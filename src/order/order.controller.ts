import { 
  Controller, Get, Post, Body, Patch, Param, 
  UseGuards, Request 
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth-guard';
import { Roles } from 'src/auth/jwt/jwt-roles-decorator';
import { RolesGuard } from 'src/auth/jwt/jwt-roles-guard';
import { UserRole } from 'src/entities/user.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrdersService } from './order.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, createOrderDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user.userId);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllOrders() {
    return this.ordersService.findAllOrders();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, updateDto.status);
  }

  @Patch(':id/cancel')
  cancelOrder(@Request() req, @Param('id') id: string) {
    return this.ordersService.cancelOrder(req.user.userId, id);
  }
}