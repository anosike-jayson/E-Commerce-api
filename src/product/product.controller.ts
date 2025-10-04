import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  Query, UseGuards 
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth-guard';
import { Roles } from 'src/auth/jwt/jwt-roles-decorator';
import { RolesGuard } from 'src/auth/jwt/jwt-roles-guard';
import { UserRole } from 'src/entities/user.entity';
import { CreateProductDto, FilterProductsDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './product.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterProductsDto) {
    return this.productsService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}