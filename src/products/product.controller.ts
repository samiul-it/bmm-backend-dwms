import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminUser } from 'src/auth/admin-user.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.services';
// import { IsPhoneNumber } from 'class-validator';
// import { identity } from 'rxjs';

// class CustomerPhoneDto {
//   @IsPhoneNumber('IN')
//   phone: string;
// }
@UseGuards(AuthGuard())
@Controller('product')
export class productController {
  constructor(private productService: ProductService) {}

  @Get()
  async allProduct(@Query('page') page: number) {
    return await this.productService.getAllProduct(page);
  }

  @Get('/getPagination')
  async getPagination(@Query() query: any) {
    return await this.productService.getPagination(query);
  }

  //! Admin-Route --->
  @Post('/create')
  async create(@Body() product: CreateProductDto, @AdminUser() user: any) {
    return await this.productService.createProduct(product, user);
  }

  // @Post('/createBulk')
  // async createBulk(@Body() product: CreateProductDto[]) {
  //   return await this.productService.createProductBulk(product);
  // }
  @Get('/:id')
  async getProductById(@Param('id') id: string) {
    return await this.productService.getProductById(id);
  }

  @Get('/productsByCategory/:id')
  async getProductByCategory(@Param('id') id: string) {
    return await this.productService.getProductByCategory(id);
  }

  // @Get('/:id')
  // async getUserById(@Param('id') id: string) {
  //   return await this.productService.getUserById(id);
  // }
  //! Admin-Route --->
  @Put('/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() product: UpdateProductDto,
    @AdminUser() user: any,
  ) {
    return await this.productService.updateProduct(id, product, user);
  }

  //! Admin-Route --->
  @Delete('/:id')
  async deleteProduct(@Param('id') id: string, @AdminUser() user: any) {
    return await this.productService.deleteProduct(id, user);
  }

  // Update Products By Bulk XLS
  //! Admin-Route --->
  @Post('/createBulk')
  async createBulk(
    @Body() product: CreateProductDto[],
    @AdminUser() user: any,
  ) {
    return await this.productService.updateProductBulk(product, user);
  }
}
